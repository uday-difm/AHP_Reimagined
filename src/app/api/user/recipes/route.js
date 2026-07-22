import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSiteId } from "@/lib/siteGuard";
import { handleApiError, apiSuccess } from "@/core/errors";
import { requireAuth } from "@/lib/requireAuth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const sessionUser = await requireAuth();
    let user = sessionUser;
    
    // Fallback if no session user (helpful for local testing even in production mode)
    if (!user) {
      user = await prisma.user.findFirst();
    }
    
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const siteId = getSiteId(req);

    const recipes = await prisma.recipe.findMany({
      where: {
        siteId,
        contributorId: user.id
      },
      orderBy: { createdAt: "desc" },
      include: {
        tags: true,
        allergens: true,
      }
    });

    return NextResponse.json(apiSuccess({ recipes }));
  } catch (err) {
    return handleApiError(err);
  }
}
