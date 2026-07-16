import React, { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdSlot from '@/components/AdSlot';
import { Play } from 'lucide-react';
import DOMPurify from "isomorphic-dompurify";
export const revalidate = 60; // ISR: Revalidate every 60 seconds

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const siteId = process.env.NEXT_PUBLIC_SITE_ID || process.env.SITE_ID || "infinium";

  let post = null;
  try {
    post = await prisma.post.findFirst({
      where: { siteId, slug, status: "PUBLISHED", deletedAt: null },
      include: { featuredImage: true }
    });
  } catch (e) {
    console.error("Error fetching post metadata:", e);
  }

  if (!post || post.status !== "PUBLISHED" || post.deletedAt) {
    return { title: "Article Not Found" };
  }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
    alternates: post.canonicalUrl ? { canonical: post.canonicalUrl } : undefined,
    openGraph: post.ogImage ? { images: [{ url: post.ogImage }] } : undefined,
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const siteId = process.env.NEXT_PUBLIC_SITE_ID || process.env.SITE_ID || "infinium";

  let post = null;
  let fallbackRelated = [];
  try {
    post = await prisma.post.findFirst({
      where: { siteId, slug, status: "PUBLISHED", deletedAt: null },
      include: {
        categories: true,
        tags: true,
        author: { select: { id: true, email: true, name: true, bio: true } },
        featuredImage: true,
      }
    });

    const related = await prisma.post.findMany({
      where: { siteId, status: "PUBLISHED", deletedAt: null, slug: { not: slug } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { featuredImage: true, categories: true }
    });
    fallbackRelated = related;
  } catch (e) {
    console.error("Error fetching post data:", e);
  }

  if (!post || post.status !== "PUBLISHED" || post.deletedAt) {
    notFound();
  }

  const categoryName = post.categories?.[0]?.name || 'General';
  const authorName = post.author?.name || post.author?.email?.split('@')[0] || 'A Health Place Expert';
  const displayDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    : '';

  const rawTextContent = (post.content || '').replace(/<[^>]+>/g, '').trim();
  const wordCount = rawTextContent.split(/\s+/).filter(Boolean).length;
  const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  const sanitizedHtml = DOMPurify.sanitize(
    typeof post.content === "string" ? post.content : ""
  );

  function proxyUrl(url) {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return `/api/media/proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  }

  const featuredImgUrl = proxyUrl(post.featuredImage?.secureUrl || post.featuredImage?.url || '/images/holistic.png');

  return (
    <div className="min-h-screen bg-bg-light relative">
      <Header />

      <main className="pt-[140px] pb-20">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="breadcrumb flex items-center gap-2 text-[12px] text-muted font-semibold uppercase tracking-[1px] mb-6">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <span>•</span>
            <Link href="/blogs" className="hover:text-accent transition-colors">
              {categoryName}
            </Link>
            <span>•</span>
            <span className="text-secondary truncate">{post.title}</span>
          </div>

          {/* Heading */}
          <div className="article-header mb-10 text-left">
            <span className="inline-block bg-accent/10 border border-accent/20 text-accent font-bold text-[10px] uppercase tracking-[1.5px] px-3.5 py-1.5 rounded-full mb-4">
              {categoryName}
            </span>
            <h1 className="font-heading font-extrabold text-[36px] md:text-[54px] text-primary leading-[1.1] tracking-[-1.5px] mb-6">
              {post.title}
            </h1>

            {/* Byline */}
            <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center gap-3 md:gap-6 border-y border-slate-200/60 py-4 text-[13px] text-secondary">
              <div>
                <span className="text-muted font-medium">Written by</span> <span className="font-bold text-primary">{authorName}</span>
              </div>
              <div className="hidden md:block w-1.5 h-1.5 bg-slate-300 rounded-full shrink-0" />
              <div>
                <span className="text-muted font-medium">Medically Reviewed by</span> <span className="font-bold text-primary">Editorial Team</span>
              </div>
              {displayDate && (
                <>
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                  <div>
                    <span className="font-semibold text-accent-green">{displayDate}</span>
                  </div>
                </>
              )}
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full ml-auto hidden md:block" />
              <div className="text-muted font-semibold uppercase tracking-[0.5px] hidden md:block">
                {readTime}
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="article-image-wrapper relative w-full h-[260px] sm:h-[450px] rounded-[32px] overflow-hidden shadow-[0_20px_48px_rgba(0,0,0,0.06)] border border-white/60 mb-12">
            <Image
              src={featuredImgUrl}
              alt={post.featuredImage?.altText || post.title}
              fill
              unoptimized
              priority
              unoptimized
              className="object-cover"
              sizes="100vw"
            />
          </div>

          <AdSlot zone="article-body-top" />

          {/* Article Body */}
          <article className="article-body-content mx-auto">
            {/* Intro */}
            {post.excerpt && (
              <p className="text-[17px] md:text-[19px] leading-relaxed text-primary font-medium mb-10 border-l-3 border-accent pl-5">
                {post.excerpt}
              </p>
            )}

            <AdSlot zone="article-body-inline" layout="float" />

            {/* Main Content */}
            <div
              className="prose prose-slate max-w-none text-[15px] md:text-[16px] leading-[1.8] text-secondary space-y-4"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-slate-200/60">
                <span className="text-sm font-bold text-slate-800 mr-2">Tags:</span>
                {post.tags.map(t => (
                  <Link
                    key={t.id}
                    href={`/blogs?tag=${t.slug || t.name}`}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-md transition duration-200 no-underline"
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            )}
          </article>

          <AdSlot zone="article-body-bottom" />

          {/* Related Articles Divider */}
          <div className="border-t border-slate-200 mt-20 pt-16">
            <div className="flex justify-between items-end mb-10">
              <div>
                <span className="text-[11px] font-bold tracking-[2px] text-accent uppercase block mb-1">HEALTH INTEGRITY</span>
                <h3 className="font-heading font-extrabold text-2xl md:text-3xl text-primary tracking-[-0.5px]">Related Reads</h3>
              </div>
              <Link href="/blogs" className="text-accent font-bold text-sm hover:underline flex items-center gap-1">
                All Guides <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fallbackRelated.map((item) => {
                const itemImg = proxyUrl(item.featuredImage?.secureUrl || item.featuredImage?.url || '/images/holistic.png');
                const itemCat = item.categories?.[0]?.name || 'General';
                return (
                  <Link
                    key={item.id}
                    href={`/blogs/${item.slug}`}
                    className="group cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.01)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.03)]"
                  >
                    <div className="relative w-full h-[140px] rounded-xl overflow-hidden mb-4">
                      <Image
                        src={itemImg}
                        alt={item.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1.5">{itemCat}</span>
                    <h4 className="font-heading font-bold text-[14.5px] text-primary leading-snug group-hover:text-accent transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer className="pt-0 pb-20" />
    </div>
  );
}

export async function generateStaticParams() {
  const siteId = process.env.NEXT_PUBLIC_SITE_ID || process.env.SITE_ID || "infinium";
  const posts = await prisma.post.findMany({
    where: { siteId, status: "PUBLISHED", deletedAt: null },
    select: { slug: true },
    orderBy: { publishedAt: 'desc' }, // Generate newest first
    take: 10,
  });
  return posts.map((p) => ({ slug: p.slug }));
}
