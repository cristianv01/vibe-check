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
exports.deleteLocation = exports.verifyLocation = exports.findOrCreateLocation = exports.getLocation = exports.getLocations = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getLocations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { favoriteIds, latitude, longitude, radius = 10, // Default 10km radius
        status, limit = 50, offset = 0, search } = req.query;
        let whereConditions = [];
        if (favoriteIds) {
            const favoriteIdsArray = favoriteIds.split(",").map(Number);
            whereConditions.push(client_1.Prisma.sql `l.id IN (${client_1.Prisma.join(favoriteIdsArray)})`);
        }
        // Filter by status if provided
        if (status && status !== "any") {
            whereConditions.push(client_1.Prisma.sql `l.status = ${status}::"LocationStatus"`);
        }
        // Search by name or address
        if (search) {
            whereConditions.push(client_1.Prisma.sql `(l.name ILIKE ${`%${search}%`} OR l.address ILIKE ${`%${search}%`})`);
        }
        // Geospatial filtering
        if (latitude && longitude) {
            //parsed numbers converted to strings
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            const radiusKm = parseFloat(radius);
            //POSTGIS
            whereConditions.push(client_1.Prisma.sql `ST_DWithin(
                l.coordinates::geography,
                ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
                ${radiusKm * 1000}
                )`);
        }
        const completeQuery = client_1.Prisma.sql `
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
        ${whereConditions.length > 0
            ? client_1.Prisma.sql `WHERE ${client_1.Prisma.join(whereConditions, " AND ")}`
            : client_1.Prisma.empty}
        GROUP BY l.id, l.name, l.address, l.status, l."claimedByOwnerId", l."createdAt", l."updatedAt"
        ORDER BY post_count DESC, l."createdAt" DESC
        LIMIT ${parseInt(limit)}
        OFFSET ${parseInt(offset)}
      `;
        //executing a raw query
        const locations = yield prisma.$queryRaw(completeQuery);
        //send that response to the frontend
        res.json(locations);
    }
    catch (error) {
        console.error("Error retrieving locations:", error);
        res.status(500).json({
            message: `Error retrieving locations: ${error.message}`
        });
    }
});
exports.getLocations = getLocations;
const getLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { limit = 20, offset = 0 } = req.query;
        // Get location with basic info
        const locationQuery = client_1.Prisma.sql `
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
        const locations = yield prisma.$queryRaw(locationQuery);
        const location = locations[0];
        if (!location) {
            res.status(404).json({ message: "Location not found" });
            return;
        }
        // Get posts for this location
        const postsQuery = client_1.Prisma.sql `
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
      LIMIT ${parseInt(limit)}
      OFFSET ${parseInt(offset)}
    `;
        const posts = yield prisma.$queryRaw(postsQuery);
        const locationWithPosts = Object.assign(Object.assign({}, location), { posts });
        res.json(locationWithPosts);
    }
    catch (err) {
        console.error("Error retrieving location:", err);
        res.status(500).json({
            message: `Error retrieving location: ${err.message}`
        });
    }
});
exports.getLocation = getLocation;
// Find or create location (used when posting)
const findOrCreateLocation = (name, address, lat, lng) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // First, try to find existing location within 100 meters
        const existingLocation = yield prisma.$queryRaw `
      SELECT id, name, address, status
      FROM locations 
      WHERE ST_DWithin(
        coordinates::geography, 
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, 
        100
      )
      LIMIT 1
    `;
        if (existingLocation.length > 0) {
            return existingLocation[0];
        }
        // If no existing location found, create new one
        const newLocationQuery = client_1.Prisma.sql `
      INSERT INTO locations (name, address, coordinates, status, "createdAt", "updatedAt")
      VALUES (${name}, ${address}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326), 'UNVERIFIED', NOW(), NOW())
      RETURNING id, name, address, status
    `;
        const newLocations = yield prisma.$queryRaw(newLocationQuery);
        return newLocations[0];
    }
    catch (err) {
        console.error("Error in findOrCreateLocation:", err);
        throw err;
    }
});
exports.findOrCreateLocation = findOrCreateLocation;
// Verify location (admin/owner only)
const verifyLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['VERIFIED', 'ARCHIVED'].includes(status)) {
            res.status(400).json({
                message: "Invalid status. Must be VERIFIED or ARCHIVED"
            });
            return;
        }
        const updateQuery = client_1.Prisma.sql `
      UPDATE locations 
      SET status = ${status}::"LocationStatus", "updatedAt" = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;
        const updatedLocations = yield prisma.$queryRaw(updateQuery);
        const updatedLocation = updatedLocations[0];
        if (!updatedLocation) {
            res.status(404).json({ message: "Location not found" });
            return;
        }
        res.json(updatedLocation);
    }
    catch (err) {
        console.error("Error verifying location:", err);
        res.status(500).json({
            message: "Error verifying location",
            error: err.message
        });
    }
});
exports.verifyLocation = verifyLocation;
// Delete location (admin only)
const deleteLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Check if location has posts
        const postCountQuery = client_1.Prisma.sql `
      SELECT COUNT(*) as post_count
      FROM posts
      WHERE "locationId" = ${parseInt(id)}
    `;
        const postCountResult = yield prisma.$queryRaw(postCountQuery);
        const postCount = postCountResult[0].post_count;
        if (postCount > 0) {
            res.status(400).json({
                message: "Cannot delete location with posts. Archive it instead."
            });
            return;
        }
        // Delete location
        const deleteQuery = client_1.Prisma.sql `
      DELETE FROM locations
      WHERE id = ${parseInt(id)}
    `;
        yield prisma.$executeRaw(deleteQuery);
        res.json({ message: "Location deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting location:", err);
        res.status(500).json({
            message: "Error deleting location",
            error: err.message
        });
    }
});
exports.deleteLocation = deleteLocation;
