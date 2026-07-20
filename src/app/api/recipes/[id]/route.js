import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSiteId } from "@/lib/siteGuard";
import { handleApiError, apiSuccess } from "@/core/errors";
import { requireAuth } from "@/lib/requireAuth";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    const siteId = getSiteId(req);
    const { id } = await Promise.resolve(params);

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

    const user = await requireAuth().catch(() => null);
    const isAdmin = user?.globalRole === "SUPERADMIN" || user?.globalRole === "ADMIN" || user?.globalRole === "EDITOR";

    const recipe = await prisma.recipe.findFirst({
      where: {
        id,
        siteId,
        // If not admin, restrict to APPROVED. If admin, don't restrict by status.
        ...(isAdmin ? {} : { status: "APPROVED" }) 
      },
      include: {
        tags: true,
        allergens: true,
        contributor: { select: { id: true, name: true, email: true, bio: true } },
      },
    });

    // If still not found (meaning it's not approved and user isn't admin), 
    // maybe check if the user is the contributor themselves
    if (!recipe && user) {
      const myRecipe = await prisma.recipe.findFirst({
         where: { id, siteId, contributorId: user.id },
         include: { tags: true, allergens: true, contributor: { select: { id: true, name: true, email: true, bio: true } } }
      });
      if (myRecipe) {
        return NextResponse.json(apiSuccess({ recipe: myRecipe }));
      }
    }

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(apiSuccess({ recipe }));
  } catch (err) {
    return handleApiError(err);
  }
}
