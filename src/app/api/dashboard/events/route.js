import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkSitePermission } from '@/lib/apiAuth';
import { apiSuccess, handleApiError } from '@/core/errors';

export async function GET(req) {
  try {
    const auth = await checkSitePermission(req, 'EDITOR');
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const events = await prisma.communityEvent.findMany({
      where: { siteId: auth.siteId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(apiSuccess({ events }));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req) {
  try {
    const auth = await checkSitePermission(req, 'EDITOR');
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json();
    
    if (body.isFeatured) {
      await prisma.communityEvent.updateMany({
        where: { siteId: auth.siteId, isFeatured: true },
        data: { isFeatured: false }
      });
    }

    const event = await prisma.communityEvent.create({
      data: {
        siteId: auth.siteId,
        title: body.title || 'Restorative Walk: Managing Stress in Nature',
        category: body.category || 'MINDFULNESS WALK',
        description: body.description || '',
        imageUrl: body.imageUrl || '/images/hero_exercise.png',
        eventDate: body.eventDate || 'Sat, 27 July 2024',
        eventTime: body.eventTime || '9:00 AM – 11:30 AM',
        location: body.location || 'City Nature Park',
        tags: body.tags || 'Mindfulness, Outdoor, Beginner Friendly',
        reservedSeats: body.reservedSeats ? Number(body.reservedSeats) : 45,
        totalSeats: body.totalSeats ? Number(body.totalSeats) : 60,
        isFeatured: body.isFeatured ?? true,
        status: body.status || 'active'
      }
    });

    return NextResponse.json(apiSuccess({ event }), { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
