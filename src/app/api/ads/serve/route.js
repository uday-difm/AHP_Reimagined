import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSiteId } from '@/lib/siteGuard';
import { apiSuccess } from '@/core/errors';

function evaluateTargeting(ad, userAgent, route, country) {
  if (!ad.targeting) return true;
  try {
    const rules = JSON.parse(ad.targeting);
    
    // 1. Device Targeting
    if (rules.device && rules.device !== 'all') {
      const isMobileUA = /mobile|iphone|ipad|android|phone/i.test(userAgent || '');
      if (rules.device === 'mobile' && !isMobileUA) return false;
      if (rules.device === 'desktop' && isMobileUA) return false;
    }
    
    // 2. Browser Targeting
    if (rules.browser && rules.browser !== 'all') {
      const ua = (userAgent || '').toLowerCase();
      const target = rules.browser.toLowerCase();
      if (!ua.includes(target)) return false;
    }

    // 3. OS Targeting
    if (rules.os && rules.os !== 'all') {
      const ua = (userAgent || '').toLowerCase();
      const target = rules.os.toLowerCase();
      if (!ua.includes(target)) return false;
    }

    // 4. Country Targeting
    if (rules.country && rules.country !== 'all') {
      const userCountry = (country || '').toUpperCase();
      const target = rules.country.toUpperCase();
      if (userCountry && userCountry !== target) return false;
    }

    // 5. Route/Page Targeting
    if (rules.routes && rules.routes.length > 0) {
      const currentRoute = route || '/';
      const isMatch = rules.routes.some(pattern => {
        if (pattern.endsWith('*')) {
          const prefix = pattern.slice(0, -1);
          return currentRoute.startsWith(prefix);
        }
        return currentRoute === pattern;
      });
      if (!isMatch) return false;
    }

    return true;
  } catch (e) {
    console.error('Targeting evaluation error:', e);
    return true;
  }
}

function evaluateScheduling(ad) {
  if (!ad.scheduling) return true;
  try {
    const rules = JSON.parse(ad.scheduling);
    const now = new Date();
    const tz = rules.timezone || 'UTC';
    
    // Resolve time details in target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
    
    const timeParts = formatter.format(now).split(':');
    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);
    const timeVal = hour * 60 + minute;
    
    // Weekday: Sunday=0, Monday=1, etc.
    const currentDay = now.getDay();
    if (rules.days && rules.days.length > 0) {
      const allowedDays = rules.days.map(Number);
      if (!allowedDays.includes(currentDay)) return false;
    }
    
    // Time frame
    if (rules.timeStart && rules.timeEnd) {
      const [sh, sm] = rules.timeStart.split(':').map(Number);
      const [eh, em] = rules.timeEnd.split(':').map(Number);
      const startVal = sh * 60 + sm;
      const endVal = eh * 60 + em;
      
      if (timeVal < startVal || timeVal > endVal) return false;
    }
    
    return true;
  } catch (e) {
    console.error('Scheduling evaluation error:', e);
    return true;
  }
}

export async function GET(req) {
  try {
    const siteId = getSiteId(req);
    const { searchParams } = new URL(req.url);
    const zoneSlug = searchParams.get('zone');
    const route = searchParams.get('route') || '/';
    
    if (!zoneSlug) {
      return NextResponse.json({ error: 'Zone slug parameter is required' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || '';
    const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || '';

    // Query active ads for the zone & campaign status
    const allAds = await prisma.ad.findMany({
      where: {
        isActive: true,
        zone: { siteId, slug: zoneSlug },
        OR: [
          { startDate: null },
          { startDate: { lte: new Date() } }
        ],
        AND: [
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

    // 1. Evaluate Targeting, Scheduling, and Max Click rules
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

    // 2. Priority Filter (pick highest priority group)
    const maxPriority = Math.max(...matchingAds.map(ad => ad.priority || 50));
    const highestPriorityAds = matchingAds.filter(ad => (ad.priority || 50) === maxPriority);

    // 3. Rotation: Select the ad with the lowest number of impressions in the group
    // This provides sequential/fair impressions distribution across matching campaigns.
    const sortedByImpressions = highestPriorityAds.sort((a, b) => a.impressions - b.impressions);
    const selectedAd = sortedByImpressions[0];

    // Pick only matching properties to return
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
    return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
  }
}
