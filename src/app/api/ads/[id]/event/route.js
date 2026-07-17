import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess } from '@/core/errors';

export async function POST(req, { params }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID parameter' }, { status: 400 });
    }

    const body = await req.json();
    const { type } = body; // type is 'impression' or 'click'

    if (!type || !['impression', 'click'].includes(type)) {
      return NextResponse.json({ error: 'Invalid or missing event type (must be impression or click)' }, { status: 400 });
    }

    // Check if the ad exists
    const ad = await prisma.legacyAd.findUnique({
      where: { id }
    });

    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    const userIp = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Rate-limit check: check for duplicates in the last 10 seconds to prevent click/impression fraud
    const recentTimeLimit = new Date(Date.now() - 10000);
    const existingRecentEvent = await prisma.legacyAdEvent.findFirst({
      where: {
        adId: id,
        eventType: type,
        userIp,
        createdAt: { gte: recentTimeLimit }
      }
    });

    if (existingRecentEvent) {
      // Return success but indicate it was a rate-limited duplicate to prevent double logging
      return NextResponse.json(apiSuccess({ logged: false, duplicate: true }));
    }

    // Log event in database
    const event = await prisma.legacyAdEvent.create({
      data: {
        adId: id,
        eventType: type,
        userIp,
        userAgent
      }
    });

    return NextResponse.json(apiSuccess({ logged: true, event }));
  } catch (err) {
    console.error('Track event error:', err);
    return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
  }
}
