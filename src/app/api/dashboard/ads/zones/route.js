import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkSitePermission } from '@/lib/apiAuth';
import { z } from 'zod';
import { apiSuccess } from '@/core/errors';

function slugify(text = '') {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

const CreateZoneSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
});

export async function GET(req) {
  const auth = await checkSitePermission(req, 'EDITOR');
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    let zones = await prisma.adZone.findMany({
      where: { siteId: auth.siteId },
      orderBy: { name: 'asc' },
    });

    const REQUIRED_ZONES = [
      { name: 'Homepage Blog Card Ad (300x250)', slug: 'homepage-blog-card', width: 300, height: 250 },
      { name: 'Homepage Quiz Card Ad (300x250)', slug: 'homepage-quiz-card', width: 300, height: 250 },
      { name: 'Homepage Articles Sidebar Skyscraper (300x600)', slug: 'homepage-articles-sidebar', width: 300, height: 600 },
      { name: 'Home Articles Bottom (970x90)', slug: 'homepage-articles-bottom', width: 970, height: 90 },
      { name: 'Home About Bottom (728x90)', slug: 'homepage-about-bottom', width: 728, height: 90 },
      { name: 'Home Events Bottom (728x90)', slug: 'homepage-events-bottom', width: 728, height: 90 },
      { name: 'Sidebar Ad Banner (300x250)', slug: 'hero-sidebar-bottom', width: 300, height: 250 },
      { name: 'Services Top banner (728x90)', slug: 'services-top', width: 728, height: 90 },
      { name: 'Article Body Top (728x90)', slug: 'article-body-top', width: 728, height: 90 },
      { name: 'Article Body Inline (300x250)', slug: 'article-body-inline', width: 300, height: 250 },
      { name: 'Article Body Bottom (728x90)', slug: 'article-body-bottom', width: 728, height: 90 },
      { name: 'About Hero Bottom (728x90)', slug: 'about-hero-bottom', width: 728, height: 90 },
      { name: 'About Mission Bottom (970x90)', slug: 'about-mission-bottom', width: 970, height: 90 },
    ];

    const existingSlugs = new Set(zones.map(z => z.slug));
    const missingZones = REQUIRED_ZONES.filter(rz => !existingSlugs.has(rz.slug));

    if (missingZones.length > 0) {
      await prisma.adZone.createMany({
        data: missingZones.map(z => ({
          siteId: auth.siteId,
          name: z.name,
          slug: z.slug,
          width: z.width,
          height: z.height,
        })),
        skipDuplicates: true
      });

      zones = await prisma.adZone.findMany({
        where: { siteId: auth.siteId },
        orderBy: { name: 'asc' },
      });
    }

    return NextResponse.json(apiSuccess({ zones }));
  } catch (err) {
    console.error('Fetch ad zones error:', err);
    return NextResponse.json({ error: 'Failed to fetch ad zones' }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await checkSitePermission(req, 'EDITOR');
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const body = await req.json();
    const data = CreateZoneSchema.parse(body);
    const baseSlug = data.slug ? slugify(data.slug) : slugify(data.name);

    const existing = await prisma.adZone.findFirst({
      where: { siteId: auth.siteId, slug: baseSlug },
    });

    if (existing) {
      return NextResponse.json({ error: 'A zone with this slug or name already exists' }, { status: 400 });
    }

    const zone = await prisma.adZone.create({
      data: {
        siteId: auth.siteId,
        name: data.name.trim(),
        slug: baseSlug,
        width: data.width || null,
        height: data.height || null,
      },
    });

    return NextResponse.json(apiSuccess({ zone }), { status: 201 });
  } catch (err) {
    console.error('Create zone error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create zone' }, { status: 500 });
  }
}
