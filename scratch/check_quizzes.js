import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  try {
    const quizzes = await prisma.quiz.findMany({});
    console.log("=== QUIZZES ===");
    console.log(JSON.stringify(quizzes, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
