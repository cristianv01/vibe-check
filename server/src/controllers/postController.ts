import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { findOrCreateLocation } from "./locationController";

const prisma = new PrismaClient();

export const getPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { 
      locationId, 
      authorId, 
      limit = 20, 
      offset = 0,
      lat,
      lng,
      radius = 5,
      search
    } = req.query;

    let whereConditions: Prisma.Sql[] = [];

    if (locationId) {
      whereConditions.push(Prisma.sql`p."locationId" = ${parseInt(locationId as string)}`);
    }

    if (authorId) {
      whereConditions.push(Prisma.sql`p."authorId" = ${parseInt(authorId as string)}`);
    }

    // Search in title or content
    if (search) {
      whereConditions.push(
        Prisma.sql`(p.title ILIKE ${`%${search}%`} OR p.content ILIKE ${`%${search}%`})`
      );
    }

    // If coordinates provided, filter by location distance
    if (lat && lng) {
      const latNum = parseFloat(lat as string);
      const lngNum = parseFloat(lng as string);
      const radiusNum = parseFloat(radius as string);

      // Get locations within radius first
      const nearbyLocations = await prisma.$queryRaw`
        SELECT id FROM locations 
        WHERE ST_DWithin(
          coordinates::geography, 
          ST_SetSRID(ST_MakePoint(${lngNum}, ${latNum}), 4326)::geography, 
          ${radiusNum * 1000}
        )
      `;

      const locationIds = (nearbyLocations as any[]).map(loc => loc.id);
      whereConditions.push(Prisma.sql`p."locationId" = ANY(${locationIds})`);
    }

    const completeQuery = Prisma.sql`
      SELECT 
        p.*,
        json_build_object(
          'username', u.username,
          'profilePictureUrl', u."profilePictureUrl"
        ) as author,
        json_build_object(
          'id', l.id,
          'name', l.name,
          'address', l.address,
          'status', l.status,
          'coordinates', json_build_object(
            'longitude', ST_X(l.coordinates::geometry),
            'latitude', ST_Y(l.coordinates::geometry)
          )
        ) as location,
        COALESCE(
          json_agg(
            json_build_object(
              'id', t.id,
              'tagName', t."tagName"
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) as tags
      FROM posts p
      LEFT JOIN users u ON p."authorId" = u.id
      LEFT JOIN locations l ON p."locationId" = l.id
      LEFT JOIN post_tags pt ON p.id = pt."postId"
      LEFT JOIN tags t ON pt."tagId" = t.id
      ${
        whereConditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
          : Prisma.empty
      }
      GROUP BY p.id, u.username, u."profilePictureUrl", l.id, l.name, l.address, l.status
      ORDER BY p."createdAt" DESC
      LIMIT ${parseInt(limit as string)}
      OFFSET ${parseInt(offset as string)}
    `;

    const posts = await prisma.$queryRaw(completeQuery);

    res.json(posts);
  } catch (err: any) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: "Error fetching posts", error: err.message });
  }
};

export const getPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const postQuery = Prisma.sql`
      SELECT 
        p.*,
        json_build_object(
          'username', u.username,
          'profilePictureUrl', u."profilePictureUrl"
        ) as author,
        json_build_object(
          'id', l.id,
          'name', l.name,
          'address', l.address,
          'status', l.status,
          'coordinates', json_build_object(
            'longitude', ST_X(l.coordinates::geometry),
            'latitude', ST_Y(l.coordinates::geometry)
          )
        ) as location,
        COALESCE(
          json_agg(
            json_build_object(
              'id', t.id,
              'tagName', t."tagName"
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) as tags
      FROM posts p
      LEFT JOIN users u ON p."authorId" = u.id
      LEFT JOIN locations l ON p."locationId" = l.id
      LEFT JOIN post_tags pt ON p.id = pt."postId"
      LEFT JOIN tags t ON pt."tagId" = t.id
      WHERE p.id = ${parseInt(id)}
      GROUP BY p.id, u.username, u."profilePictureUrl", l.id, l.name, l.address, l.status
    `;

    const posts = await prisma.$queryRaw(postQuery);
    const post = (posts as any[])[0];

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.json(post);
  } catch (err: any) {
    console.error("Error fetching post:", err);
    res.status(500).json({ message: "Error fetching post", error: err.message });
  }
};

export const createPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { 
      title, 
      content, 
      locationName, 
      locationAddress, 
      latitude, 
      longitude,
      tags = [],
      mediaUrl
    } = req.body;

    // Validate required fields
    if (!content || !locationName || !locationAddress || latitude === undefined || longitude === undefined) {
      res.status(400).json({ 
        message: "Missing required fields: content, locationName, locationAddress, latitude, longitude" 
      });
      return;
    }

    // Validate coordinates (allow 0,0 for manual location input)
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ message: "Invalid coordinates" });
      return;
    }
    
    // If coordinates are provided (not 0,0), validate them
    if (lat !== 0 || lng !== 0) {
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        res.status(400).json({ message: "Invalid coordinates" });
        return;
      }
    }

    // Get authenticated user
    const cognitoId = req.user?.id;
    if (!cognitoId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { cognitoId: cognitoId as string }
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Find or create location
    let location;
    if (lat === 0 && lng === 0) {
      // For manual location input without coordinates, use a default location
      // We'll use a placeholder coordinate that can be updated later
      const createLocationQuery = Prisma.sql`
        INSERT INTO locations (name, address, coordinates, status, "createdAt", "updatedAt")
        VALUES (${locationName}, ${locationAddress}, ST_SetSRID(ST_MakePoint(0, 0), 4326), 'UNVERIFIED', NOW(), NOW())
        RETURNING id, name, address, status
      `;
      const newLocations = await prisma.$queryRaw(createLocationQuery);
      location = (newLocations as any[])[0];
    } else {
      // For geolocated locations, use the existing findOrCreateLocation function
      location = await findOrCreateLocation(
        locationName,
        locationAddress,
        lat,
        lng
      );
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        title: title || null,
        content,
        mediaUrl: mediaUrl || null,
        authorId: user.id,
        locationId: location.id,
      }
    });

    // Handle tags if provided
    if (tags.length > 0) {
      for (const tagName of tags) {
        // Find or create tag
        let tag = await prisma.tag.findUnique({
          where: { tagName }
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: { tagName }
          });
        }

        // Connect tag to post
        await prisma.postTag.create({
          data: {
            postId: post.id,
            tagId: tag.id
          }
        });
      }
    }

    // Return post with full details
    const fullPost = await prisma.post.findUnique({
      where: { id: post.id },
      include: {
        author: {
          select: {
            username: true,
            profilePictureUrl: true
          }
        },
        location: {
          select: {
            id: true,
            name: true,
            address: true,
            status: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                tagName: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(fullPost);
  } catch (err: any) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Error creating post", error: err.message });
  }
};

export const updatePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, mediaUrl, tags } = req.body;

    // TEMPORARY: For testing without auth
    // const userId = req.user?.id;
    // if (!userId) {
    //   res.status(401).json({ message: "User not authenticated" });
    //   return;
    // }

    // Find user by cognitoId
    const userQuery = Prisma.sql`
      SELECT id FROM users WHERE "cognitoId" = 'test-user-123'
    `;
    const users = await prisma.$queryRaw(userQuery);
    const user = (users as any[])[0];

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if post exists and user is author
    const existingPostQuery = Prisma.sql`
      SELECT "authorId" FROM posts WHERE id = ${parseInt(id)}
    `;
    const existingPosts = await prisma.$queryRaw(existingPostQuery);
    const existingPost = (existingPosts as any[])[0];

    if (!existingPost) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    if (existingPost.authorId !== user.id) {
      res.status(403).json({ message: "Not authorized to update this post" });
      return;
    }

    // Update post
    const updateQuery = Prisma.sql`
      UPDATE posts 
      SET title = ${title}, content = ${content}, "mediaUrl" = ${mediaUrl}, "updatedAt" = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    const updatedPosts = await prisma.$queryRaw(updateQuery);
    const updatedPost = (updatedPosts as any[])[0];

    // Handle tags if provided
    if (tags) {
      // Remove existing tags
      await prisma.$executeRaw`
        DELETE FROM post_tags WHERE "postId" = ${parseInt(id)}
      `;

      // Add new tags
      for (const tagName of tags) {
        let tagQuery = Prisma.sql`
          SELECT id FROM tags WHERE "tagName" = ${tagName}
        `;
        let tags = await prisma.$queryRaw(tagQuery);
        let tag = (tags as any[])[0];

        if (!tag) {
          const createTagQuery = Prisma.sql`
            INSERT INTO tags ("tagName") VALUES (${tagName}) RETURNING id
          `;
          const newTags = await prisma.$queryRaw(createTagQuery);
          tag = (newTags as any[])[0];
        }

        await prisma.$executeRaw`
          INSERT INTO post_tags ("postId", "tagId") VALUES (${parseInt(id)}, ${tag.id})
        `;
      }
    }

    res.json(updatedPost);
  } catch (err: any) {
    console.error("Error updating post:", err);
    res.status(500).json({ message: "Error updating post", error: err.message });
  }
};

export const deletePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // TEMPORARY: For testing without auth
    // const userId = req.user?.id;
    // if (!userId) {
    //   res.status(401).json({ message: "User not authenticated" });
    //   return;
    // }

    // Find user by cognitoId
    const userQuery = Prisma.sql`
      SELECT id FROM users WHERE "cognitoId" = 'test-user-123'
    `;
    const users = await prisma.$queryRaw(userQuery);
    const user = (users as any[])[0];

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if post exists
    const postQuery = Prisma.sql`
      SELECT "authorId" FROM posts WHERE id = ${parseInt(id)}
    `;
    const posts = await prisma.$queryRaw(postQuery);
    const post = (posts as any[])[0];

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // Check if user is author or admin
    if (post.authorId !== user.id && req.user?.role !== 'admin') {
      res.status(403).json({ message: "Not authorized to delete this post" });
      return;
    }

    await prisma.$executeRaw`
      DELETE FROM posts WHERE id = ${parseInt(id)}
    `;

    res.json({ message: "Post deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting post:", err);
    res.status(500).json({ message: "Error deleting post", error: err.message });
  }
}; 