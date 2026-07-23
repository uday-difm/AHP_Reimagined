import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess } from '@/core/errors';

/**
 * Helper to evaluate simple JSON targeting rules.
 * Rule schema examples:
 * - { "country": ["US", "CA"] }
 * - { "device": ["mobile", "desktop"] }
 * - { "routes": ["/blogs/*", "/home"] }
 */
function evaluateTargeting(ad, userAgent, route, userCountry) {
  if (!ad.targeting) return true;
  const targeting = typeof ad.targeting === 'string' ? JSON.parse(ad.targeting) : ad.targeting;

  // Device check
  if (targeting.device && Array.isArray(targeting.device)) {
    const isMobile = /mobile|iphone|ipad|android/i.test(userAgent);
    const userDevice = isMobile ? 'mobile' : 'desktop';
    if (!targeting.device.includes(userDevice)) return false;
  }

  // Country check
  if (targeting.country && Array.isArray(targeting.country) && userCountry) {
    if (!targeting.country.includes(userCountry.toUpperCase())) return false;
  }

  // Route matching check
  if (targeting.routes && Array.isArray(targeting.routes) && route) {
    const isRouteMatch = targeting.routes.some(pattern => {
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        return route.startsWith(prefix);
      }
      return route === pattern;
    });
    if (!isRouteMatch) return false;
  }

  return true;
}

/**
 * Helper to evaluate day of week / time of day scheduling.
 */
function evaluateScheduling(ad) {
  if (!ad.scheduling) return true;
  const scheduling = typeof ad.scheduling === 'string' ? JSON.parse(ad.scheduling) : ad.scheduling;
  const now = new Date();

  // Day of week check (0 = Sun, 1 = Mon, ..., 6 = Sat)
  if (scheduling.daysOfWeek && Array.isArray(scheduling.daysOfWeek)) {
    const currentDay = now.getDay();
    if (!scheduling.daysOfWeek.includes(currentDay)) return false;
  }

  // Time of day check (hours 0-23)
  if (scheduling.startHour !== undefined && scheduling.endHour !== undefined) {
    const currentHour = now.getHours();
    if (currentHour < scheduling.startHour || currentHour > scheduling.endHour) return false;
  }

  return true;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const zoneName = searchParams.get('zone');
    const route = searchParams.get('route') || '/';
    const siteId = req.headers.get('x-site-id') || process.env.NEXT_PUBLIC_SITE_ID || 'AHP';
    const userAgent = req.headers.get('user-agent') || '';
    const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || null;

    if (!zoneName) {
      return NextResponse.json({ error: 'Zone parameter missing' }, { status: 400 });
    }

    // Resolve Zone & Site mapping
    const zone = await prisma.adZone.findFirst({
      where: {
        name: zoneName,
        siteId
      }
    });

    if (!zone) {
      return NextResponse.json(apiSuccess({ ads: [] }));
    }

    // Find active Ads assigned to this zone
    const allAds = await prisma.ad.findMany({
      where: {
        zoneId: zone.id,
        siteId,
        status: 'active',
        AND: [
          {
            OR: [
              { startDate: null },
              { startDate: { lte: new Date() } }
            ]
          },
          {
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } }
            ]
          },
          {
            OR: [
              { campaign: null },
              { campaign: { status: 'active' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        type: true,
        code: true,
        imageUrl: true,
        targetUrl: true,
        headline: true,
        description: true,
        ctaText: true,
        priority: true,
        targeting: true,
        scheduling: true,
        impressions: true,
        clicks: true,
        maxClicks: true,
      }
    });

    const matchingAds = allAds.filter(ad => {
      if (ad.maxClicks !== null && ad.maxClicks !== undefined && ad.clicks >= ad.maxClicks) {
        return false;
      }
      return (
        evaluateTargeting(ad, userAgent, route, country) && 
        evaluateScheduling(ad)
      );
    });

    if (matchingAds.length === 0) {
      return NextResponse.json(apiSuccess({ ads: [] }));
    }

    const maxPriority = Math.max(...matchingAds.map(ad => ad.priority || 50));
    const highestPriorityAds = matchingAds.filter(ad => (ad.priority || 50) === maxPriority);

    const sortedByImpressions = highestPriorityAds.sort((a, b) => a.impressions - b.impressions);
    const selectedAd = sortedByImpressions[0];

    const responseAd = {
      id: selectedAd.id,
      name: selectedAd.name,
      type: selectedAd.type,
      code: selectedAd.code,
      imageUrl: selectedAd.imageUrl,
      targetUrl: selectedAd.targetUrl,
      headline: selectedAd.headline,
      description: selectedAd.description,
      ctaText: selectedAd.ctaText
    };

    return NextResponse.json(apiSuccess({ ads: [responseAd] }));
  } catch (err) {
    console.error('Public serve ads error:', err);
    return NextResponse.json(apiSuccess({ ads: [] }));
  }
}
