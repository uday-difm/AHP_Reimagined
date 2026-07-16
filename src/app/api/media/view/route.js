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

    const headers = new Headers();
    headers.set("Content-Type", contentType || "application/octet-stream");
    if (contentLength) {
      headers.set("Content-Length", contentLength.toString());
    }
    const siteIdMatch = key.match(/^site-([^\/]+)\//);
    const siteId = siteIdMatch ? siteIdMatch[1] : (process.env.NEXT_PUBLIC_SITE_ID || "AHP");

    const getPerformanceConfig = (await import("next/cache")).unstable_cache(
      async (sId) => {
        const prisma = (await import("@/lib/prisma")).default;
        const settings = await prisma.globalSettings.findUnique({
          where: { siteId: sId },
          select: { performanceConfig: true }
        });
        return settings?.performanceConfig || {};
      },
      [`media-performance-config-${siteId}`],
      { revalidate: 3600 }
    );

    const perfConfig = await getPerformanceConfig(siteId);
    const cachingDays = perfConfig?.browserCachingDays ?? 7;
    const maxAgeSeconds = cachingDays * 24 * 60 * 60;

    // Cache static media assets in CDN and browser based on configuration
    headers.set("Cache-Control", `public, max-age=${maxAgeSeconds}, immutable`);

    // Convert the S3 readable stream to a web Response stream
    return new NextResponse(body, {
      headers,
    });
  } catch (err) {
    console.error("Error reading file from S3 proxy:", err);
    return new NextResponse("File not found", { status: 404 });
  }
}
