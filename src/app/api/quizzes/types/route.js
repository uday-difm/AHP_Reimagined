import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/quizzes/types
 * Public endpoint — returns active quiz types that have at least 1 question.
 * Each type includes a live `questionCount`.
 */
export async function GET() {
  try {
    // Get all active quiz types ordered by sortOrder
    const types = await prisma.quizType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    if (types.length === 0) return NextResponse.json([]);

    // Get question counts grouped by category
    const counts = await prisma.quiz.groupBy({
      by: ["category"],
      _count: { id: true },
    });

    // Build a map: slug → count  (general-wellness also counts nulls)
    const nullCount = await prisma.quiz.count({ where: { category: null } });
    const countMap = {};
    counts.forEach((c) => {
      const cat = c.category || "general-wellness";
      countMap[cat] = (countMap[cat] || 0) + c._count.id;
    });
    // Add null-category rows to general-wellness
    if (nullCount > 0) {
      countMap["general-wellness"] = (countMap["general-wellness"] || 0) + nullCount;
    }

    // Filter to only types with ≥1 question, attach count
    const result = types
      .map((t) => ({ ...t, questionCount: countMap[t.slug] || 0 }))
      .filter((t) => t.questionCount > 0);

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/quizzes/types error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
