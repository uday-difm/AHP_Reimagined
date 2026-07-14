import prisma from "@/lib/prisma";
import { seoService } from "@/services/seo.service";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const siteId = process.env.NEXT_PUBLIC_SITE_ID || "infinium";
    const items = await seoService.getSitemapItems(siteId);

    // Fetch site domain setting with fallback
    const settings = await prisma.globalSettings.findUnique({
      where: { siteId },
      select: { websiteSettings: true }
    });
    const domain = (settings?.websiteSettings?.domain || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const item of items) {
      const url = `${domain}${item.url}`;
      const lastmod = item.lastModified || new Date().toISOString();
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(url)}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      {
        headers: { "Content-Type": "application/xml; charset=utf-8" },
        status: 500,
      },
    );
  }
}

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
