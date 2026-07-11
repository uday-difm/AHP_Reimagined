'use client';

import { useState, useEffect, Fragment } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import ScrollReveal from '@/components/ScrollReveal';
import BackdropBlobs from '@/components/BackdropBlobs';
import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  ChevronRight
} from 'lucide-react';

const mockArticles = [
  {
    id: 'mock-1',
    category: 'Holistic Ayurveda',
    title: 'Ayurvedic Secrets for Better Digestion (Demo Data)',
    desc: 'Discover ancient dietary guidelines for optimizing digestive health and maintaining balance.',
    img: '/images/ayurveda.png',
    slug: 'ayurvedic-secrets-for-better-digestion',
  },
  {
    id: 'mock-2',
    category: 'Physical Health',
    title: 'How Inactivity Impacts Physical Health (Demo Data)',
    desc: 'Research linking modern sedentary lifestyles to cardiovascular risks and joint stiffness.',
    img: '/images/physical_health.png',
    slug: 'how-inactivity-impacts-physical-health',
  },
  {
    id: 'mock-3',
    category: 'Mental Health',
    title: 'Exercise for Better Mental Health (Demo Data)',
    desc: 'Science-backed evidence showing how regular movement rewires the brain for resilience.',
    img: '/images/hero_exercise.png',
    slug: 'exercise-for-better-mental-health',
  },
  {
    id: 'mock-4',
    category: 'Holistic Ayurveda',
    title: 'Breathwork vs. Meditation for Anxiety (Demo Data)',
    desc: 'Find out which mindfulness practices work best for quieting your specific anxiety loops.',
    img: '/images/holistic.png',
    slug: 'breathwork-vs-meditation-for-anxiety',
  },
  {
    id: 'mock-5',
    category: 'Insurance Mappings',
    title: 'Holistic Nutrition (Demo Data)',
    desc: 'A comprehensive guide on gut health, natural digestion, and diet optimization.',
    img: '/images/mag_nutrition.png',
    slug: 'holistic-nutrition',
  },
  {
    id: 'mock-6',
    category: 'Physical Health',
    title: 'The Sleep Revolution (Demo Data)',
    desc: 'How aligning with your circadian rhythm improves physical recovery and endocrine balance.',
    img: '/images/mag_sleep.png',
    slug: 'the-sleep-revolution',
  }
];

export default function BlogsClient({ initialCategories = [], initialPosts = [] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Sync category filter with search parameter
  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter) {
      setCategoryFilter(filter);
    } else {
      setCategoryFilter('All');
    }
  }, [searchParams]);

  // Reset pagination to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, searchQuery]);

  // Derive categories list from DB or fall back to standard defaults
  const defaultCategories = ['Physical Health', 'Mental Health', 'Holistic Ayurveda', 'Insurance Mappings'];
  const categoriesList = initialCategories.length > 0
    ? ['All', ...initialCategories.map(c => c.name)]
    : ['All', ...defaultCategories];

  // Derive articles list from DB or fall back to demo articles
  const displayArticles = initialPosts.length > 0
    ? initialPosts.map(p => ({
      id: p.id,
      category: p.categories?.[0]?.name || 'General',
      title: p.title,
      desc: p.excerpt || 'Read our medically vetted guide.',
      img: p.featuredImage?.url || '/images/holistic.png',
      slug: p.slug
    }))
    : mockArticles;

  const handleCategoryFilter = (cat) => {
    setCategoryFilter(cat);
    const params = new URLSearchParams(searchParams);
    if (cat === 'All') {
      params.delete('filter');
    } else {
      params.set('filter', cat);
    }
    router.push(`/blogs?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const section = document.getElementById('blogs-main');
    if (section) {
      const yOffset = -120; // Offset to account for the fixed header + marquee height
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const filteredArticles = displayArticles.filter(art => {
    const matchesFilter = categoryFilter === 'All' || art.category === categoryFilter;
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Inject advertisement card into the display sequence at the 3rd position (index 2)
  const finalArticlesList = [];
  filteredArticles.forEach((art, index) => {
    if (index === 2 && categoryFilter === 'All') {
      finalArticlesList.push({ id: 'ad-card-slot', isAd: true });
    }
    finalArticlesList.push(art);
  });

  // If list is small and has no ad card yet, append to ensure it shows
  if (filteredArticles.length < 3 && categoryFilter === 'All' && !finalArticlesList.some(a => a.isAd)) {
    finalArticlesList.push({ id: 'ad-card-slot', isAd: true });
  }

  const itemsPerPage = 6;
  const totalPages = Math.ceil(finalArticlesList.length / itemsPerPage);
  const displayedArticles = finalArticlesList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-bg-light relative">
      <CustomCursor />
      <ScrollReveal />
      <BackdropBlobs />
      <Header />

      {/* Hero Title Section */}
      <section className="bg-[#f0f6f3]/60 pt-[140px] pb-8 rounded-b-[40px] border-b border-slate-200/20 text-center relative overflow-hidden">
        <div className="container">
          <span className="text-accent text-[11px] font-bold uppercase tracking-[2px] mb-3 block reveal-slide">WELLNESS LIBRARY</span>
          <h1 className="text-primary font-heading font-extrabold text-4xl md:text-5xl tracking-[-1.5px] leading-tight mb-4 reveal-slide">
            Explore Wellness Guides
          </h1>
          <p className="text-secondary text-[15px] max-w-xl mx-auto mb-8 reveal-slide">
            Read our medically vetted blogs and health guides created to keep you informed about physical and emotional wellness.
          </p>

          {/* Category Filter Box with Dropdown & "All" button */}
          <div className="flex flex-wrap items-center justify-center gap-3 bg-white/80 p-2.5 rounded-2xl shadow-sm border border-slate-200/50 max-w-2xl mx-auto reveal-scale">
            {/* Primary Buttons */}
            {['All', 'Physical Health', 'Mental Health'].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryFilter(cat)}
                className={`px-5 py-3.5 rounded-xl font-bold text-[13px] transition-all cursor-pointer whitespace-nowrap ${categoryFilter === cat
                  ? 'bg-[#0f7c85] text-white shadow-sm font-extrabold'
                  : 'bg-white text-secondary hover:bg-slate-100 border border-slate-200/60'
                  }`}
              >
                {cat}
              </button>
            ))}

            {/* Overflow Dropdown */}
            <div className="relative">
              <select
                value={!['All', 'Physical Health', 'Mental Health'].includes(categoryFilter) ? categoryFilter : ''}
                onChange={(e) => {
                  const selectedVal = e.target.value;
                  if (selectedVal) {
                    handleCategoryFilter(selectedVal);
                  }
                }}
                className={`appearance-none bg-white text-secondary font-bold text-[13px] px-5 py-3.5 pr-10 rounded-xl border focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer shadow-sm hover:bg-slate-100/50 transition-all ${!['All', 'Physical Health', 'Mental Health'].includes(categoryFilter)
                  ? 'border-[#0f7c85] bg-[#0f7c85]/5 text-[#0f7c85] font-extrabold'
                  : 'border-slate-200/60'
                  }`}
              >
                <option value="">More...</option>
                {categoriesList
                  .filter((cat) => !['All', 'Physical Health', 'Mental Health'].includes(cat))
                  .map((cat) => (
                    <option key={cat} value={cat} className="text-secondary bg-white">
                      {cat}
                    </option>
                  ))}
              </select>
              <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${!['All', 'Physical Health', 'Mental Health'].includes(categoryFilter) ? 'text-[#0f7c85]' : 'text-slate-400'
                }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Main View */}
      <main id="blogs-main" className="container py-5 min-h-[500px]">
        <div className="space-y-10 reveal-fade">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div className="flex flex-col gap-1 text-center md:text-left">
              <h2 className="text-primary font-heading font-extrabold text-2xl tracking-[-0.5px]">
                {categoryFilter === 'All' ? 'Most Recent Blogs' : categoryFilter}
              </h2>
              {categoryFilter === 'All' && (
                <p className="text-secondary font-bold text-[13.5px]">
                  Uncover the most popular reads across various life categories
                </p>
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              />
            </div>
          </div>
          {/* Grid of Articles */}
          {displayedArticles.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200/50 rounded-3xl w-full">
              <p className="text-slate-400 font-medium">No blogs found matching this selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedArticles.map((art) => {
                if (art.isAd) {
                  return (
                    <div key="ad-card-slot" className="bg-gradient-to-br from-[#f0f9fa] via-[#f7fdfd] to-[#eef9fa] rounded-[24px] p-8 border border-[#0f7c85]/20 flex flex-col justify-between text-center min-h-[380px] shadow-sm hover:shadow-md transition-all duration-300 group hover:border-[#0f7c85]/40">
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-[#0f7c85]/10 rounded-full flex items-center justify-center mb-6 shadow-sm">
                          <svg className="w-6 h-6 text-[#0f7c85]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                          </svg>
                        </div>
                        <h3 className="font-heading font-extrabold text-xl text-primary mb-3">
                          Advertise With Us
                        </h3>
                        <p className="text-secondary font-medium text-[13.5px] leading-relaxed max-w-xs mb-6">
                          Showcase your brand to our engaged audience of nature enthusiasts and environmental advocates
                        </p>
                      </div>
                      <Link
                        href="/info?tab=contact"
                        className="w-max mx-auto bg-[#0f7c85] hover:bg-[#0c646b] text-white font-extrabold text-[12px] py-3.5 px-8 rounded-full transition-all duration-300 no-underline shadow-sm hover:shadow-[0_6px_20px_rgba(15,124,133,0.3)] hover:-translate-y-0.5 transform inline-flex items-center gap-1.5"
                      >
                        Get Started →
                      </Link>
                    </div>
                  );
                }

                const slug = art.slug || art.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                return (
                  <Link
                    key={art.id}
                    href={`/blogs/${slug}`}
                    className="group bg-white rounded-[24px] overflow-hidden border border-slate-200 transition-all duration-300 hover:shadow-lg hover:border-[#0f7c85]/30 flex flex-col h-full no-underline"
                  >
                    <div className="relative w-full h-[200px] overflow-hidden">
                      <Image
                        src={art.img}
                        alt={art.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-4 left-4 bg-[#e8f4ff] text-[#0f7c85] px-3 py-1.5 rounded-full text-[9.5px] font-bold uppercase tracking-[0.5px]">
                        {art.category}
                      </span>
                    </div>
                    <div className="p-6 flex flex-col gap-2 flex-grow">
                      <h3 className="font-heading font-bold text-base text-primary leading-snug group-hover:text-accent transition-colors">
                        {art.title}
                      </h3>
                      <p className="text-[12.5px] text-secondary leading-relaxed">
                        {art.desc}
                      </p>
                      <span className="text-[11px] font-bold text-accent mt-auto inline-flex items-center gap-1">
                        Read Guide <ChevronRight size={12} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 reveal-slide">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 text-primary transition-all duration-300 font-bold text-sm cursor-pointer select-none
                  ${currentPage === 1
                    ? 'opacity-40 cursor-not-allowed border-slate-100 text-slate-400'
                    : 'hover:border-accent hover:bg-accent/5 hover:text-accent active:scale-95'}`}
                aria-label="Previous Page"
              >
                ←
              </button>

              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border font-bold text-sm transition-all duration-300 cursor-pointer select-none
                      ${currentPage === pageNum
                        ? 'bg-primary text-white border-primary shadow-md hover:bg-primary/95'
                        : 'border-slate-200 text-primary hover:border-accent hover:bg-accent/5 hover:text-accent active:scale-95'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 text-primary transition-all duration-300 font-bold text-sm cursor-pointer select-none
                  ${currentPage === totalPages
                    ? 'opacity-40 cursor-not-allowed border-slate-100 text-slate-400'
                    : 'hover:border-accent hover:bg-accent/5 hover:text-accent active:scale-95'}`}
                aria-label="Next Page"
              >
                →
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Lower Page Banner — Advertise With Us */}
      <section className="bg-white py-16 border-t border-slate-200/50">
        <div className="container mx-auto px-4 reveal-slide">
          <div className="bg-gradient-to-br from-[#0f7c85]/5 via-white to-[#0f7c85]/10 rounded-[32px] p-8 md:p-12 border border-[#0f7c85]/10 shadow-[0_10px_30px_rgba(0,0,0,0.01)] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <span className="inline-block bg-[#0f7c85]/10 text-[#0f7c85] font-extrabold text-[10px] uppercase tracking-[2px] px-3.5 py-1.5 rounded-full mb-3">
                PARTNERSHIPS
              </span>
              <h2 className="text-primary font-heading font-extrabold text-2xl md:text-3xl tracking-[-0.5px] mb-3">
                Advertise With Us
              </h2>
              <p className="text-secondary text-[14px] leading-relaxed max-w-lg">
                Promote your brand to our health-conscious audience of wellness readers. Custom editorial integration, newsletter sponsorships, and media kits available.
              </p>
            </div>
            <Link
              href="/info?tab=contact"
              className="bg-[#0f7c85] hover:bg-[#0c646b] text-white font-extrabold text-xs py-3.5 px-8 rounded-full transition-all duration-300 no-underline shadow-md hover:shadow-[0_8px_24px_rgba(15,124,133,0.3)] hover:-translate-y-0.5 transform whitespace-nowrap"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer className="pt-0 pb-20" />
    </div>
  );
}
