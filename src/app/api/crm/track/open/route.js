import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const logId = searchParams.get("logId");

  if (logId) {
    try {
      const log = await prisma.campaignLog.findUnique({
        where: { id: logId }
      });
      if (log && log.status !== "opened" && log.status !== "clicked") {
        await prisma.campaignLog.update({
          where: { id: logId },
          data: {
            status: "opened",
            openedAt: new Date(),
          }
        });
      }
    } catch (err) {
      console.error("[TrackOpen] Error updating log:", err.message);
    }
  }

  // Return a transparent 1x1 GIF
  const buffer = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );
  return new Response(buffer, {
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
export const dynamic = "force-dynamic";
