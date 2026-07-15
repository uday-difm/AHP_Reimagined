const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  await prisma.systemErrorLog.create({
    data: {
      siteId: 'AHP',
      message: 'Test Exception: Simulated crash to verify dashboard logging',
      stack: 'Error: Simulated crash\n    at Object.<anonymous> (/var/task/app/api/test/route.js:10:11)',
      context: { source: 'System Diagnostics Test' }
    }
  });
  console.log('Test exception injected');
}
run().catch(console.error).finally(() => prisma.$disconnect());
