import React, { Suspense } from 'react';
import prisma from '@/lib/prisma';
import BlogsClient from './BlogsClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Blogs & Guides | A Health Place',
  description: 'Browse our collection of health articles, holistic treatments, and expert medical guides.',
};

export default async function BlogsPage() {
  let categories = [];
  let posts = [];

  try {
    [categories, posts] = await Promise.all([
      prisma.category.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true },
      }),
      prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          publishedAt: true,
          categories: { select: { id: true, name: true, slug: true } },
          tags: { select: { id: true, name: true, slug: true } },
          featuredImage: { select: { url: true, secureUrl: true, altText: true } },
        },
        orderBy: { publishedAt: 'desc' },
        take: 50,
      }),
    ]);
  } catch (error) {
    console.error('Error fetching database data on BlogsPage:', error);
  }

  // Serialize complex DB objects (e.g. Dates) for client rendering boundary
  const serializedCategories = JSON.parse(JSON.stringify(categories));
  const serializedPosts = JSON.parse(JSON.stringify(posts));

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg-light">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BlogsClient 
        initialCategories={serializedCategories}
        initialPosts={serializedPosts}
      />
    </Suspense>
  );
}
