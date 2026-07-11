'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, X } from 'lucide-react';

const STATIC_ARTICLES = [
  {
    slug: 'ayurvedic-secrets-for-better-digestion',
    category: 'Ayurveda',
    title: 'Ayurvedic Secrets for Better Digestion',
    desc: 'Discover ancient dietary guidelines for optimizing digestive health and maintaining balance.',
    img: '/images/ayurveda.png',
  },
  {
    slug: 'how-ai-is-changing-healthcare',
    category: 'Modern Health',
    title: 'How AI is Changing Healthcare',
    desc: 'Explore how artificial intelligence is streamlining diagnostics, surgery, and patient care.',
    img: '/images/disease.png',
  },
  {
    slug: 'breathwork-vs-meditation-for-anxiety',
    category: 'Holistic',
    title: 'Breathwork vs. Meditation for Anxiety',
    desc: 'Find out which mindfulness practices work best for quieting your specific anxiety loops.',
    img: '/images/holistic.png',
  },
  {
    slug: 'exercise-for-better-mental-health',
    category: 'Mental Health',
    title: 'Exercise for Better Mental Health',
    desc: 'Science-backed evidence showing how regular movement rewires the brain for resilience.',
    img: '/images/hero_exercise.png',
  },
  {
    slug: 'how-inactivity-impacts-physical-health',
    category: 'Physical Health',
    title: 'How Inactivity Impacts Physical Health',
    desc: 'Research linking modern sedentary lifestyles to cardiovascular risks and joint stiffness.',
    img: '/images/physical_health.png',
  },
  {
    slug: 'when-is-the-right-time-for-hospice-care',
    category: 'Hospice Care',
    title: 'When Is the Right Time for Hospice Care?',
    desc: 'Compassionate guidelines on when to seek specialized, medical-supported end-of-life care.',
    img: '/images/hero_hospice.png',
  }
];

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [dbResults, setDbResults] = useState([]);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus after animation has started
      const timer = setTimeout(() => {
        inputRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Body and HTML scroll locking when search is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('hb-no-scroll');
      document.documentElement.classList.add('hb-no-scroll');
    } else {
      document.body.classList.remove('hb-no-scroll');
      document.documentElement.classList.remove('hb-no-scroll');
    }
    return () => {
      document.body.classList.remove('hb-no-scroll');
      document.documentElement.classList.remove('hb-no-scroll');
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real-time search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setDbResults([]);
      return;
    }

    const cleanQuery = query.toLowerCase().trim();

    // 1. Search Static Guides
    const localFiltered = STATIC_ARTICLES.filter(
      (art) =>
        art.title.toLowerCase().includes(cleanQuery) ||
        art.desc.toLowerCase().includes(cleanQuery) ||
        art.category.toLowerCase().includes(cleanQuery)
    );
    setResults(localFiltered);

    // 2. Fetch Database Articles (Debounced)
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/posts?search=${encodeURIComponent(cleanQuery)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data?.posts)) {
            const mapped = json.data.posts.map((post) => ({
              slug: post.slug,
              title: post.title,
              desc: post.excerpt || '',
              category: post.categories?.[0]?.name || 'Article',
              img: post.featuredImage?.url || '/images/Logo-web.png',
              isDb: true
            }));
            setDbResults(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to search database posts:', err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Combined Results
  const allResults = [
    ...results,
    ...dbResults.filter(
      (dbArt) => !results.some((localArt) => localArt.slug === dbArt.slug)
    )
  ];

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-12 h-12 rounded-full flex justify-center items-center cursor-pointer transition-all duration-300 border bg-white/90 border-[var(--color-border)]/80 text-primary hover:scale-105 hover:border-accent hover:shadow-[0_6px_24px_rgba(31,185,251,0.12)] mr-2"
        aria-label="Open Search"
      >
        <SearchIcon className="w-5 h-5" />
      </button>

      {/* Glassmorphic Search Overlay Modal */}
      <div
        className={`fixed inset-0 w-full h-screen bg-white/85 backdrop-blur-2xl z-[99999] flex flex-col justify-start items-center p-6 md:p-16 transition-all duration-500 ${isOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
          }`}
      >
        <div className={`w-full max-w-[800px] flex flex-col items-center flex-1 transition-transform duration-700 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
          {/* Top Row: Close button */}
          <div className="w-full flex justify-end mb-6">
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 bg-white/80 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            >
              <X className="w-5 h-5 text-secondary" />
            </button>
          </div>

          {/* Search Bar Container */}
          <div className="w-full relative mb-12">
            <div className="relative flex items-center border border-slate-200/80 rounded-2xl bg-white shadow-md px-5 py-4 focus-within:border-accent/40 focus-within:shadow-[0_8px_30px_rgba(31,185,251,0.06)] transition-all duration-300">
              <SearchIcon className="w-6 h-6 text-slate-400 mr-4" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles, guides, topics..."
                className="w-full text-lg md:text-xl font-medium placeholder-slate-400 bg-transparent border-none outline-none text-primary"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-slate-400 hover:text-slate-600 font-medium text-xs px-2 py-1 bg-slate-100 rounded"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Results Area */}
          <div className="w-full flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {query.trim() === '' ? (
              <div className="text-center text-secondary py-12">
                <span className="text-[11px] font-bold tracking-[2px] text-accent uppercase block mb-2">Guides Database</span>
                <p className="text-sm font-medium text-slate-400">Type to explore expert-backed medical guides.</p>
              </div>
            ) : allResults.length > 0 ? (
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Found {allResults.length} matching guides
                </span>

                {allResults.map((art) => (
                  <Link
                    key={art.slug}
                    href={`/blogs/${art.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.01)] hover:border-accent/25 hover:shadow-[0_8px_24px_rgba(31,185,251,0.04)] hover:-translate-y-[2px] transition-all duration-300 no-underline group"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                      <img
                        src={art.img}
                        alt={art.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold text-accent uppercase tracking-wider block mb-1">
                        {art.category}
                      </span>
                      <h4 className="font-heading font-bold text-[15px] text-primary truncate group-hover:text-accent transition-colors leading-snug">
                        {art.title}
                      </h4>
                      <p className="text-xs text-secondary truncate mt-0.5">
                        {art.desc}
                      </p>
                    </div>
                    <span className="text-slate-300 group-hover:text-accent font-bold text-sm ml-2 transition-colors">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-secondary py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <p className="text-sm font-semibold">No results match your search term.</p>
                <button
                  onClick={() => setQuery('')}
                  className="mt-3 text-xs font-bold text-accent hover:underline uppercase tracking-wider"
                >
                  Clear search query
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
