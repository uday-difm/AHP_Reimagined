import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSiteId } from "@/lib/siteGuard";
import { handleApiError, apiSuccess } from "@/core/errors";
import { requireAuth } from "@/lib/requireAuth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const siteId = getSiteId(req);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("q");

    const where = {
      siteId,
      status: "APPROVED",
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
      ...(category
        ? { tags: { some: { name: category } } }
        : {}),
    };

    const recipes = await prisma.recipe.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        tags: true,
        allergens: true,
        contributor: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(apiSuccess({ recipes }));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const siteId = getSiteId(req);
    const body = await req.json();

    const {
      title,
      description,
      ingredients,
      steps,
      cookingTime,
      calories,
      difficulty,
      imageUrl,
      tags = [],
      allergens = [],
      nutrition = {}
    } = body;

    // Safety checks
    if (!title || !ingredients || !steps || ingredients.length === 0 || steps.length === 0) {
      return NextResponse.json({ error: "Title, ingredients, and steps are required." }, { status: 400 });
    }

    if (description && description.toLowerCase().includes("guaranteed cure")) {
      return NextResponse.json({ error: "Inappropriate content detected." }, { status: 400 });
    }

    const recipe = await prisma.recipe.create({
      data: {
        siteId,
        title,
        description,
        ingredients: JSON.stringify(ingredients),
        steps: JSON.stringify(steps),
        cookingTime: Number(cookingTime) || null,
        calories: Number(calories) || null,
        difficulty,
        imageUrl,
        status: "PENDING",
        contributorId: user.id,
        protein: nutrition.protein ? Number(nutrition.protein) : null,
        carbs: nutrition.carbs ? Number(nutrition.carbs) : null,
        fiber: nutrition.fiber ? Number(nutrition.fiber) : null,
        fat: nutrition.fat ? Number(nutrition.fat) : null,
        sugar: nutrition.sugar ? Number(nutrition.sugar) : null,
        tags: {
          connectOrCreate: tags.map(tag => ({
            where: { name: tag },
            create: { name: tag }
          }))
        },
        allergens: {
          connectOrCreate: allergens.map(allergen => ({
            where: { name: allergen },
            create: { name: allergen }
          }))
        }
      }
    });

    return NextResponse.json(apiSuccess({ recipe }));
  } catch (err) {
    return handleApiError(err);
  }
}
