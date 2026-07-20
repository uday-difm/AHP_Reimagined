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

    const existingLike = await prisma.recipeLike.findUnique({
      where: { recipeId_userId: { recipeId: id, userId: user.id } }
    });

    if (existingLike) {
      await prisma.recipeLike.delete({ where: { id: existingLike.id } });
      return NextResponse.json(apiSuccess({ message: "Recipe unliked", liked: false }));
    } else {
      await prisma.recipeLike.create({
        data: {
          recipeId: id,
          userId: user.id
        }
      });
      return NextResponse.json(apiSuccess({ message: "Recipe liked", liked: true }));
    }
  } catch (err) {
    return handleApiError(err);
  }
}
