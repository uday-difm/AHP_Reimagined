const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pages = await prisma.legalPage.findMany();
  console.log("Legal Pages count:", pages.length);
  pages.forEach(p => {
    console.log(`- Type: ${p.type}, Title: ${p.title}`);
    console.log(`  Content Preview: ${p.content ? p.content.substring(0, 150) : 'null'}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
