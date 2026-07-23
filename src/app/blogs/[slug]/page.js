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
import RecentViewTracker from '@/components/RecentViewTracker';
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
      {post.jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(post.jsonLd) }}
        />
      )}
      <Header />
      <RecentViewTracker 
        item={{
          id: post.id,
          title: post.title,
          image: featuredImgUrl,
          type: "Article",
          url: `/blogs/${post.slug}`
        }}
      />

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
            <span className="inline-block bg-accent/10 border border-accent/20 text-accent font-bold text-sm uppercase tracking-[1.5px] px-3.5 py-1.5 rounded-full mb-4">
              {categoryName}
            </span>
            <h1 className="main-heading text-primary mb-6">
              {post.title}
            </h1>

            {/* Byline */}
            <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center gap-3 md:gap-6 border-y border-slate-200/60 py-4 text-sm text-secondary">
              <div className="flex items-center flex-wrap gap-3">
                <span className="text-muted font-medium">Written by</span> <span className="font-bold text-primary">{authorName}</span>
                {post.publisherSocials && (
                  <div className="flex items-center gap-2 ml-2">
                    {post.publisherSocials.youtube && (
                      <a href={post.publisherSocials.youtube} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#FF0000] transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      </a>
                    )}
                    {post.publisherSocials.instagram && (
                      <a href={post.publisherSocials.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#E1306C] transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                      </a>
                    )}
                    {post.publisherSocials.facebook && (
                      <a href={post.publisherSocials.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#1877F2] transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </a>
                    )}
                    {post.publisherSocials.pinterest && (
                      <a href={post.publisherSocials.pinterest} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#E60023] transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.625 0 12.017 0z"/></svg>
                      </a>
                    )}
                    {post.publisherSocials.linkedin && (
                      <a href={post.publisherSocials.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0A66C2] transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      </a>
                    )}
                    {post.publisherSocials.twitter && (
                      <a href={post.publisherSocials.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#1DA1F2] transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                      </a>
                    )}
                  </div>
                )}
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
              className="object-cover"
              sizes="100vw"
            />
          </div>

          <AdSlot zone="article-body-top" />

          {/* Article Body */}
          <article className="article-body-content mx-auto">
            {/* Intro */}
            {post.excerpt && (
              <p className="text-lg leading-relaxed text-primary mb-10 border-l-3 border-accent pl-5">
                {post.excerpt}
              </p>
            )}

            <AdSlot zone="article-body-inline" layout="float" />

            {/* Main Content */}
            <div
              className="prose prose-slate max-w-none text-base leading-8 text-secondary space-y-4"
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
                    className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-md transition duration-200 no-underline"
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
                <h3 className="section-heading text-primary">Related Reads</h3>
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
                    <h4 className="card-title text-primary group-hover:text-accent transition-colors line-clamp-2">
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
  try {
    const siteId = process.env.NEXT_PUBLIC_SITE_ID || process.env.SITE_ID || "infinium";
    const posts = await prisma.post.findMany({
      where: { siteId, status: "PUBLISHED", deletedAt: null },
      select: { slug: true },
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });
    return posts.map((p) => ({ slug: p.slug }));
  } catch (e) {
    console.warn("[generateStaticParams] Could not fetch blog slugs during static build, rendering dynamically:", e.message);
    return [];
  }
}
