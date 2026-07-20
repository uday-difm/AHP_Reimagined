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

    const existingSave = await prisma.savedRecipe.findUnique({
      where: { recipeId_userId: { recipeId: id, userId: user.id } }
    });

    if (existingSave) {
      await prisma.savedRecipe.delete({ where: { id: existingSave.id } });
      return NextResponse.json(apiSuccess({ message: "Recipe removed from saved", saved: false }));
    } else {
      await prisma.savedRecipe.create({
        data: {
          recipeId: id,
          userId: user.id
        }
      });
      return NextResponse.json(apiSuccess({ message: "Recipe saved", saved: true }));
    }
  } catch (err) {
    return handleApiError(err);
  }
}
