import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess } from "@/core/errors";

const DEFAULT_BANNER_CONFIG = {
  badgeText: "PR & EDITORIAL PLACEMENTS",
  title: "Want to get featured in AHealthPlace?",
  description: "Unlock authority status and reach our highly engaged, health-conscious readers. Align your expertise with a publication vetted by a medical review board.",
  benefits: [
    "Digital Cover Placements",
    "Professionally Written Q&As",
    "High-Domain SEO Backlinks",
    "Magazine Spread Ad Spots"
  ],
  buttonText: "Explore Media Packages",
  buttonLink: "/services",
  bgCoverImage: "/images/mag_strength.png",
  fgCoverImage: "/images/mag_sleep.png"
};

export async function GET(req) {
  try {
    const siteId = req.headers.get("x-site-id") || process.env.NEXT_PUBLIC_SITE_ID || "AHP";
    
    const settings = await prisma.globalSettings.findUnique({
      where: { siteId },
      select: { websiteSettings: true }
    });

    const customConfig = settings?.websiteSettings?.servicesBannerConfig || {};

    const bannerConfig = {
      ...DEFAULT_BANNER_CONFIG,
      ...customConfig,
      benefits: customConfig.benefits && customConfig.benefits.length > 0
        ? customConfig.benefits
        : DEFAULT_BANNER_CONFIG.benefits
    };

    return NextResponse.json(apiSuccess({ bannerConfig }));
  } catch (err) {
    console.error("Public services banner config GET error:", err);
    return NextResponse.json(apiSuccess({ bannerConfig: DEFAULT_BANNER_CONFIG }));
  }
}
