"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.createPost = exports.getPost = exports.getPosts = void 0;
const client_1 = require("@prisma/client");
const locationController_1 = require("./locationController");
const prisma = new client_1.PrismaClient();
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { locationId, authorId, limit = 20, offset = 0, lat, lng, radius = 5, search } = req.query;
        let whereConditions = [];
        if (locationId) {
            whereConditions.push(client_1.Prisma.sql `p."locationId" = ${parseInt(locationId)}`);
        }
        if (authorId) {
            whereConditions.push(client_1.Prisma.sql `p."authorId" = ${parseInt(authorId)}`);
        }
        // Search in title or content
        if (search) {
            whereConditions.push(client_1.Prisma.sql `(p.title ILIKE ${`%${search}%`} OR p.content ILIKE ${`%${search}%`})`);
        }
        // If coordinates provided, filter by location distance
        if (lat && lng) {
            const latNum = parseFloat(lat);
            const lngNum = parseFloat(lng);
            const radiusNum = parseFloat(radius);
            // Get locations within radius first
            const nearbyLocations = yield prisma.$queryRaw `
        SELECT id FROM locations 
        WHERE ST_DWithin(
          coordinates::geography, 
          ST_SetSRID(ST_MakePoint(${lngNum}, ${latNum}), 4326)::geography, 
          ${radiusNum * 1000}
        )
      `;
            const locationIds = nearbyLocations.map(loc => loc.id);
            whereConditions.push(client_1.Prisma.sql `p."locationId" = ANY(${locationIds})`);
        }
        const completeQuery = client_1.Prisma.sql `
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
      ${whereConditions.length > 0
            ? client_1.Prisma.sql `WHERE ${client_1.Prisma.join(whereConditions, " AND ")}`
            : client_1.Prisma.empty}
      GROUP BY p.id, u.username, u."profilePictureUrl", l.id, l.name, l.address, l.status
      ORDER BY p."createdAt" DESC
      LIMIT ${parseInt(limit)}
      OFFSET ${parseInt(offset)}
    `;
        const posts = yield prisma.$queryRaw(completeQuery);
        res.json(posts);
    }
    catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).json({ message: "Error fetching posts", error: err.message });
    }
});
exports.getPosts = getPosts;
const getPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const postQuery = client_1.Prisma.sql `
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
        const posts = yield prisma.$queryRaw(postQuery);
        const post = posts[0];
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        res.json(post);
    }
    catch (err) {
        console.error("Error fetching post:", err);
        res.status(500).json({ message: "Error fetching post", error: err.message });
    }
});
exports.getPost = getPost;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, content, locationName, locationAddress, latitude, longitude, tags = [], mediaUrl } = req.body;
        // Validate required fields
        if (!content || !locationName || !locationAddress || !latitude || !longitude) {
            res.status(400).json({
                message: "Missing required fields: content, locationName, locationAddress, latitude, longitude"
            });
            return;
        }
        // Validate coordinates
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            res.status(400).json({ message: "Invalid coordinates" });
            return;
        }
        // Get authenticated user (replace with your actual auth logic)
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        // Verify user exists
        const user = yield prisma.user.findUnique({
            where: { id: parseInt(userId) }
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Find or create location
        const location = yield (0, locationController_1.findOrCreateLocation)(locationName, locationAddress, lat, lng);
        // Create post
        const post = yield prisma.post.create({
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
                let tag = yield prisma.tag.findUnique({
                    where: { tagName }
                });
                if (!tag) {
                    tag = yield prisma.tag.create({
                        data: { tagName }
                    });
                }
                // Connect tag to post
                yield prisma.postTag.create({
                    data: {
                        postId: post.id,
                        tagId: tag.id
                    }
                });
            }
        }
        // Return post with full details
        const fullPost = yield prisma.post.findUnique({
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
    }
    catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ message: "Error creating post", error: err.message });
    }
});
exports.createPost = createPost;
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const userQuery = client_1.Prisma.sql `
      SELECT id FROM users WHERE "cognitoId" = 'test-user-123'
    `;
        const users = yield prisma.$queryRaw(userQuery);
        const user = users[0];
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Check if post exists and user is author
        const existingPostQuery = client_1.Prisma.sql `
      SELECT "authorId" FROM posts WHERE id = ${parseInt(id)}
    `;
        const existingPosts = yield prisma.$queryRaw(existingPostQuery);
        const existingPost = existingPosts[0];
        if (!existingPost) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        if (existingPost.authorId !== user.id) {
            res.status(403).json({ message: "Not authorized to update this post" });
            return;
        }
        // Update post
        const updateQuery = client_1.Prisma.sql `
      UPDATE posts 
      SET title = ${title}, content = ${content}, "mediaUrl" = ${mediaUrl}, "updatedAt" = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;
        const updatedPosts = yield prisma.$queryRaw(updateQuery);
        const updatedPost = updatedPosts[0];
        // Handle tags if provided
        if (tags) {
            // Remove existing tags
            yield prisma.$executeRaw `
        DELETE FROM post_tags WHERE "postId" = ${parseInt(id)}
      `;
            // Add new tags
            for (const tagName of tags) {
                let tagQuery = client_1.Prisma.sql `
          SELECT id FROM tags WHERE "tagName" = ${tagName}
        `;
                let tags = yield prisma.$queryRaw(tagQuery);
                let tag = tags[0];
                if (!tag) {
                    const createTagQuery = client_1.Prisma.sql `
            INSERT INTO tags ("tagName") VALUES (${tagName}) RETURNING id
          `;
                    const newTags = yield prisma.$queryRaw(createTagQuery);
                    tag = newTags[0];
                }
                yield prisma.$executeRaw `
          INSERT INTO post_tags ("postId", "tagId") VALUES (${parseInt(id)}, ${tag.id})
        `;
            }
        }
        res.json(updatedPost);
    }
    catch (err) {
        console.error("Error updating post:", err);
        res.status(500).json({ message: "Error updating post", error: err.message });
    }
});
exports.updatePost = updatePost;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        // TEMPORARY: For testing without auth
        // const userId = req.user?.id;
        // if (!userId) {
        //   res.status(401).json({ message: "User not authenticated" });
        //   return;
        // }
        // Find user by cognitoId
        const userQuery = client_1.Prisma.sql `
      SELECT id FROM users WHERE "cognitoId" = 'test-user-123'
    `;
        const users = yield prisma.$queryRaw(userQuery);
        const user = users[0];
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Check if post exists
        const postQuery = client_1.Prisma.sql `
      SELECT "authorId" FROM posts WHERE id = ${parseInt(id)}
    `;
        const posts = yield prisma.$queryRaw(postQuery);
        const post = posts[0];
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        // Check if user is author or admin
        if (post.authorId !== user.id && ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            res.status(403).json({ message: "Not authorized to delete this post" });
            return;
        }
        yield prisma.$executeRaw `
      DELETE FROM posts WHERE id = ${parseInt(id)}
    `;
        res.json({ message: "Post deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({ message: "Error deleting post", error: err.message });
    }
});
exports.deletePost = deletePost;
