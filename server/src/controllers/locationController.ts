import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";

const prisma = new PrismaClient();

export const getLocations = async (
  req: Request,
  res: Response
): Promise<void> => {
    try {
        const {
            favoriteIds,
            latitude,
            longitude,
            radius = 10, // Default 10km radius
            status,
            limit = 50,
            offset = 0,
            search
        } = req.query;

        let whereConditions: Prisma.Sql[] = [];

        if (favoriteIds){
            const favoriteIdsArray = (favoriteIds as string).split(",").map(Number);
            whereConditions.push(Prisma.sql`l.id IN (${Prisma.join(favoriteIdsArray)})`);
        }
        // Filter by status if provided
        if (status && status !== "any") {
        whereConditions.push(
            Prisma.sql`l.status = ${status}::"LocationStatus"`
        );
        }

        // Search by name or address
        if (search) {
        whereConditions.push(
            Prisma.sql`(l.name ILIKE ${`%${search}%`} OR l.address ILIKE ${`%${search}%`})`
        );
        }

        // Geospatial filtering
        if (latitude && longitude) {
            //parsed numbers converted to strings
            const lat = parseFloat(latitude as string);
            const lng = parseFloat(longitude as string);
            const radiusKm = parseFloat(radius as string);

            //POSTGIS
            whereConditions.push(
                Prisma.sql`ST_DWithin(
                l.coordinates::geography,
                ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
                ${radiusKm * 1000}
                )`
            );
        }

        const completeQuery = Prisma.sql`
        SELECT 
          l.id,
          l.name,
          l.address,
          l.status,
          l."claimedByOwnerId",
          l."createdAt",
          l."updatedAt",
          json_build_object(
            'longitude', ST_X(l.coordinates::geometry),
            'latitude', ST_Y(l.coordinates::geometry)
          ) as coordinates,
          CAST(COUNT(p.id) AS INTEGER) as post_count,
          json_agg(
            DISTINCT jsonb_build_object(
              'id', p.id,
              'title', p.title,
              'content', p.content,
              'createdAt', p."createdAt",
              'author', jsonb_build_object(
                'username', u.username,
                'profilePictureUrl', u."profilePictureUrl"
              )
            )
          ) FILTER (WHERE p.id IS NOT NULL) as recent_posts
        FROM locations l
        LEFT JOIN posts p ON l.id = p."locationId"
        LEFT JOIN users u ON p."authorId" = u.id
        ${
          whereConditions.length > 0
            ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
            : Prisma.empty
        }
        GROUP BY l.id, l.name, l.address, l.status, l."claimedByOwnerId", l."createdAt", l."updatedAt"
        ORDER BY post_count DESC, l."createdAt" DESC
        LIMIT ${parseInt(limit as string)}
        OFFSET ${parseInt(offset as string)}
      `;

        //executing a raw query
        const locations = await prisma.$queryRaw(completeQuery);
        //send that response to the frontend
        res.json(locations);
  } catch (error: any) {
    console.error("Error retrieving locations:", error);
    res.status(500).json({ 
      message: `Error retrieving locations: ${error.message}` 
    });
  }
};

export const getLocation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Get location with basic info
    const locationQuery = Prisma.sql`
      SELECT 
        l.id,
        l.name,
        l.address,
        l.status,
        l."claimedByOwnerId",
        l."createdAt",
        l."updatedAt",
        json_build_object(
          'longitude', ST_X(l.coordinates::geometry),
          'latitude', ST_Y(l.coordinates::geometry)
        ) as coordinates,
        CAST(COUNT(p.id) AS INTEGER) as post_count
      FROM locations l
      LEFT JOIN posts p ON l.id = p."locationId"
      WHERE l.id = ${parseInt(id)}
      GROUP BY l.id, l.name, l.address, l.status, l."claimedByOwnerId", l."createdAt", l."updatedAt"
    `;

    const locations = await prisma.$queryRaw(locationQuery);
    const location = (locations as any[])[0];

    if (!location) {
      res.status(404).json({ message: "Location not found" });
      return;
    }

    // Get posts for this location
    const postsQuery = Prisma.sql`
      SELECT 
        p.id,
        p.title,
        p.content,
        p."mediaUrl",
        p."authorId",
        p."locationId",
        p."createdAt",
        p."updatedAt",
        json_build_object(
          'username', u.username,
          'profilePictureUrl', u."profilePictureUrl"
        ) as author,
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
      LEFT JOIN post_tags pt ON p.id = pt."postId"
      LEFT JOIN tags t ON pt."tagId" = t.id
      WHERE p."locationId" = ${parseInt(id)}
      GROUP BY p.id, p.title, p.content, p."mediaUrl", p."authorId", p."locationId", p."createdAt", p."updatedAt", u.username, u."profilePictureUrl"
      ORDER BY p."createdAt" DESC
      LIMIT ${parseInt(limit as string)}
      OFFSET ${parseInt(offset as string)}
    `;

    const posts = await prisma.$queryRaw(postsQuery);

    const locationWithPosts = {
      ...location,
      posts
    };

    res.json(locationWithPosts);
  } catch (err: any) {
    console.error("Error retrieving location:", err);
    res.status(500).json({ 
      message: `Error retrieving location: ${err.message}` 
    });
  }
};

// Find or create location (used when posting)
export const findOrCreateLocation = async (
  name: string, 
  address: string, 
  lat: number, 
  lng: number
) => {
  try {
    // First, try to find existing location within 100 meters
    const existingLocation = await prisma.$queryRaw`
      SELECT id, name, address, status
      FROM locations 
      WHERE ST_DWithin(
        coordinates::geography, 
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, 
        100
      )
      LIMIT 1
    `;

    if ((existingLocation as any[]).length > 0) {
      return (existingLocation as any[])[0];
    }

    // If no existing location found, create new one
    const newLocationQuery = Prisma.sql`
      INSERT INTO locations (name, address, coordinates, status, "createdAt", "updatedAt")
      VALUES (${name}, ${address}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326), 'UNVERIFIED', NOW(), NOW())
      RETURNING id, name, address, status
    `;

    const newLocations = await prisma.$queryRaw(newLocationQuery);
    return (newLocations as any[])[0];
  } catch (err) {
    console.error("Error in findOrCreateLocation:", err);
    throw err;
  }
};

// Verify location (admin/owner only)
export const verifyLocation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['VERIFIED', 'ARCHIVED'].includes(status)) {
      res.status(400).json({ 
        message: "Invalid status. Must be VERIFIED or ARCHIVED" 
      });
      return;
    }

    const updateQuery = Prisma.sql`
      UPDATE locations 
      SET status = ${status}::"LocationStatus", "updatedAt" = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    const updatedLocations = await prisma.$queryRaw(updateQuery);
    const updatedLocation = (updatedLocations as any[])[0];

    if (!updatedLocation) {
      res.status(404).json({ message: "Location not found" });
      return;
    }

    res.json(updatedLocation);
  } catch (err: any) {
    console.error("Error verifying location:", err);
    res.status(500).json({ 
      message: "Error verifying location", 
      error: err.message 
    });
  }
};

// Delete location (admin only)
export const deleteLocation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if location has posts
    const postCountQuery = Prisma.sql`
      SELECT COUNT(*) as post_count
      FROM posts
      WHERE "locationId" = ${parseInt(id)}
    `;

    const postCountResult = await prisma.$queryRaw(postCountQuery);
    const postCount = (postCountResult as any[])[0].post_count;

    if (postCount > 0) {
      res.status(400).json({ 
        message: "Cannot delete location with posts. Archive it instead." 
      });
      return;
    }

    // Delete location
    const deleteQuery = Prisma.sql`
      DELETE FROM locations
      WHERE id = ${parseInt(id)}
    `;

    await prisma.$executeRaw(deleteQuery);

    res.json({ message: "Location deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting location:", err);
    res.status(500).json({ 
      message: "Error deleting location", 
      error: err.message 
    });
  }
}; 