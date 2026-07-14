import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

if (globalForPrisma.prisma && !globalForPrisma.prisma.notificationAlert) {
  console.log("🔄 Next.js dev cache has an out-of-sync Prisma instance (missing notificationAlert). Recreating client...");
  globalForPrisma.prisma = undefined;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

globalForPrisma.prisma = prisma;

export default prisma;
