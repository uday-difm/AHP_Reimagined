import { NextResponse } from "next/server";
import { analyticsService } from "@/services/analytics.service";
import { handleApiError, apiSuccess } from "@/core/errors";

export async function POST(req) {
  try {
    const body = await req.json();
    const { siteId, visitorId, pageViewed, location, deviceInfo, trafficSource, duration } = body;

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || req.ip
      || "127.0.0.1";

    const { checkRateLimit } = await import("@/lib/rateLimiter");
    const allowed = await checkRateLimit(ipAddress, 100); // Higher limit for analytics
    if (!allowed) {
      return NextResponse.json({ error: "Too Many Requests: Rate limit exceeded" }, { status: 429 });
    }

    if (!siteId || !visitorId || !pageViewed) {
      return NextResponse.json({ error: "siteId, visitorId and pageViewed are required" }, { status: 400 });
    }

    const result = await analyticsService.recordPing(siteId, {
      visitorId,
      pageViewed,
      ipAddress,
      location,
      deviceInfo,
      trafficSource,
      duration: duration !== undefined ? Number(duration) : undefined,
    });

    return NextResponse.json(apiSuccess({ ...result }));
  } catch (err) {
    return handleApiError(err);
  }
}
