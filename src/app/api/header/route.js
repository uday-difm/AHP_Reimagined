import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess } from "@/core/errors";
import { getSiteId } from "@/lib/siteGuard";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get("siteId") || getSiteId(req);

    if (!siteId) {
      return NextResponse.json({ error: "siteId is required" }, { status: 400 });
    }

    const settings = await prisma.globalSettings.findUnique({
      where: { siteId },
      select: { header: true }
    });

    return NextResponse.json(apiSuccess({ header: settings?.header || null }));
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}
