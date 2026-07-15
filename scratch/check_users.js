const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const users = await prisma.user.findMany({
      select: { email: true, name: true, globalRole: true }
    });
    console.log("Users:", users);
  } catch (e) {
    console.log("User error:", e.message);
  }

  try {
    const auths = await prisma.auth.findMany({
      select: { email: true, username: true }
    });
    console.log("Auths:", auths);
  } catch (e) {
    console.log("Auth error:", e.message);
  }
}

check().finally(() => prisma.$disconnect());
