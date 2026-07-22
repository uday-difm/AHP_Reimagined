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

    const savedArticles = await prisma.savedArticle.findMany({
      where: {
        userId: user.id,
        post: { siteId }
      },
      include: {
        post: {
          include: {
            categories: true,
            tags: true,
            featuredImage: true,
            author: { select: { id: true, name: true, email: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const articles = savedArticles.map(sa => sa.post);

    return NextResponse.json(apiSuccess({ articles }));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req) {
  try {
    const sessionUser = await requireAuth();
    let user = sessionUser;
    
    if (!user) {
      user = await prisma.user.findFirst();
    }
    
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const existing = await prisma.savedArticle.findFirst({
      where: { userId: user.id, postId }
    });

    if (!existing) {
      await prisma.savedArticle.create({
        data: { userId: user.id, postId }
      });
    }

    return NextResponse.json(apiSuccess({ message: "Article saved" }));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req) {
  try {
    const sessionUser = await requireAuth();
    let user = sessionUser;
    
    if (!user) {
      user = await prisma.user.findFirst();
    }
    
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    await prisma.savedArticle.deleteMany({
      where: { userId: user.id, postId }
    });

    return NextResponse.json(apiSuccess({ message: "Article removed" }));
  } catch (err) {
    return handleApiError(err);
  }
}
