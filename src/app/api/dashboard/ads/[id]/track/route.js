import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { type, visitorId } = body;

    if (type !== 'impression' && type !== 'click') {
      return NextResponse.json({ error: 'Invalid tracking type' }, { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for') || req.ip || null;
    const userAgent = req.headers.get('user-agent') || null;

    // Check if ad exists
    const ad = await prisma.ad.findUnique({
      where: { id }
    });

    if (!ad) {
      return NextResponse.json({ error: 'Advertisement not found' }, { status: 404 });
    }

    // Increment count on Ad model and log analytics row
    const [updatedAd] = await prisma.$transaction([
      prisma.ad.update({
        where: { id },
        data: {
          impressions: type === 'impression' ? { increment: 1 } : undefined,
          clicks: type === 'click' ? { increment: 1 } : undefined,
        }
      }),
      prisma.adAnalytic.create({
        data: {
          adId: id,
          type,
          visitorId: visitorId || null,
          ipAddress,
          userAgent
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      impressions: updatedAd.impressions,
      clicks: updatedAd.clicks
    });
  } catch (err) {
    console.error('Ad tracking error:', err);
    return NextResponse.json({ error: 'Failed to record event', message: err.message }, { status: 500 });
  }
}
