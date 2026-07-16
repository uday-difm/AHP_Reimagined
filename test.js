const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany();
  console.log(posts.map(p => ({ id: p.id, siteId: p.siteId, title: p.title, status: p.status })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
