import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess } from '@/core/errors';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const placement = searchParams.get('placement');
    const device = searchParams.get('device') || 'all'; // all | mobile | desktop

    if (!placement) {
      return NextResponse.json({ error: 'Placement parameter is required' }, { status: 400 });
    }

    const now = new Date();

    // Query active ads matching placement, status, scheduling, and device targeting
    const activeAds = await prisma.legacyAd.findMany({
      where: {
        placement,
        status: 'active',
        OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } }
            ]
          },
          {
            OR: [
              { targetDevice: null },
              { targetDevice: 'all' },
              { targetDevice: device }
            ]
          }
        ]
      },
      orderBy: {
        priority: 'desc'
      },
      take: 5
    });

    // Public endpoint: Cache results for 30s using standard Cache-Control headers
    const response = NextResponse.json(apiSuccess({ ads: activeAds }));
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=15');
    return response;
  } catch (err) {
    console.error('Fetch active ads error:', err);
    return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
  }
}
