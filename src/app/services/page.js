import React, { Suspense } from 'react';
import prisma from '@/lib/prisma';
import ServicesClient from './ServicesClient';

export const metadata = {
  title: 'Specialized Wellness Services | A Health Place',
  description: 'Explore our medically vetted therapies, consultations, and personalized clinical guidance programs.',
};

export default async function ServicesPage() {
  let dbServices = [];

  try {
    dbServices = await prisma.service.findMany({
      where: { 
        status: 'ACTIVE',
        deletedAt: null
      },
      orderBy: { sortOrder: 'asc' },
      include: { featuredImage: true }
    });
  } catch (error) {
    console.error('Error fetching services from Prisma:', error);
  }

  // Serialize dates and DB values for the client boundary
  const serializedServices = JSON.parse(JSON.stringify(dbServices));

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
