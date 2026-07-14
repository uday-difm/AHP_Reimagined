import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";

export const dynamic = "force-dynamic";

/**
 * GET  /api/dashboard/quizzes/home-page  — list all questions tagged home-page
 * POST /api/dashboard/quizzes/home-page  — replace the home-page question set
 *   Body: { questionIds: number[] }
 */
export async function GET() {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rows = await prisma.quiz.findMany({
      where: { category: "home-page" },
      orderBy: { id: "asc" },
    });

    const data = rows.map((q) => ({
      ...q,
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
    const { questionIds, sourceCategories } = await req.json();

    if (!Array.isArray(questionIds))
      return NextResponse.json({ error: "questionIds must be an array" }, { status: 400 });

    // We keep a map of what each question's ORIGINAL category was (passed from client)
    // so we can restore it when unchecked
    const sourceCatMap = sourceCategories || {};

    // 1. Get all currently-tagged home-page questions
    const current = await prisma.quiz.findMany({
      where: { category: "home-page" },
      select: { id: true },
    });
    const currentIds = new Set(current.map((q) => q.id));
    const newIds = new Set(questionIds.map(Number));

    // 2. Questions to ADD to home-page (not currently tagged)
    const toAdd = [...newIds].filter((id) => !currentIds.has(id));

    // 3. Questions to REMOVE from home-page (currently tagged but not in new list)
    const toRemove = [...currentIds].filter((id) => !newIds.has(id));

    // Process in transaction
    await prisma.$transaction([
      // Add: set category to "home-page"
      ...toAdd.map((id) =>
        prisma.quiz.update({ where: { id }, data: { category: "home-page" } })
      ),
      // Remove: restore to the original category (from sourceCategories map) or general-wellness
      ...toRemove.map((id) => {
        const original = sourceCatMap[String(id)] || "general-wellness";
        // Don't restore to home-page (safety check)
        const restoreTo = original === "home-page" ? "general-wellness" : original;
        return prisma.quiz.update({ where: { id }, data: { category: restoreTo } });
      }),
    ]);

    return NextResponse.json({ success: true, added: toAdd.length, removed: toRemove.length });
  } catch (err) {
    console.error("POST /api/dashboard/quizzes/home-page error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
