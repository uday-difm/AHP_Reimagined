import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess } from "@/core/errors";

export async function GET(req) {
  try {
    const siteId = process.env.NEXT_PUBLIC_SITE_ID || "AHP";
    
    // Find active featured event first
    let event = await prisma.communityEvent.findFirst({
      where: { siteId, status: "active", isFeatured: true },
      orderBy: { createdAt: "desc" },
    });

    if (!event) {
      // Find any active event
      event = await prisma.communityEvent.findFirst({
        where: { siteId, status: "active" },
        orderBy: { createdAt: "desc" },
      });
    }

    // Return null if no active event is configured in the database backend
    return NextResponse.json(apiSuccess({ event: event || null }));
  } catch (err) {
    console.error("Public events GET error:", err);
    return NextResponse.json(apiSuccess({ event: null }));
  }
}
