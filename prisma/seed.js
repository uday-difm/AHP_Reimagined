require("dotenv/config");

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("🌱 Seeding database...");

  // Create Super Admin
  const hashedPassword = await bcrypt.hash("Admin@123", 12);

  const user = await prisma.user.upsert({
    where: {
      email: "admin@example.com",
    },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash: hashedPassword,
      globalRole: "SUPERADMIN",
      isActive: true,
    },
  });

  console.log("✅ Super admin created");
  console.log("📧 admin@example.com");
  console.log("🔑 Admin@123");

  const MAIN_NAVIGATION = [];
  const FOOTER_NAVIGATION = [];
  const DEFAULT_SITE_ID = "unnamed-site";

  console.log(`  ⚠️ No sites found. Creating default '${DEFAULT_SITE_ID}' site settings...`);

  // Ensure a Site exists for the GlobalSettings foreign key
  await prisma.site.upsert({
    where: { id: DEFAULT_SITE_ID },
    update: {},
    create: {
      id: DEFAULT_SITE_ID,
      name: "Unnamed Site",
      isActive: true,
    },
  });

  await prisma.globalSettings.upsert({
    where: { siteId: DEFAULT_SITE_ID },
    update: {
      navigation: {
        main: MAIN_NAVIGATION,
        footer: FOOTER_NAVIGATION,
      },
    },
    create: {
      siteId: DEFAULT_SITE_ID,
      navigation: {
        main: MAIN_NAVIGATION,
        footer: FOOTER_NAVIGATION,
      },
    },
  });

  console.log(`  ✅ Seeding complete for '${DEFAULT_SITE_ID}' site.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
