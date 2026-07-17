import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkSitePermission } from '@/lib/apiAuth';
import { apiSuccess } from '@/core/errors';

export async function GET(req, { params }) {
  const auth = await checkSitePermission(req, 'ADMIN');
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID parameter' }, { status: 400 });
    }

    const ad = await prisma.legacyAd.findUnique({
      where: { id }
    });

    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    // Fetch individual ad stats
    const eventsGroup = await prisma.legacyAdEvent.groupBy({
      by: ['eventType'],
      where: { adId: id },
      _count: {
        _all: true
      }
    });

    let impressions = 0;
    let clicks = 0;
    eventsGroup.forEach(g => {
      if (g.eventType === 'impression') impressions = g._count._all;
      if (g.eventType === 'click') clicks = g._count._all;
    });

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

    return NextResponse.json(apiSuccess({
      ad: {
        ...ad,
        impressions,
        clicks,
        ctr: parseFloat(ctr.toFixed(2))
      }
    }));
  } catch (err) {
    console.error('Get ad error:', err);
    return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const auth = await checkSitePermission(req, 'ADMIN');
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID parameter' }, { status: 400 });
    }

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
      targetLocation
    } = body;

    const existingAd = await prisma.legacyAd.findUnique({
      where: { id }
    });

    if (!existingAd) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    const updatedAd = await prisma.legacyAd.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingAd.title,
        description: description !== undefined ? description : existingAd.description,
        mediaUrl: mediaUrl !== undefined ? mediaUrl : existingAd.mediaUrl,
        mediaType: mediaType !== undefined ? mediaType : existingAd.mediaType,
        targetUrl: targetUrl !== undefined ? targetUrl : existingAd.targetUrl,
        placement: placement !== undefined ? placement : existingAd.placement,
        status: status !== undefined ? status : existingAd.status,
        priority: priority !== undefined ? Number(priority) : existingAd.priority,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : existingAd.startDate,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existingAd.endDate,
        targetDevice: targetDevice !== undefined ? targetDevice : existingAd.targetDevice,
        targetLocation: targetLocation !== undefined ? targetLocation : existingAd.targetLocation
      }
    });

    return NextResponse.json(apiSuccess({ ad: updatedAd }));
  } catch (err) {
    console.error('Update ad error:', err);
    return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const auth = await checkSitePermission(req, 'ADMIN');
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID parameter' }, { status: 400 });
    }

    const existingAd = await prisma.legacyAd.findUnique({
      where: { id }
    });

    if (!existingAd) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    // Soft-delete by setting status = 'expired'
    const softDeletedAd = await prisma.legacyAd.update({
      where: { id },
      data: { status: 'expired' }
    });

    return NextResponse.json(apiSuccess({ ad: softDeletedAd, message: 'Ad soft-deleted successfully' }));
  } catch (err) {
    console.error('Soft delete ad error:', err);
    return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
  }
}
