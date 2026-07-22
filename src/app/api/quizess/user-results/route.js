import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireFrontendAuth } from "@/lib/requireFrontendAuth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getAuthUser() {
  const frontend = await requireFrontendAuth();
  if (frontend) return frontend;

  const adminSession = await getServerSession(authOptions);
  if (adminSession?.user) return adminSession.user;

  return null;
}

export async function GET(req) {
  try {
    const user = await getAuthUser();
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");

    const userIds = Array.from(
      new Set([user?.id, user?.email, queryUserId].filter(Boolean).map(String))
    );

    if (userIds.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Fetch user quiz analytics from DB by ID or Email
    const dbAnalytics = await prisma.quizAnalytics.findMany({
      where: { userId: { in: userIds } },
      orderBy: { id: "desc" },
    });

    // Fetch dynamic QuizTypes to resolve titles & slugs
    const quizTypes = await prisma.quizType.findMany();
    const quizTypeMap = new Map(quizTypes.map((qt) => [qt.id, qt]));

    const results = dbAnalytics.map((item) => {
      let meta = {};
      try {
        meta = JSON.parse(item.choose_option);
      } catch {
        meta = {};
      }

      const matchedType = quizTypeMap.get(item.quizId);

      return {
        id: item.id,
        quizId: item.quizId,
        slug: meta.slug || matchedType?.slug || "general-wellness",
        title: meta.title || matchedType?.title || "Wellness Quiz",
        score: meta.score !== undefined ? meta.score : item.correct,
        maxScore: meta.maxScore || 30,
        completedAt: meta.completedAt || item.time_taken || new Date().toISOString(),
      };
    });

    return NextResponse.json({ results });
  } catch (err) {
    console.error("[GET /api/quizess/user-results]", err);
    return NextResponse.json({ error: "Internal Server Error", results: [] }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser();
    const body = await req.json();
    const { slug, title, score, maxScore, quizId } = body;

    const userId = user?.id ? String(user.id) : String(body.userId || user?.email || "anonymous");
    const numQuizId = Number(quizId) || 1;

    const payload = JSON.stringify({
      slug: slug || "general-wellness",
      title: title || "Wellness Quiz",
      score: Number(score) || 0,
      maxScore: Number(maxScore) || 30,
      completedAt: new Date().toISOString(),
    });

    const saved = await prisma.quizAnalytics.create({
      data: {
        userId,
        quizId: numQuizId,
        correct: Number(score) || 0,
        choose_option: payload,
        time_taken: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (err) {
    console.error("[POST /api/quizess/user-results]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
