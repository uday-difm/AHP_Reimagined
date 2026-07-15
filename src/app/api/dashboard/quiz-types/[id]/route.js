import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";

export const dynamic = "force-dynamic";

// PUT /api/dashboard/quiz-types/[id]
export async function PUT(req, { params }) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["SUPERADMIN", "ADMIN", "EDITOR"].includes(user.globalRole))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = parseInt((await params).id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const body = await req.json();
    const { title, subtitle, description, category, categoryColor, imageUrl, icon, estimatedMinutes, difficulty, isActive, sortOrder } = body;

    const qt = await prisma.quizType.update({
      where: { id },
      data: {
        title: title?.trim(),
        subtitle: subtitle?.trim() || null,
        description: description?.trim(),
        category: category?.trim(),
        categoryColor: categoryColor || "#0f7c85",
        imageUrl: imageUrl || null,
        icon: icon || null,
        estimatedMinutes: Number(estimatedMinutes) || 5,
        difficulty: difficulty || "Beginner",
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
      },
    });

    return NextResponse.json(qt);
  } catch (err) {
    console.error("PUT /api/dashboard/quiz-types/[id] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/dashboard/quiz-types/[id]
export async function DELETE(req, { params }) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["SUPERADMIN", "ADMIN"].includes(user.globalRole))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = parseInt((await params).id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    await prisma.quizType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/dashboard/quiz-types/[id] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
