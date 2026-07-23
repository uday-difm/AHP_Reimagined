import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess } from "@/core/errors";
import { settingsService } from "@/services/settings.service";

export async function GET(req) {
  try {
    const siteId = process.env.NEXT_PUBLIC_SITE_ID || "AHP";
    
    let communityConfig = null;
    try {
      const websiteSettings = await settingsService.getSettingsField(siteId, "websiteSettings");
      communityConfig = websiteSettings?.communityConfig || null;
    } catch (e) {
      console.warn("Failed to load communityConfig from settings:", e.message);
    }

    let event = null;
    if (!communityConfig?.forceComingSoon) {
      event = await prisma.communityEvent.findFirst({
        where: { siteId, status: "active", isFeatured: true },
        orderBy: { createdAt: "desc" },
      });

      if (!event) {
        event = await prisma.communityEvent.findFirst({
          where: { siteId, status: "active" },
          orderBy: { createdAt: "desc" },
        });
      }
    }

    const DEFAULT_COMMUNITY_CONFIG = {
      forceComingSoon: false,
      comingSoonTitle: "Upcoming Community Events (Coming Soon!)",
      comingSoonDesc: "We are preparing our next round of group nature walks, online yoga sessions, and wellness seminars. Check back soon for new dates!",
      subtitle: "COMMUNITY CONNECTION",
      title: "Our Community & Events",
      description: "We host regular group nature walks, online yoga sessions, and stress management seminars created by wellness experts to keep you connected and inspired.",
      features: [
        { title: "Nature Walks", sub: "Reconnect", icon: "sun" },
        { title: "Yoga Sessions", sub: "Strengthen", icon: "user" },
        { title: "Wellness Talks", sub: "Learn", icon: "globe" },
        { title: "Community", sub: "Support", icon: "users" }
      ],
      communityBox: {
        title: "Our Community",
        badgeText: "+ More Members",
        description: "Join a growing community focused on wellness, mindfulness and healthy living."
      },
      testimonialBox: {
        quote: "Being part of these sessions has helped me stay more mindful, active and positive.",
        author: "— A COMMUNITY MEMBER"
      },
      ctaButtons: {
        primaryText: "Join Community",
        primaryLink: "/register",
        secondaryText: "Explore All Events",
        secondaryLink: "/events"
      }
    };

    return NextResponse.json(apiSuccess({
      event: event || null,
      communityConfig: communityConfig ? { ...DEFAULT_COMMUNITY_CONFIG, ...communityConfig } : DEFAULT_COMMUNITY_CONFIG
    }));
  } catch (err) {
    console.error("Public events GET error:", err);
    return NextResponse.json(apiSuccess({ event: null }));
  }
}
