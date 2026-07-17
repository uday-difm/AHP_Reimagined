import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

async function migrateServices() {
  console.log('Fetching existing services...');
  const services = await prisma.service.findMany({
    where: { slug: null },
  });

  console.log(`Found ${services.length} services to migrate.`);
  let count = 0;

  for (const service of services) {
    let baseSlug = slugify(service.title || 'service');
    let slug = baseSlug;
    let counter = 1;

    // Check uniqueness
    while (true) {
      const existing = await prisma.service.findFirst({
        where: { siteId: service.siteId, slug: slug, id: { not: service.id } },
      });
      if (!existing) break;
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    await prisma.service.update({
      where: { id: service.id },
      data: {
        visibility: 'PUBLIC',
        slug: slug,
      },
    });
    console.log(`Migrated service: ${service.title} -> ${slug}`);
    count++;
  }

  console.log(`Migration complete. Migrated ${count} services.`);
  await prisma.$disconnect();
}

migrateServices().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
