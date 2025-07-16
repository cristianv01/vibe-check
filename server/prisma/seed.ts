import { PrismaClient, Prisma } from '@prisma/client';
// Import the data directly from your seedData.ts file
import { users, locations, tags, posts } from './seedData';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // --- 1. Clear existing data in the correct order to respect foreign key constraints ---
  console.log('Deleting existing data...');
  // The order of deletion is the reverse of creation
  await prisma.postTag.deleteMany();
  await prisma.postFavorite.deleteMany();
  await prisma.post.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tag.deleteMany();
  console.log('Existing data deleted.');

  // --- 2. Seed Users ---
  console.log('Seeding users...');
  await prisma.user.createMany({
    data: users.map(user => ({
      cognitoId: user.cognitoId,
      username: user.username, 
      email: user.email,
      profilePictureUrl: user.profilePictureUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }))
  });
  console.log(`${users.length} users seeded.`);

  // --- 3. Seed Tags ---
  await prisma.tag.createMany({ 
    data: tags.map(tag => ({
      tagName: tag.tagName,
    }))
  });
  console.log(`${tags.length} tags seeded.`);

  // --- 4. Seed Locations (with special PostGIS handling using $executeRaw) ---
  console.log('Seeding locations...');
  for (const location of locations) {
    const { name, address, coordinates, createdAt, updatedAt } = location;
    const [longitude, latitude] = coordinates.coordinates;
    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO "locations" ("name", "address", "coordinates", "createdAt", "updatedAt") 
        VALUES (${name}, ${address}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), ${createdAt}, ${updatedAt});
      `
    );
  }
  console.log(`${locations.length} locations seeded.`);
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"locations"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "locations";`;

  // --- 5. Seed Posts and their Tag relationships ---
  console.log('Seeding posts and post-tag relationships...');
  for (const postData of posts) {
    const user = await prisma.user.findUnique({ where: { email: postData.userEmail } });
    const location = await prisma.location.findFirst({ where: { name: postData.locationName } });

    if (user && location) {
      // We can't use createMany because we need the returned ID for tag linking
      const newPost = await prisma.post.create({
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
      const mentionedTagNames = [...postData.content.matchAll(/#(\w+)/g)].map(
          (match: RegExpMatchArray) => `#${match[1]}`
      );

      if (mentionedTagNames.length > 0) {
        const mentionedTags = await prisma.tag.findMany({
          where: {
            tagName: { in: mentionedTagNames },
          },
        });

        if (mentionedTags.length > 0) {
          await prisma.postTag.createMany({
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
}

main()
  .catch((e) => {
    console.error('An error occurred while seeding the database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });