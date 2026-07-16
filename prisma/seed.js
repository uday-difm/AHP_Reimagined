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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
