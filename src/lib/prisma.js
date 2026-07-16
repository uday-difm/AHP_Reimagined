import { PrismaClient } from "../generated/prisma";

const globalForPrisma = globalThis;

if (globalForPrisma.prisma && !globalForPrisma.prisma.notificationAlert) {
  console.log("🔄 Next.js dev cache has an out-of-sync Prisma instance (missing notificationAlert). Recreating client...");
  globalForPrisma.prisma = undefined;
}

let databaseUrl = process.env.DATABASE_URL || "";
// Default connection limit of 10 is a reasonable starting point for a single persistent app instance.
// If running multiple replicas behind a load balancer, divide your DB's max_connections 
// by the number of replicas and set DATABASE_CONNECTION_LIMIT accordingly.
const connectionLimit = process.env.DATABASE_CONNECTION_LIMIT || 10;
if (databaseUrl && !databaseUrl.includes("connection_limit")) {
  const separator = databaseUrl.includes("?") ? "&" : "?";
  databaseUrl = `${databaseUrl}${separator}connection_limit=${connectionLimit}`;
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
