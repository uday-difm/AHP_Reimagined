import { getObjectFromS3 } from "@/../utils/s3Utility";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return new NextResponse("Missing key parameter", { status: 400 });
    }

    const { body, contentType, contentLength } = await getObjectFromS3(key);

    const siteId = key.split("/")[0]?.replace("site-", "") || "AHP";
    
    let maxAgeSeconds = 31536000; // 1 year fallback
    try {
      const prisma = (await import("@/lib/prisma")).default;
      const settings = await prisma.globalSettings.findUnique({
        where: { siteId },
        select: { performanceConfig: true }
      });
      const performanceConfig = settings?.performanceConfig || {};
      const cachingDays = performanceConfig.browserCachingDays ?? 365;
      maxAgeSeconds = cachingDays * 24 * 60 * 60;
    } catch (dbErr) {
      console.warn("Could not load caching days setting, using fallback:", dbErr.message);
    }

    const headers = new Headers();
    headers.set("Content-Type", contentType || "application/octet-stream");
    if (contentLength) {
      headers.set("Content-Length", contentLength.toString());
    }
    headers.set("Cache-Control", `public, max-age=${maxAgeSeconds}`);

    // Convert the S3 readable stream to a web Response stream
    return new NextResponse(body, {
      headers,
    });
  } catch (err) {
    console.error("Error reading file from S3 proxy:", err);
    return new NextResponse("File not found", { status: 404 });
  }
}
