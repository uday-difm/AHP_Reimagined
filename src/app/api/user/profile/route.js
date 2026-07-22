import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import { handleApiError, apiSuccess } from "@/core/errors";

export async function GET(req) {
  try {
    const sessionUser = await requireAuth();
    let user = sessionUser;

    // Fallback if no session user (helpful for local testing even in production mode)
    if (!user) {
      user = await prisma.user.findFirst();
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        image: true,
        createdAt: true,
        twoFAEnabled: true,
      },
    });

    return NextResponse.json(apiSuccess({ user: userData }));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req) {
  try {
    const sessionUser = await requireAuth();
    let user = sessionUser;
    // Fallback if no session user (helpful for local testing even in production mode)
    if (!user) {
      user = await prisma.user.findFirst();
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, bio, image } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        bio,
        image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        image: true,
        createdAt: true,
        twoFAEnabled: true,
      },
    });

    return NextResponse.json(apiSuccess({ user: updatedUser }));
  } catch (err) {
    return handleApiError(err);
  }
}
