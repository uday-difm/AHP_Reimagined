import { NextResponse } from "next/server";
import { getQuizQuestionsByCategory } from "@/lib/quizService";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/quizzes?category=<slug>   — questions for a specific category
 * GET /api/quizzes?category=all      — all questions (for count map)
 * GET /api/quizzes/types             — handled by /api/quizzes/types/route.js
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "general-wellness";

  if (category === "all") {
    try {
      const rows = await prisma.quiz.findMany({ orderBy: { id: "asc" } });
      const data = rows.map((q) => {
        let parsedOptions = [];
        try {
          parsedOptions = JSON.parse(q.options);
          if (!Array.isArray(parsedOptions)) parsedOptions = q.options.split(",").map((o) => o.trim());
        } catch {
          parsedOptions = q.options.split(",").map((o) => o.trim());
        }
        return {
          id: q.id,
          category: q.category || "general-wellness",
          text: q.question,
          options: parsedOptions,
          correctAnswer: q.correctAnswer,
        };
      });
      return NextResponse.json(data);
    } catch (err) {
      console.error("[GET /api/quizzes?category=all]", err);
      return NextResponse.json([], { status: 500 });
    }
  }

  const questions = await getQuizQuestionsByCategory(category);
  return NextResponse.json(questions);
}
