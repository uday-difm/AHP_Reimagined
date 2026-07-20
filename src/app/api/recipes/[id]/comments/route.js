import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError, apiSuccess } from "@/core/errors";
import { requireAuth } from "@/lib/requireAuth";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const comments = await prisma.recipeComment.findMany({
      where: { recipeId: id },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(apiSuccess({ comments }));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req, { params }) {
  try {
    const user = await requireAuth();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const body = await req.json();
    const { content } = body;

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Comment content cannot be empty" }, { status: 400 });
    }

    const comment = await prisma.recipeComment.create({
      data: {
        recipeId: id,
        userId: user.id,
        content: content.trim()
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    return NextResponse.json(apiSuccess({ comment }));
  } catch (err) {
    return handleApiError(err);
  }
}
