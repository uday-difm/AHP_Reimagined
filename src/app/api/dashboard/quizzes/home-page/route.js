import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";

export const dynamic = "force-dynamic";

async function getHomePageQuizIds() {
  const settings = await prisma.globalSettings.findFirst({
    select: { websiteSettings: true }
  });
  const websiteSettings = settings?.websiteSettings || {};
  return Array.isArray(websiteSettings.homePageQuizIds) 
    ? websiteSettings.homePageQuizIds.map(Number) 
    : [];
}

async function saveHomePageQuizIds(ids) {
  const settings = await prisma.globalSettings.findFirst({
    select: { siteId: true, websiteSettings: true }
  });
  const siteId = settings?.siteId || "unnamed-site";
  const websiteSettings = settings?.websiteSettings || {};
  const updatedSettings = {
    ...websiteSettings,
    homePageQuizIds: ids
  };
  await prisma.globalSettings.upsert({
    where: { siteId },
    update: { websiteSettings: updatedSettings },
    create: { siteId, websiteSettings: updatedSettings }
  });
}

/**
 * GET  /api/dashboard/quizzes/home-page  — list all questions tagged home-page
 * POST /api/dashboard/quizzes/home-page  — replace the home-page question set
 *   Body: { questionIds: number[] }
 */
export async function GET() {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const ids = await getHomePageQuizIds();
    const rows = await prisma.quiz.findMany({
      where: { id: { in: ids } },
      orderBy: { id: "asc" },
    });

    const data = rows.map((q) => ({
      ...q,
      category: "home-page", // override dynamically so client UI renders correctly
      options: (() => {
        try {
          const p = JSON.parse(q.options);
          return Array.isArray(p) ? p : q.options.split(",").map((o) => o.trim());
        } catch {
          return q.options.split(",").map((o) => o.trim());
        }
      })(),
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/dashboard/quizzes/home-page error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["SUPERADMIN", "ADMIN", "EDITOR"].includes(user.globalRole))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { questionIds } = await req.json();

    if (!Array.isArray(questionIds))
      return NextResponse.json({ error: "questionIds must be an array" }, { status: 400 });

    const newIds = questionIds.map(Number);
    await saveHomePageQuizIds(newIds);

    return NextResponse.json({ success: true, added: newIds.length, removed: 0 });
  } catch (err) {
    console.error("POST /api/dashboard/quizzes/home-page error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
