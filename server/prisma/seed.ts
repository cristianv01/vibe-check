import { PrismaClient, Prisma } from '@prisma/client';
// Import the data directly from your seedData.ts file
import { users, owners, locations, tags, posts, postFavorites } from './seedData';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // --- 1. Clear existing data in the correct order to respect foreign key constraints ---
  console.log('Deleting existing data...');
  // The order of deletion is the reverse of creation
  await prisma.postTag.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.officialResponse.deleteMany();
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
    }))
  });
  console.log(`${users.length} users seeded.`);

  // --- 2b. Seed Owners ---
  console.log('Seeding owners...');
  await prisma.owner.createMany({
    data: owners.map(owner => ({
      cognitoId: owner.cognitoId,
      username: owner.username,
      email: owner.email,
      profilePictureUrl: owner.profilePictureUrl,
    }))
  });
  console.log(`${owners.length} owners seeded.`);

  // --- 3. Seed Tags ---
  // Use the imported 'tags' array directly
  await prisma.tag.createMany({ data: tags });
  console.log(`${tags.length} tags seeded.`);

  // --- 4. Seed Locations (with special PostGIS handling using $executeRaw) ---
  console.log('Seeding locations...');
  // Use the imported 'locations' array directly
  const owner = await prisma.owner.findUnique({ where: { email: 'owner@sunnycafe.com' } });

  for (const location of locations) {
    const { name, address, coordinates } = location;
    const [longitude, latitude] = coordinates.coordinates;
    const claimedByOwnerId = location.name === "Sunny Cafe" ? owner?.id : null;
    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO "locations" ("name", "address", "coordinates", "claimedByOwnerId", "createdAt", "updatedAt") 
        VALUES (${name}, ${address}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), ${claimedByOwnerId}, NOW(), NOW());
      `
    );
  }
  console.log(`${locations.length} locations seeded.`);
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"locations"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "locations";`;


  // --- 5. Seed Posts and their Tag relationships (custom logic) ---
  console.log('Seeding posts and post-tag relationships...');
  // Use the imported 'posts' array directly
  for (const postData of posts) {
    const user = await prisma.user.findUnique({ where: { email: postData.userEmail } });
    const location = await prisma.location.findFirst({ where: { name: postData.locationName } });

    if (user && location) {
      // We can't use createMany because we need the returned ID for tag linking
      const newPost = await prisma.post.create({
        data: {
          content: postData.content,
          mediaUrl: postData.mediaUrl,
          authorId: user.id,
          locationId: location.id,
        },
      });

      // Custom logic: Find tags mentioned in the post content and link them
      // Fix: Explicitly type `match` as RegExpMatchArray to resolve TS18046
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

  // --- 6. Seed Official Responses ---
  console.log('Seeding an official response...');
  const postToRespondTo = await prisma.post.findFirst({where: {content: { contains: 'spotty' }}});
  if (owner && postToRespondTo) {
      await prisma.officialResponse.create({
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
  const alice = await prisma.user.findUnique({ where: { email: 'alice@example.com' } });
  const bob = await prisma.user.findUnique({ where: { email: 'bob@example.com' } });
  const charlie = await prisma.user.findUnique({ where: { email: 'charlie@example.com' } });

  if (alice && bob && charlie) {
      // Alice follows Bob
      await prisma.follow.create({ data: { followerId: alice.id, followingId: bob.id }});
      // Charlie follows Alice and Bob
      await prisma.follow.create({ data: { followerId: charlie.id, followingId: alice.id }});
      await prisma.follow.create({ data: { followerId: charlie.id, followingId: bob.id }});
      console.log('Follow relationships seeded.');
  }

  // --- 8. Seed Favorites ---
  console.log('Seeding favorites...');
  const dailyGrind = await prisma.location.findFirst({ where: { name: 'The Daily Grind' } });
  const sunnyCafe = await prisma.location.findFirst({ where: { name: 'Sunny Cafe' } });
  const bytesBrews = await prisma.location.findFirst({ where: { name: 'Bytes & Brews Bistro' } });

  if (alice && dailyGrind && sunnyCafe) {
      // Alice favorites The Daily Grind and Sunny Cafe
      await prisma.favorite.create({ data: { userId: alice.id, locationId: dailyGrind.id }});
      await prisma.favorite.create({ data: { userId: alice.id, locationId: sunnyCafe.id }});
  }

  if (bob && bytesBrews) {
      // Bob favorites Bytes & Brews Bistro
      await prisma.favorite.create({ data: { userId: bob.id, locationId: bytesBrews.id }});
  }

  if (charlie && dailyGrind && bytesBrews) {
      // Charlie favorites The Daily Grind and Bytes & Brews Bistro
      await prisma.favorite.create({ data: { userId: charlie.id, locationId: dailyGrind.id }});
      await prisma.favorite.create({ data: { userId: charlie.id, locationId: bytesBrews.id }});
  }
  console.log('Favorites seeded.');
  
  // --- 9. Seed Post Favorites ---
  console.log('Seeding post favorites...');
  for (const pf of postFavorites) {
    const user = await prisma.user.findUnique({ where: { email: pf.userEmail } });
    const post = await prisma.post.findFirst({ where: { content: pf.postContent } });
    if (user && post) {
      await prisma.postFavorite.create({ data: { userId: user.id, postId: post.id } });
    }
  }
  console.log('Post favorites seeded.');

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