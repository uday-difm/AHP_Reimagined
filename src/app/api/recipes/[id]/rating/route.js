import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError, apiSuccess } from "@/core/errors";
import { requireAuth } from "@/lib/requireAuth";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  try {
    const user = await requireAuth();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const body = await req.json();
    const { rating } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating value. Must be between 1 and 5." }, { status: 400 });
    }

    const recipeRating = await prisma.recipeRating.upsert({
      where: { recipeId_userId: { recipeId: id, userId: user.id } },
      update: { rating: Number(rating) },
      create: {
        recipeId: id,
        userId: user.id,
        rating: Number(rating)
      }
    });

    return NextResponse.json(apiSuccess({ rating: recipeRating }));
  } catch (err) {
    return handleApiError(err);
  }
}
