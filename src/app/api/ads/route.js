import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkSitePermission } from '@/lib/apiAuth';
import { apiSuccess } from '@/core/errors';

export async function GET(req) {
  const auth = await checkSitePermission(req, 'ADMIN');
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const placement = searchParams.get('placement');

    const where = {};
    if (status) where.status = status;
    if (placement) where.placement = placement;

    // Fetch matching ads and compute click-through rates
    const ads = await prisma.legacyAd.findMany({
      where,
      include: {
        _count: {
          select: {
            events: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Fetch stats group by adId and eventType
    const eventsGroup = await prisma.legacyAdEvent.groupBy({
      by: ['adId', 'eventType'],
      _count: {
        _all: true
      }
    });

    const statsMap = {};
    eventsGroup.forEach(g => {
      if (!statsMap[g.adId]) {
        statsMap[g.adId] = { impressions: 0, clicks: 0 };
      }
      if (g.eventType === 'impression') {
        statsMap[g.adId].impressions = g._count._all;
      } else if (g.eventType === 'click') {
        statsMap[g.adId].clicks = g._count._all;
      }
    });

    const adsWithStats = ads.map(ad => {
      const stats = statsMap[ad.id] || { impressions: 0, clicks: 0 };
      const ctr = stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0;
      return {
        ...ad,
        impressions: stats.impressions,
        clicks: stats.clicks,
        ctr: parseFloat(ctr.toFixed(2))
      };
    });

    return NextResponse.json(apiSuccess({ ads: adsWithStats }));
  } catch (err) {
    console.error('List ads error:', err);
    return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await checkSitePermission(req, 'ADMIN');
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      mediaUrl,
      mediaType,
      targetUrl,
      placement,
      status,
      priority,
      startDate,
      endDate,
      targetDevice,
      targetLocation,
      createdBy
    } = body;

    if (!title || !mediaUrl || !targetUrl || !placement) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ad = await prisma.legacyAd.create({
      data: {
        title,
        description: description || null,
        mediaUrl,
        mediaType: mediaType || 'image',
        targetUrl,
        placement,
        status: status || 'draft',
        priority: priority !== undefined ? Number(priority) : 1,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        targetDevice: targetDevice || 'all',
        targetLocation: targetLocation || null,
        createdBy: createdBy !== undefined ? Number(createdBy) : null
      }
    });

    return NextResponse.json(apiSuccess({ ad }), { status: 201 });
  } catch (err) {
    console.error('Create ad error:', err);
    return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
  }
}
