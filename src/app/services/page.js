import React, { Suspense } from 'react';
import prisma from '@/lib/prisma';
import ServicesClient from './ServicesClient';

export const revalidate = 60; // ISR: revalidate at most every 60 seconds

export const metadata = {
  title: 'Specialized Wellness Services | A Health Place',
  description: 'Explore our medically vetted therapies, consultations, and personalized clinical guidance programs.',
};

export default async function ServicesPage() {
  let dbServices = [];

  const siteId = process.env.NEXT_PUBLIC_SITE_ID || process.env.SITE_ID || 'AHP';

  try {
    dbServices = await prisma.service.findMany({
      where: { 
        siteId,
        deletedAt: null
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        price: true,
        ctaButtonText: true,
        ctaButtonLink: true,
        status: true,
        faqs: true,
        visible: true,
        visibility: true,
        featuredImage: {
          select: { url: true, secureUrl: true, altText: true },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching services from Prisma:', error);
  }

  // Serialize dates and DB values for the client boundary and extract includes from packaged faqs
  const serializedServices = dbServices.map((service) => {
    let faqs = [];
    let includes = [];
    if (service.faqs) {
      try {
        const parsed = typeof service.faqs === "string" ? JSON.parse(service.faqs) : service.faqs;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          faqs = parsed.faqs || [];
          includes = parsed.includes || [];
        } else if (Array.isArray(parsed)) {
          faqs = parsed;
        }
      } catch (e) {
        console.error("Failed to parse service faqs:", e);
      }
    }
    return {
      ...JSON.parse(JSON.stringify(service)),
      faqs,
      includes,
    };
  });

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg-light">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ServicesClient initialServices={serializedServices} />
    </Suspense>
  );
}
