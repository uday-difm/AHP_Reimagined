import { seoService } from "@/services/seo.service";
import { getSiteId } from "@/lib/siteGuard";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const siteId = getSiteId(req);
    
    const settings = await prisma.globalSettings.findUnique({
      where: { siteId },
      select: { scripts: true, websiteSettings: true }
    });

    let llmText = settings?.websiteSettings?.llmTxt || settings?.scripts?.llmTxt;
    if (!llmText) {
      llmText = await seoService.getLlmTxt(siteId);
    }

    return new Response(llmText, {
      headers: { 
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600"
      }
    });
  } catch (err) {
    return new Response("# Error resolving llms.txt\n" + err.message, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      status: 500
    });
  }
}
