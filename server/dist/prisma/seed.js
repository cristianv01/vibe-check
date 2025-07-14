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
        yield prisma.follow.deleteMany();
        yield prisma.favorite.deleteMany();
        yield prisma.officialResponse.deleteMany();
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
            }))
        });
        console.log(`${seedData_1.users.length} users seeded.`);
        // --- 2b. Seed Owners ---
        console.log('Seeding owners...');
        yield prisma.owner.createMany({
            data: seedData_1.owners.map(owner => ({
                cognitoId: owner.cognitoId,
                username: owner.username,
                email: owner.email,
                profilePictureUrl: owner.profilePictureUrl,
            }))
        });
        console.log(`${seedData_1.owners.length} owners seeded.`);
        // --- 3. Seed Tags ---
        // Use the imported 'tags' array directly
        yield prisma.tag.createMany({ data: seedData_1.tags });
        console.log(`${seedData_1.tags.length} tags seeded.`);
        // --- 4. Seed Locations (with special PostGIS handling using $executeRaw) ---
        console.log('Seeding locations...');
        // Use the imported 'locations' array directly
        const owner = yield prisma.owner.findUnique({ where: { email: 'owner@sunnycafe.com' } });
        for (const location of seedData_1.locations) {
            const { name, address, coordinates } = location;
            const [longitude, latitude] = coordinates.coordinates;
            const claimedByOwnerId = location.name === "Sunny Cafe" ? owner === null || owner === void 0 ? void 0 : owner.id : null;
            yield prisma.$executeRaw(client_1.Prisma.sql `
        INSERT INTO "locations" ("name", "address", "coordinates", "claimedByOwnerId", "createdAt", "updatedAt") 
        VALUES (${name}, ${address}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), ${claimedByOwnerId}, NOW(), NOW());
      `);
        }
        console.log(`${seedData_1.locations.length} locations seeded.`);
        yield prisma.$executeRaw `SELECT setval(pg_get_serial_sequence('"locations"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "locations";`;
        // --- 5. Seed Posts and their Tag relationships (custom logic) ---
        console.log('Seeding posts and post-tag relationships...');
        // Use the imported 'posts' array directly
        for (const postData of seedData_1.posts) {
            const user = yield prisma.user.findUnique({ where: { email: postData.userEmail } });
            const location = yield prisma.location.findFirst({ where: { name: postData.locationName } });
            if (user && location) {
                // We can't use createMany because we need the returned ID for tag linking
                const newPost = yield prisma.post.create({
                    data: {
                        content: postData.content,
                        mediaUrl: postData.mediaUrl,
                        authorId: user.id,
                        locationId: location.id,
                    },
                });
                // Custom logic: Find tags mentioned in the post content and link them
                // Fix: Explicitly type `match` as RegExpMatchArray to resolve TS18046
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
        // --- 6. Seed Official Responses ---
        console.log('Seeding an official response...');
        const postToRespondTo = yield prisma.post.findFirst({ where: { content: { contains: 'spotty' } } });
        if (owner && postToRespondTo) {
            yield prisma.officialResponse.create({
                data: {
                    content: "Hi Alice! Thanks for the feedback. We're sorry to hear about the WiFi issues. We've just upgraded our system and hope you'll have a much smoother experience next time!",
                    postId: postToRespondTo.id,
                    ownerId: owner.id
                }
            });
            console.log('Official response seeded.');
        }
        // --- 7. Seed Follows ---
        console.log('Seeding follow relationships...');
        const alice = yield prisma.user.findUnique({ where: { email: 'alice@example.com' } });
        const bob = yield prisma.user.findUnique({ where: { email: 'bob@example.com' } });
        const charlie = yield prisma.user.findUnique({ where: { email: 'charlie@example.com' } });
        if (alice && bob && charlie) {
            // Alice follows Bob
            yield prisma.follow.create({ data: { followerId: alice.id, followingId: bob.id } });
            // Charlie follows Alice and Bob
            yield prisma.follow.create({ data: { followerId: charlie.id, followingId: alice.id } });
            yield prisma.follow.create({ data: { followerId: charlie.id, followingId: bob.id } });
            console.log('Follow relationships seeded.');
        }
        // --- 8. Seed Favorites ---
        console.log('Seeding favorites...');
        const dailyGrind = yield prisma.location.findFirst({ where: { name: 'The Daily Grind' } });
        const sunnyCafe = yield prisma.location.findFirst({ where: { name: 'Sunny Cafe' } });
        const bytesBrews = yield prisma.location.findFirst({ where: { name: 'Bytes & Brews Bistro' } });
        if (alice && dailyGrind && sunnyCafe) {
            // Alice favorites The Daily Grind and Sunny Cafe
            yield prisma.favorite.create({ data: { userId: alice.id, locationId: dailyGrind.id } });
            yield prisma.favorite.create({ data: { userId: alice.id, locationId: sunnyCafe.id } });
        }
        if (bob && bytesBrews) {
            // Bob favorites Bytes & Brews Bistro
            yield prisma.favorite.create({ data: { userId: bob.id, locationId: bytesBrews.id } });
        }
        if (charlie && dailyGrind && bytesBrews) {
            // Charlie favorites The Daily Grind and Bytes & Brews Bistro
            yield prisma.favorite.create({ data: { userId: charlie.id, locationId: dailyGrind.id } });
            yield prisma.favorite.create({ data: { userId: charlie.id, locationId: bytesBrews.id } });
        }
        console.log('Favorites seeded.');
        // --- 9. Seed Post Favorites ---
        console.log('Seeding post favorites...');
        for (const pf of seedData_1.postFavorites) {
            const user = yield prisma.user.findUnique({ where: { email: pf.userEmail } });
            const post = yield prisma.post.findFirst({ where: { content: pf.postContent } });
            if (user && post) {
                yield prisma.postFavorite.create({ data: { userId: user.id, postId: post.id } });
            }
        }
        console.log('Post favorites seeded.');
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
