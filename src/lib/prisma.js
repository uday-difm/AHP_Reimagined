import { PrismaClient } from "../generated/prisma";

const globalForPrisma = globalThis;

if (globalForPrisma.prisma && !globalForPrisma.prisma.notificationAlert) {
  console.log("🔄 Next.js dev cache has an out-of-sync Prisma instance (missing notificationAlert). Recreating client...");
  globalForPrisma.prisma = undefined;
}

// Dynamically tune the DATABASE_URL connection limit for serverless environment if not set
let databaseUrl = process.env.DATABASE_URL || "";
if (process.env.NODE_ENV === "production" && databaseUrl && !databaseUrl.includes("connection_limit")) {
  const separator = databaseUrl.includes("?") ? "&" : "?";
  databaseUrl = `${databaseUrl}${separator}connection_limit=1&pool_timeout=10`;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl || undefined,
      },
    },
  });

globalForPrisma.prisma = prisma;

export default prisma;
