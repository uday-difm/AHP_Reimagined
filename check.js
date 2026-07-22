import prisma from "./src/lib/prisma.js";

async function main() {
  const user = await prisma.user.findFirst();
  console.log(user);
}

main().catch(console.error).finally(() => process.exit(0));
