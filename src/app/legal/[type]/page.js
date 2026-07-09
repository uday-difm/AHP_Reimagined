import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import ScrollReveal from '@/components/ScrollReveal';
import BackdropBlobs from '@/components/BackdropBlobs';
import { FileText, ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

const URL_TYPE_MAPPING = {
  'privacy': 'privacy',
  'privacy-policy': 'privacy',
  'terms': 'terms',
  'terms-of-service': 'terms',
  'terms-of-use': 'terms',
  'cookies': 'cookies',
  'cookie-policy': 'cookies',
  'disclaimer': 'disclaimer',
  'refund': 'refund',
  'refund-policy': 'refund'
};

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { type } = resolvedParams;
  const cleanType = URL_TYPE_MAPPING[type] || type;
  const siteId = process.env.NEXT_PUBLIC_SITE_ID || 'infinium';

  try {
    const page = await prisma.legalPage.findFirst({
      where: {
        siteId,
        type: cleanType,
        deletedAt: null
      },
      select: {
        title: true,
        type: true
      }
    });

    if (!page) {
      return {
        title: 'Legal Policy | A Health Place',
      };
    }

    return {
      title: `${page.title} | A Health Place`,
      description: `Read the official ${page.title} of A Health Place website.`,
    };
  } catch (err) {
    return {
      title: 'Legal Policy | A Health Place',
    };
  }
}

export default async function LegalPage({ params }) {
  const resolvedParams = await params;
  const { type } = resolvedParams;
  const cleanType = URL_TYPE_MAPPING[type] || type;
  const siteId = process.env.NEXT_PUBLIC_SITE_ID || 'infinium';

  // 1. Fetch current legal page
  const page = await prisma.legalPage.findFirst({
    where: {
      siteId,
      type: cleanType,
      deletedAt: null
    }
  });

  if (!page) {
    notFound();
  }

  // 2. Fetch all other active published legal pages for sidebar navigation
  const legalPages = await prisma.legalPage.findMany({
    where: {
      siteId,
      published: true,
      deletedAt: null
    },
    select: {
      id: true,
      type: true,
      title: true
    },
    orderBy: {
      type: 'asc'
    }
  });

  // Get slug representation for links
  const getSlugByType = (docType) => {
    if (docType === 'privacy') return 'privacy-policy';
    if (docType === 'terms') return 'terms-of-use';
    if (docType === 'cookies') return 'cookie-policy';
    if (docType === 'refund') return 'refund-policy';
    return docType;
  };

  return (
    <div className="min-h-screen bg-bg-light relative flex flex-col justify-between">
      {/* Global Animation Utilities */}
      <CustomCursor />
      <ScrollReveal />
      <BackdropBlobs />

      {/* Persistent Navigation */}
      <Header />

      <main className="pt-[140px] pb-24 grow">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <div className="breadcrumb flex items-center gap-2 text-[12px] text-muted font-semibold uppercase tracking-[1px] mb-8">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <span>•</span>
            <Link href="/info" className="hover:text-accent transition-colors">Information Hub</Link>
            <span>•</span>
            <span className="text-secondary">{page.title}</span>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-10">
            {/* Sidebar Navigation */}
            <aside className="flex flex-row md:flex-col gap-2.5 overflow-x-auto md:overflow-visible pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-slate-200/60 pr-0 md:pr-6 shrink-0 h-fit md:sticky md:top-[120px]">
              {legalPages.map((lp) => {
                const lpSlug = getSlugByType(lp.type);
                const isActive = cleanType === lp.type;

                return (
                  <Link
                    key={lp.id}
                    href={`/legal/${lpSlug}`}
                    className={`flex items-center gap-2.5 px-4.5 py-3.5 rounded-xl text-left font-bold text-[12.5px] transition-all whitespace-nowrap md:w-full ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-secondary hover:bg-slate-100 bg-white/40 border border-slate-100'
                    }`}
                  >
                    <FileText size={15} />
                    {lp.title}
                  </Link>
                );
              })}
            </aside>

            {/* Document Main Content */}
            <article className="bg-white border border-slate-200/60 rounded-3xl p-8 md:p-12 shadow-sm leading-relaxed text-secondary text-[14px] md:text-[15px] space-y-6">
              <div>
                <h1 className="font-heading font-extrabold text-[32px] md:text-[44px] text-primary leading-tight tracking-[-1px] mb-3">
                  {page.title}
                </h1>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  Last Updated: {page.lastUpdated ? new Date(page.lastUpdated).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : new Date(page.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-6">
                {page.content ? (
                  <div 
                    className="prose prose-slate max-w-none 
                      prose-headings:font-heading prose-headings:font-extrabold prose-headings:text-primary 
                      prose-h2:text-[20px] prose-h2:md:text-[24px] prose-h2:mt-8 prose-h2:mb-3 
                      prose-h3:text-[16px] prose-h3:md:text-[18px] prose-h3:mt-6 prose-h3:mb-2
                      prose-p:leading-relaxed prose-p:mb-5 prose-strong:text-primary
                      prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4 prose-ul:space-y-1.5
                      prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4 prose-ol:space-y-1.5"
                    dangerouslySetInnerHTML={{ __html: page.content }} 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <ShieldAlert size={48} className="mb-4 text-accent/50" />
                    <p>No content has been added to this policy yet.</p>
                  </div>
                )}
              </div>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
