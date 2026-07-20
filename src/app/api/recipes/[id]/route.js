import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSiteId } from "@/lib/siteGuard";
import { handleApiError, apiSuccess } from "@/core/errors";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    const siteId = getSiteId(req);
    const { id } = params;

    if (id === 'demo') {
      return NextResponse.json(apiSuccess({
        recipe: {
          id: 'demo',
          title: 'Quinoa & Avocado Power Bowl',
          description: 'A delicious, healthy, and easy to make recipe that is perfect for any time of the day. Packed with nutrients and flavor. This quinoa bowl is loaded with fresh vegetables, creamy avocado, and a light lemon dressing.',
          cookingTime: 15,
          difficulty: 'easy',
          calories: 320,
          imageUrl: '/images/healthy_bite.png',
          ingredients: JSON.stringify([
            '1 cup cooked quinoa',
            '1/2 avocado, sliced',
            '1/2 cup cherry tomatoes, halved',
            '1/4 cup cucumber, diced',
            '1/4 cup chickpeas, rinsed',
            '1 tbsp pumpkin seeds',
            'Lemon vinaigrette to taste'
          ]),
          steps: JSON.stringify([
            'Prepare the quinoa according to package instructions and let it cool slightly.',
            'In a bowl, arrange the quinoa at the base.',
            'Top with avocado slices, cherry tomatoes, cucumber, and chickpeas.',
            'Sprinkle pumpkin seeds over the top.',
            'Drizzle with your favorite lemon vinaigrette and serve immediately.'
          ]),
          tags: [
            { name: 'High in Protein' },
            { name: 'Gut Friendly' },
            { name: 'Quick & Easy' }
          ],
          allergens: [],
          contributor: { name: 'Sarah Jenkins' }
        }
      }));
    }

    const recipe = await prisma.recipe.findFirst({
      where: {
        id,
        siteId,
        status: "APPROVED" // Only allow fetching approved recipes here
      },
      include: {
        tags: true,
        allergens: true,
        contributor: { select: { id: true, name: true, email: true, bio: true } },
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(apiSuccess({ recipe }));
  } catch (err) {
    return handleApiError(err);
  }
}
