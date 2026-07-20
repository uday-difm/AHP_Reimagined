import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { cms } from "@/lib/cms";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DynamicScene from "@/components/DynamicScene";

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
                    className="w-full bg-[#d92128] hover:bg-[#b81b21] text-white text-[11px] font-bold py-3.5 px-4 rounded-xl text-center tracking-wide shadow-md transition-all duration-300 block leading-snug no-underline uppercase"
                  >
                    Find Out More On
                    <span className="block text-[14px] font-extrabold mt-0.5">MagCloud</span>
                  </a>
                )}
                {(mag.link || !mag.magCloudLink) && (
                  <a
                    href={mag.link || "https://heyzine.com/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-primary hover:bg-accent text-white text-xs font-bold py-4 px-4 rounded-xl text-center tracking-wide shadow-md transition-all duration-300 block no-underline uppercase"
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

              <h1 className="font-heading font-extrabold text-[36px] md:text-[50px] text-primary leading-[1.1] tracking-[-1.5px] mb-4">
                {mag.title}
              </h1>

              {displayDate && (
                <p className="text-sm font-semibold text-accent-green mb-8">
                  Released on {displayDate}
                </p>
              )}

              {/* Introduction */}
              {mag.introduction && (
                <div className="bg-white/40 p-6 md:p-8 rounded-3xl border border-white/60 mb-8">
                  <h3 className="font-heading font-bold text-primary text-[15px] uppercase tracking-wider mb-3">
                    Dear Readers,
                  </h3>
                  <div 
                    className="font-serif text-[15px] md:text-[16px] leading-[1.8] text-slate-700 whitespace-pre-line prose"
                    dangerouslySetInnerHTML={{ __html: mag.introduction }}
                  />
                </div>
              )}

              {/* Description / Summary */}
              {mag.description && (
                <div className="prose prose-slate max-w-none text-slate-600 mb-8">
                  <h3 className="font-heading font-extrabold text-[20px] text-primary tracking-[-0.5px] mb-3">
                    Issue Overview
                  </h3>
                  <div 
                    className="text-[15px] leading-relaxed prose prose-sm max-w-none"
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
                      className="text-xs bg-slate-100 text-slate-600 px-3.5 py-2 rounded-md font-medium"
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
