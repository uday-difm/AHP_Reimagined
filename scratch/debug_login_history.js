const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const siteUsers = await p.siteUser.findMany({
    where: { siteId: "AHP" },
    select: { userId: true, user: { select: { email: true, globalRole: true } } },
  });
  console.log("SiteUsers for AHP:", JSON.stringify(siteUsers, null, 2));

  const globalAdmins = await p.user.findMany({
    where: { globalRole: { in: ["SUPERADMIN", "ADMIN"] } },
    select: { id: true, email: true, globalRole: true },
  });
  console.log("Global Admins:", JSON.stringify(globalAdmins, null, 2));

  const allUserIds = [
    ...siteUsers.map((su) => su.userId),
    ...globalAdmins.filter((ga) => !siteUsers.find((su) => su.userId === ga.id)).map((ga) => ga.id),
  ];
  console.log("Total user IDs for history lookup:", allUserIds.length, allUserIds);

  const histCount = await p.loginHistory.count({ where: { userId: { in: allUserIds } } });
  console.log("Login history records for these users:", histCount);
}

main().finally(() => p.$disconnect());
