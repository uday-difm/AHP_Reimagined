const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.post.updateMany({
    where: { status: 'DRAFT' },
    data: { status: 'PUBLISHED', publishedAt: new Date() }
  });
  console.log("Published all draft posts!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
