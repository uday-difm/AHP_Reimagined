import { seoService } from "@/services/seo.service";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const siteId = process.env.NEXT_PUBLIC_SITE_ID || "infinium";
    const robotsText = await seoService.getRobotsTxt(siteId);

    return new Response(robotsText, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  } catch (err) {
    return new Response("User-agent: *\nAllow: /", {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}
