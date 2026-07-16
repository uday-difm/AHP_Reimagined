import { getSiteId } from "@/lib/siteGuard";
import { mediaService } from "@/services/media.service";
import { handleApiError } from "@/core/errors";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const siteId = getSiteId(request);
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId") || "root";
    
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "60", 10);
    const [media, total] = await Promise.all([
      mediaService.repository.findByFolder(siteId, folderId, { take: limit, skip: (page - 1) * limit }),
      mediaService.repository.countByFolder(siteId, folderId),
    ]);
    return NextResponse.json({ data: media, total, page, limit });
  } catch (err) {
    return handleApiError(err);
  }
}
