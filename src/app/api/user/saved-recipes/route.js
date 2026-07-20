import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSiteId } from "@/lib/siteGuard";
import { handleApiError, apiSuccess } from "@/core/errors";
import { requireAuth } from "@/lib/requireAuth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const user = await requireAuth();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const siteId = getSiteId(req);

    const savedRecipes = await prisma.savedRecipe.findMany({
      where: {
        userId: user.id,
        recipe: { siteId }
      },
      include: {
        recipe: {
          include: {
            tags: true,
            allergens: true,
            contributor: { select: { id: true, name: true, email: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const recipes = savedRecipes.map(sr => sr.recipe);

    return NextResponse.json(apiSuccess({ recipes }));
  } catch (err) {
    return handleApiError(err);
  }
}
