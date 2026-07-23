'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdSlot from '@/components/AdSlot';
import Button from '@/components/Button';
import { Search, ChevronRight, HelpCircle } from 'lucide-react';

// Proxy external URLs through the Next.js server to avoid CORS / hostname issues
function proxyUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `/api/media/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function slugifyServiceTitle(title) {
  if (!title) return '';
  return title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export default function ServicesClient({ initialServices = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  // Map backend DB services directly
  const packagesList = initialServices.map((s) => ({
    id: s.id,
    slug: s.slug || slugifyServiceTitle(s.title) || s.id,
    title: s.title || '',
    dropdownVal: s.price ? `${s.title} (${s.price})` : s.title,
    description: s.description || '',
    includes: Array.isArray(s.includes) && s.includes.length > 0
      ? s.includes
      : Array.isArray(s.faqs) ? s.faqs.map(f => f.question || f.q || String(f)) : [],
    price: s.price || '',
    ctaButtonText: s.ctaButtonText || 'Know More',
    ctaButtonLink: s.ctaButtonLink || '',
    category: s.category || 'Service',
    badge: s.badge || null,
    img: (s.featuredImage?.secureUrl || s.featuredImage?.url) || '/images/mag_sleep.png',
    visible: s.visible !== false,
  })).filter(s => s.visible);

  const filteredServices = packagesList.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const faqs = [
    {
      q: 'How does the digital cover placement work?',
      a: 'Your portrait and brand story will be prominently featured on the digital cover issue of A Health Place, pinned at the top of our homepage for 30 days, and shared across our social channels.',
    },
    {
      q: 'What deliverables do I receive?',
      a: 'You receive high-resolution digital cover assets for your personal marketing, a digital copy of the magazine issue, a live permanent web URL, and a licensed "As Seen On A Health Place" badge for your website.',
    },
    {
      q: 'How fast is the editorial publishing turnaround?',
      a: 'Standard turnarounds range from immediate (for the next upcoming digital layout) up to 14 business days depending on content review and custom Q&A interview transcriptions.',
    },
    {
      q: 'Can I submit my own custom press release or draft?',
      a: 'Yes, our editorial team works with your provided drafts or conducts an exclusive interview to write and format a professional story tailored for our health-conscious audience.',
    },
  ];

  return (
    <div className="min-h-screen bg-bg-light flex flex-col justify-between">
      <Header />

      <main className="w-full flex-grow pt-[140px] pb-20">

        {/* Header Banner */}
        <section className="container mb-10">
          <div className="bg-[#f0f6f3]/60 border border-slate-200/40 rounded-[32px] p-8 md:p-12 relative overflow-hidden flex flex-col gap-6 md:flex-row md:items-center justify-between">
            <div className="max-w-[600px] relative z-10 flex flex-col gap-3">
              <span className="text-accent font-extrabold text-[11px] uppercase tracking-[2.5px] block">AHP MEDIA DIRECTORY</span>
              <h1 className="main-heading text-primary tracking-tight">
                Media & PR Partnership Packages
              </h1>
              <p className="description text-secondary">
                Unlock professional authority and reach our health-conscious audience. Explore our cover features, standalone articles, display ads, and custom partnerships.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:max-w-[320px] shrink-0 z-10">
              <input
                type="text"
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-5 py-3.5 bg-white border border-slate-200 rounded-full text-[13px] text-primary placeholder-slate-400 focus:outline-none focus:border-accent focus:shadow-[0_8px_24px_rgba(79,192,195,0.08)] transition-all duration-300 font-medium"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>

            <div className="absolute w-[200px] h-[200px] rounded-full bg-accent/10 blur-2xl top-[-50px] right-[-50px] pointer-events-none" />
          </div>
        </section>

        {/* Ad Space */}
        <section className="container mb-12">
          <AdSlot zone="services-top" />
        </section>

        {/* Services List Grid */}
        <section className="container mb-20">
          {filteredServices.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200/50 rounded-[32px] shadow-sm">
              <p className="text-slate-400 font-medium">No services found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => {
                const detailSlug = service.slug;
                return (
                  <div
                    key={service.id}
                    className="bg-white rounded-[24px] overflow-hidden flex flex-col justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(15,76,78,0.08)] group border border-slate-200/60 hover:border-[#0f4c4e]/30"
                  >
                    <div>
                      {/* Cover image & category */}
                      <Link href={`/services/${detailSlug}`} className="block relative w-full h-[180px] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={proxyUrl(service.img)}
                          alt={service.title}
                          className="object-cover transition-transform duration-500 group-hover:scale-105 w-full h-full"
                        />
                        <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[8.5px] font-bold uppercase tracking-[1px] bg-[#f0f6f3] text-[#0f4c4e]">
                          {service.category}
                        </span>

                        {/* Best Seller / Most Popular visual badge on the top right */}
                        {service.badge && (
                          <span className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-[1px] bg-accent text-primary shadow-sm animate-pulse">
                            {service.badge}
                          </span>
                        )}
                      </Link>

                      {/* Content block */}
                      <div className="p-6 flex flex-col gap-3">
                        <Link href={`/services/${detailSlug}`}>
                          <h3 className="card-title text-primary group-hover:text-accent transition-colors">
                            {service.title}
                          </h3>
                        </Link>
                        <p className="text-[12.5px] text-secondary leading-relaxed line-clamp-3">
                          {stripHtml(service.description)}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Pricing Row */}
                    <div className="px-6 pb-6 pt-2">
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="flex flex-col">
                          <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Package Price</span>
                          <span className="text-[14px] font-extrabold text-[#0f4c4e]">{service.price}</span>
                        </div>
                        <Link href={`/services/${detailSlug}`}>
                          <Button
                            variant="primary"
                            className="!bg-primary hover:!bg-accent hover:!text-white !text-xs !py-2.5 !px-5 inline-flex items-center gap-1 select-none shadow-sm"
                          >
                            Know More <ChevronRight size={12} />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* FAQs */}
        <section className="container">
          <div className="max-w-[800px] mx-auto bg-white border border-slate-200/60 rounded-[32px] p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-8 border-b border-slate-100 pb-4">
              <HelpCircle className="text-accent w-5.5 h-5.5" />
              <h2 className="section-heading text-primary tracking-tight">Partnership Questions & FAQs</h2>
            </div>

            <div className="flex flex-col gap-4">
              {faqs.map((faq, i) => {
                const isOpen = activeFaq === i;
                return (
                  <div key={i} className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between text-left py-2 font-bold text-sm md:text-base text-primary hover:text-accent transition-colors"
                    >
                      <span>{faq.q}</span>
                      <span className={`text-[18px] text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>+</span>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[200px] mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <p className="text-sm text-secondary bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">{faq.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
