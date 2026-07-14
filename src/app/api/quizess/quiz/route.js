import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { quizzes as staticQuizzes } from "@/data/quizzes";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryFilter = searchParams.get("category") || "general-wellness";

    const where = categoryFilter === "general-wellness"
      ? { OR: [{ category: "general-wellness" }, { category: null }] }
      : { category: categoryFilter };

    let quizzes = await prisma.quiz.findMany({
      where
    });

    // If no quizzes found in the database, fallback to the static quiz questions
    if (quizzes.length === 0) {
      const fallbackQuiz = staticQuizzes.find((q) => q.slug === categoryFilter);
      if (fallbackQuiz && fallbackQuiz.questions) {
        const formattedFallback = fallbackQuiz.questions.map((q, idx) => {
          const parsedOptions = q.options.map((o) => o.label);
          // Find correct option index based on highest score or first non-zero score
          const corrAnswerIndex = q.options.findIndex((o) => o.score > 0);
          return {
            _id: q.id || idx,
            question: q.text,
            options: parsedOptions,
            correctAnswer: corrAnswerIndex !== -1 ? corrAnswerIndex : 0,
            explanation: q.explanation || "",
          };
        });
        return NextResponse.json(formattedFallback);
      }
    }

    const formatted = quizzes.map((q) => {
      let parsedOptions = [];
      try {
        parsedOptions = JSON.parse(q.options);
        if (!Array.isArray(parsedOptions)) {
          parsedOptions = q.options.split(",").map(o => o.trim());
        }
      } catch {
        parsedOptions = q.options.split(",").map(o => o.trim());
      }

      let corrAnswerIndex = 0;
      if (!isNaN(Number(q.correctAnswer))) {
        corrAnswerIndex = Number(q.correctAnswer);
      } else {
        const foundIdx = parsedOptions.findIndex(o => o.toLowerCase() === q.correctAnswer.toLowerCase());
        if (foundIdx !== -1) {
          corrAnswerIndex = foundIdx;
        }
      }

      return {
        _id: q.id,
        question: q.question,
        options: parsedOptions,
        correctAnswer: corrAnswerIndex,
        explanation: q.explanation || ""
      };
    });

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("GET /api/quizess/quiz error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
