import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { cms } from "@/lib/cms";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DynamicScene from "@/components/DynamicScene";
import { Pin } from "lucide-react";
import RecentViewTracker from "@/components/RecentViewTracker";

// TikTok doesn't have a native Lucide icon sometimes, but we can use a custom SVG or just use the Link icon or skip it.
// Wait, Lucide usually doesn't have TikTok or Pinterest. Let's check what icons are available or use standard SVGs.
// Since we want to use what's available without breaking, I'll provide inline SVGs or standard icons for social.
// Let me just import standard lucide icons first and then use SVGs.

function proxyUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `/api/media/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export async function generateMetadata({ params }) {
  const { slug } = await params;
  let mag = null;
  try {
    mag = await prisma.magazine.findFirst({
      where: { slug }
    });
  } catch (e) {
    console.error("Error fetching magazine for metadata:", e);
  }

  if (!mag) return { title: "Issue Not Found" };

  return {
    title: `${mag.title} | Digital Magazine`,
    description: mag.description || undefined,
    openGraph: mag.coverImage ? { images: [{ url: mag.coverImage }] } : undefined,
  };
}

export default async function MagazineIssuePage({ params }) {
  const { slug } = await params;
  let mag = null;
  try {
    mag = await prisma.magazine.findFirst({
      where: { slug }
    });
  } catch (e) {
    console.error("Error fetching magazine for page:", e);
  }

  if (!mag || mag.status !== 1) {
    notFound();
  }

  const latestMag = await prisma.magazine.findFirst({
    where: { status: 1 },
    orderBy: { date: "desc" },
  });

  const isFeatured = latestMag && latestMag.id === mag.id;

  const tagsList = mag.tags
    ? mag.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const displayDate = mag.date
    ? new Date(mag.date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    : "";

  return (
    <div className="min-h-screen bg-bg-light relative">
      <Header />
      <RecentViewTracker 
        item={{
          id: mag.id,
          title: mag.title,
          image: proxyUrl(mag.coverImage),
          type: "Publication",
          url: `/magazine/${mag.slug}`
        }}
      />

      <main className="pt-[140px] pb-20">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="breadcrumb flex items-center gap-2 text-[12px] text-muted font-semibold uppercase tracking-[1px] mb-8">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <span>•</span>
            <Link href="/publication" className="hover:text-accent transition-colors">
              Publications
            </Link>
            <span>•</span>
            <span className="text-secondary truncate">{mag.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: 3D Book Viewer / Fallback Image */}
            <div className="lg:col-span-5 flex flex-col items-center gap-6">
              <div className={`w-full max-w-[320px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-white/40 p-4 border border-white/60 relative ${!isFeatured ? 'flex items-center justify-center p-0' : ''}`}>
                {isFeatured ? (
                  <DynamicScene
                    frontUrl={mag.coverImage ? proxyUrl(mag.coverImage) : ""}
                    backUrl={mag.backImage || mag.coverImage ? proxyUrl(mag.backImage || mag.coverImage) : ""}
                    spineUrl={mag.spineImage || mag.coverImage ? proxyUrl(mag.spineImage || mag.coverImage) : ""}
                  />
                ) : (
                  <img
                    src={mag.coverImage ? proxyUrl(mag.coverImage) : "/images/mag_sleep.png"}
                    alt={mag.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                )}
              </div>

              {/* MagCloud/Link Purchase Buttons */}
              <div className="flex flex-col gap-3 w-full max-w-[320px]">
                {mag.magCloudLink && (
                  <a
                    href={mag.magCloudLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#d92128] hover:bg-[#b81b21] text-white text-sm md:text-base font-medium py-3.5 px-4 rounded-xl text-center tracking-wide shadow-md transition-all duration-300 block leading-snug no-underline uppercase"
                  >
                    Find Out More On
                    <span className="block font-bold mt-0.5">MagCloud</span>
                  </a>
                )}
                {(mag.link || !mag.magCloudLink) && (
                  <a
                    href={mag.link || "https://heyzine.com/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-primary hover:bg-accent text-white text-sm md:text-base font-medium py-4 px-4 rounded-xl text-center tracking-wide shadow-md transition-all duration-300 block no-underline uppercase"
                  >
                    Read Full Digital Issue
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Title and Descriptions */}
            <div className="lg:col-span-7 text-left">
              <span className="inline-block bg-accent/10 border border-accent/20 text-accent font-bold text-[10px] uppercase tracking-[1.5px] px-3.5 py-1.5 rounded-full mb-4">
                {mag.category || "Digital Journal"}
              </span>

              <h1 className="font-heading font-bold text-3xl md:text-4xl text-primary leading-[1.1] tracking-[-1.5px] mb-4">
                {mag.title}
              </h1>

              {displayDate && (
                <p className="text-sm font-semibold text-accent-green mb-4">
                  Released on {displayDate}
                </p>
              )}

              {/* Publisher Social Links */}
              {mag.publisherSocials && Object.values(mag.publisherSocials).some(link => link) && (
                <div className="flex items-center gap-3 mb-8">
                  {mag.publisherSocials.youtube && (
                    <a href={mag.publisherSocials.youtube} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#FF0000] transition-colors" title="YouTube">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </a>
                  )}
                  {mag.publisherSocials.instagram && (
                    <a href={mag.publisherSocials.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#E1306C] transition-colors" title="Instagram">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    </a>
                  )}
                  {mag.publisherSocials.facebook && (
                    <a href={mag.publisherSocials.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#1877F2] transition-colors" title="Facebook">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                  )}
                  {mag.publisherSocials.pinterest && (
                    <a href={mag.publisherSocials.pinterest} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#E60023] transition-colors" title="Pinterest">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.592 0 12.017 0z"/></svg>
                    </a>
                  )}
                  {mag.publisherSocials.linkedin && (
                    <a href={mag.publisherSocials.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0A66C2] transition-colors" title="LinkedIn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                  )}
                  {mag.publisherSocials.twitter && (
                    <a href={mag.publisherSocials.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#1DA1F2] transition-colors" title="Twitter">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                    </a>
                  )}
                </div>
              )}

              {/* Introduction */}
              {mag.introduction && (
                <div className="bg-white/40 p-6 md:p-8 rounded-3xl border border-white/60 mb-8">
                  <h3 className="font-heading font-semibold text-xl text-primary uppercase tracking-wider mb-3">
                    Dear Readers,
                  </h3>
                  <div 
                    className="font-serif text-base leading-relaxed text-slate-700 whitespace-pre-line prose"
                    dangerouslySetInnerHTML={{ __html: mag.introduction }}
                  />
                </div>
              )}

              {/* Description / Summary */}
              {mag.description && (
                <div className="prose prose-slate max-w-none text-slate-600 mb-8">
                  <h3 className="font-heading font-semibold text-xl text-primary tracking-[-0.5px] mb-3">
                    Issue Overview
                  </h3>
                  <div 
                    className="text-base leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: mag.description }}
                  />
                </div>
              )}

              {/* Tags */}
              {tagsList.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-200/60">
                  <span className="text-sm font-bold text-slate-800 mr-2">Featured Topics:</span>
                  {tagsList.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-sm bg-slate-100 text-slate-600 px-3.5 py-2 rounded-md font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
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
    const mags = await prisma.magazine.findMany({
      where: { status: 1 },
      select: { slug: true },
      orderBy: { date: 'desc' },
      take: 10,
    });
    return mags.map((m) => ({ slug: m.slug }));
  } catch (e) {
    console.error("Error generating static params for magazines:", e);
    return [];
  }
}
