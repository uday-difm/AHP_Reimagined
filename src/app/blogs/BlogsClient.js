'use client';

import { useState, useEffect } from 'react';
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

  // Sync category filter with search parameter
  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter) {
      setCategoryFilter(filter);
    } else {
      setCategoryFilter('All');
    }
  }, [searchParams]);

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

  const filteredArticles = displayArticles.filter(art => {
    const matchesFilter = categoryFilter === 'All' || art.category === categoryFilter;
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-bg-light relative">
      <CustomCursor />
      <ScrollReveal />
      <BackdropBlobs />
      <Header />

      {/* Hero Title Section */}
      <section className="bg-[#f0f6f3]/60 pt-[140px] pb-16 rounded-b-[40px] border-b border-slate-200/20 text-center relative overflow-hidden">
        <div className="container max-w-4xl">
          <span className="text-accent text-[11px] font-bold uppercase tracking-[2px] mb-3 block reveal-slide">WELLNESS LIBRARY</span>
          <h1 className="text-primary font-heading font-extrabold text-4xl md:text-5xl tracking-[-1.5px] leading-tight mb-4 reveal-slide">
            Explore Wellness Guides
          </h1>
          <p className="text-secondary text-[15px] max-w-xl mx-auto mb-8 reveal-slide">
            Read our medically vetted blogs and health guides created to keep you informed about physical and emotional wellness.
          </p>

          {/* Category Filter Box */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 bg-white/80 p-2 rounded-2xl shadow-sm border border-slate-200/50 max-w-3xl mx-auto reveal-scale">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryFilter(cat)}
                className={`px-5 py-3 rounded-xl font-bold text-[13px] transition-all cursor-pointer ${categoryFilter === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-secondary hover:bg-slate-100 hover:text-primary'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Main View */}
      <main className="container py-16 max-w-6xl min-h-[500px]">
        <div className="space-y-10 reveal-fade">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <h2 className="text-primary font-heading font-bold text-xl tracking-[-0.5px]">
              {categoryFilter === 'All' ? 'All Blogs' : categoryFilter}
            </h2>

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
          {filteredArticles.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200/50 rounded-3xl">
              <p className="text-slate-400 font-medium">No blogs found matching this selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((art) => {
                const slug = art.slug || art.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                return (
                  <Link
                    key={art.id}
                    href={`/blogs/${slug}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200 transition-all duration-300 hover:shadow-lg hover:border-accent/30 flex flex-col h-full no-underline"
                  >
                    <div className="relative w-full h-[200px] overflow-hidden">
                      <Image
                        src={art.img}
                        alt={art.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-4 left-4 bg-[#e8f4ff] text-[#1fb9fb] px-3 py-1.5 rounded-full text-[9.5px] font-bold uppercase tracking-[0.5px]">
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
        </div>
      </main>

      <Footer className="pt-0 pb-20" />
    </div>
  );
}
