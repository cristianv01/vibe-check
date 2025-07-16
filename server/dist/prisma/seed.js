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
const client_1 = require("@prisma/client");
// Import the data directly from your seedData.ts file
const seedData_1 = require("./seedData");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Start seeding...');
        // --- 1. Clear existing data in the correct order to respect foreign key constraints ---
        console.log('Deleting existing data...');
        // The order of deletion is the reverse of creation
        yield prisma.postTag.deleteMany();
        yield prisma.postFavorite.deleteMany();
        yield prisma.post.deleteMany();
        yield prisma.location.deleteMany();
        yield prisma.user.deleteMany();
        yield prisma.tag.deleteMany();
        console.log('Existing data deleted.');
        // --- 2. Seed Users ---
        console.log('Seeding users...');
        yield prisma.user.createMany({
            data: seedData_1.users.map(user => ({
                cognitoId: user.cognitoId,
                username: user.username,
                email: user.email,
                profilePictureUrl: user.profilePictureUrl,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }))
        });
        console.log(`${seedData_1.users.length} users seeded.`);
        // --- 3. Seed Tags ---
        yield prisma.tag.createMany({
            data: seedData_1.tags.map(tag => ({
                tagName: tag.tagName,
            }))
        });
        console.log(`${seedData_1.tags.length} tags seeded.`);
        // --- 4. Seed Locations (with special PostGIS handling using $executeRaw) ---
        console.log('Seeding locations...');
        for (const location of seedData_1.locations) {
            const { name, address, coordinates, createdAt, updatedAt } = location;
            const [longitude, latitude] = coordinates.coordinates;
            yield prisma.$executeRaw(client_1.Prisma.sql `
        INSERT INTO "locations" ("name", "address", "coordinates", "createdAt", "updatedAt") 
        VALUES (${name}, ${address}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), ${createdAt}, ${updatedAt});
      `);
        }
        console.log(`${seedData_1.locations.length} locations seeded.`);
        yield prisma.$executeRaw `SELECT setval(pg_get_serial_sequence('"locations"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "locations";`;
        // --- 5. Seed Posts and their Tag relationships ---
        console.log('Seeding posts and post-tag relationships...');
        for (const postData of seedData_1.posts) {
            const user = yield prisma.user.findUnique({ where: { email: postData.userEmail } });
            const location = yield prisma.location.findFirst({ where: { name: postData.locationName } });
            if (user && location) {
                // We can't use createMany because we need the returned ID for tag linking
                const newPost = yield prisma.post.create({
                    data: {
                        title: postData.title,
                        content: postData.content,
                        mediaUrl: postData.mediaUrl,
                        authorId: user.id,
                        locationId: location.id,
                        createdAt: postData.createdAt,
                        updatedAt: postData.updatedAt,
                    },
                });
                // Custom logic: Find tags mentioned in the post content and link them
                const mentionedTagNames = [...postData.content.matchAll(/#(\w+)/g)].map((match) => `#${match[1]}`);
                if (mentionedTagNames.length > 0) {
                    const mentionedTags = yield prisma.tag.findMany({
                        where: {
                            tagName: { in: mentionedTagNames },
                        },
                    });
                    if (mentionedTags.length > 0) {
                        yield prisma.postTag.createMany({
                            data: mentionedTags.map(tag => ({
                                postId: newPost.id,
                                tagId: tag.id,
                            })),
                        });
                    }
                }
            }
        }
        console.log('Posts seeded.');
        console.log('Seeding finished successfully.');
    });
}
main()
    .catch((e) => {
    console.error('An error occurred while seeding the database:', e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
