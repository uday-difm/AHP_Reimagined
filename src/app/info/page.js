import React, { Suspense } from 'react';
import prisma from '@/lib/prisma';
import InfoHubClient from './InfoHubClient';

export const metadata = {
  title: 'Information Hub | A Health Place',
  description: 'Explore our medical review board credentials, contact details, and policies.',
};

export default async function InfoHubPage({ searchParams }) {
  // Await searchParams in Next.js 15+
  const resolvedSearchParams = await searchParams;

  // Fetch actual data from database
  let legalPages = [];

  try {
    legalPages = await prisma.legalPage.findMany();
  } catch (error) {
    console.error('Error fetching database info in InfoHubPage:', error);
  }

  // Safely serialize dates to strings for Client Component boundary
  const serializedLegalPages = JSON.parse(JSON.stringify(legalPages));

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg-light">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <InfoHubClient 
        initialLegalPages={serializedLegalPages}
      />
    </Suspense>
  );
}
