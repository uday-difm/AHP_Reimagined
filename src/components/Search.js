'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import sanitizeHtml from 'isomorphic-dompurify';

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filters
  const [activeType, setActiveType] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [facets, setFacets] = useState({ types: [], categories: [] });

  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
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
    const cleanQuery = query.toLowerCase().trim();
    if (cleanQuery.length < 2) {
      setResults([]);
      setFacets({ types: [], categories: [] });
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const delayDebounce = setTimeout(async () => {
      try {
        const searchParams = new URLSearchParams({
          q: cleanQuery,
          perPage: 30
        });
        if (activeType) searchParams.set('type', activeType);
        if (activeCategory) searchParams.set('category', activeCategory);

        const res = await fetch(`/api/search?${searchParams.toString()}`, {
          signal: abortControllerRef.current.signal
        });
        
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data?.hits)) {
            setResults(json.data.hits);
            setFacets(json.data.facets || { types: [], categories: [] });
          } else {
            setError(json.error || 'Failed to parse search results');
          }
        } else {
          setError('Failed to fetch search results');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to search:', err);
          setError('An error occurred while searching');
        }
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [query, activeType, activeCategory]);

  const LABELS = {
    post: "Blog",
    page: "Page",
    recipe: "Recipe",
    service: "Service",
    magazine: "Magazine",
    quiz: "Quiz",
  };

  const getLabel = (type) => LABELS[type] || type;

  const renderHighlighted = (htmlString) => {
    if (!htmlString) return null;
    const cleanHTML = sanitizeHtml.sanitize(htmlString, { ALLOWED_TAGS: ['mark'] });
    return <span dangerouslySetInnerHTML={{ __html: cleanHTML }} />;
  };

  return (
    <>
      {/* Search Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center sm:justify-start gap-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-slate-500 px-0 sm:px-4 py-2 sm:py-2.5 rounded-full transition-colors w-10 h-10 sm:h-auto sm:w-[200px] md:w-[220px] xl:w-[260px] border border-transparent hover:border-[#E6EEF0] group mr-0 sm:mr-2 shrink-0"
        aria-label="Open Search"
      >
        <span className="hidden sm:block flex-1 text-left text-[12px] md:text-[13px] font-medium text-slate-400 group-hover:text-slate-500 transition-colors truncate">
          Search...
        </span>
        <SearchIcon className="w-4 h-4 sm:w-4 sm:h-4 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
      </button>

      {/* Glassmorphic Search Overlay Modal */}
      <div
        className={`fixed inset-0 w-full h-screen bg-white/85 backdrop-blur-2xl z-[99999] flex flex-col justify-start items-center p-6 md:p-16 transition-all duration-500 ${isOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
          }`}
      >
        <div className={`w-full max-w-[800px] flex flex-col items-stretch flex-1 min-h-0 transition-transform duration-700 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
          {/* Top Row: Close button */}
          <div className="w-full flex justify-end mb-2">
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 bg-white/80 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            >
              <X className="w-5 h-5 text-secondary" />
            </button>
          </div>

          {/* Modal Title/Subtitle */}
          <div className="text-center text-secondary mb-8 flex flex-col items-center">
            <span className="text-xs font-bold tracking-[2px] text-accent uppercase block mb-2">Global Search</span>
            <p className="text-sm font-medium text-slate-400">Type to explore content across the platform.</p>
          </div>

          {/* Search Bar Container */}
          <div className="w-full relative mb-4">
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
              {isLoading && (
                <Loader2 className="w-5 h-5 animate-spin text-accent mr-2" />
              )}
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setActiveType('');
                    setActiveCategory('');
                  }}
                  className="text-slate-400 hover:text-slate-600 font-medium text-xs px-2 py-1 bg-slate-100 rounded"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          {facets.types?.length > 0 && query.length >= 2 && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
              <button
                onClick={() => setActiveType('')}
                className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${!activeType ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                All
              </button>
              {facets.types.map((facet) => (
                <button
                  key={facet.value}
                  onClick={() => setActiveType(facet.value === activeType ? '' : facet.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${activeType === facet.value ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {getLabel(facet.value)} ({facet.count})
                </button>
              ))}
            </div>
          )}

          {/* Results Area */}
          <div className="w-full flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar pb-10">
            {error && (
              <div className="text-center text-red-500 py-4 bg-red-50 rounded-lg text-sm">
                {error}
                <br />
                <button onClick={() => setQuery(query)} className="mt-2 text-xs font-bold underline">Retry</button>
              </div>
            )}
            
            {query.trim().length < 2 ? (
              <div className="flex flex-col items-center mt-4">
                <div className="w-full max-w-lg flex flex-col items-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 block">Trending Searches</span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Ayurveda', 'Mental Health', 'Nutrition', 'Fitness', 'Sleep'].map(keyword => (
                      <button
                        key={keyword}
                        onClick={() => setQuery(keyword)}
                        className="px-4 py-2 bg-white border border-slate-200 text-sm font-medium text-slate-600 rounded-full hover:bg-accent/10 hover:border-accent/40 hover:text-accent transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer hover:-translate-y-0.5"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="flex flex-col gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Found {results.length} matching results
                </span>

                {results.map((art) => (
                  <Link
                    key={art.id}
                    href={art.url}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.01)] hover:border-accent/25 hover:shadow-[0_8px_24px_rgba(31,185,251,0.04)] hover:-translate-y-[2px] transition-all duration-300 no-underline group"
                  >
                    {art.imageUrl ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                        <img
                          src={art.imageUrl}
                          alt={art.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="relative w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                         <SearchIcon className="w-6 h-6 text-slate-300" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-accent uppercase tracking-wider block">
                          {getLabel(art.type)}
                        </span>
                        {art.category && (
                          <span className="text-[10px] font-medium text-slate-400 px-2 py-0.5 bg-slate-50 rounded-full">
                            {art.category}
                          </span>
                        )}
                      </div>
                      <h4 className="font-heading font-bold text-base text-primary group-hover:text-accent transition-colors leading-snug">
                        {renderHighlighted(art.highlightedTitle)}
                      </h4>
                      <p className="text-xs text-secondary line-clamp-2 mt-0.5">
                        {renderHighlighted(art.highlightedSummary)}
                      </p>
                    </div>
                    <span className="text-slate-300 group-hover:text-accent font-bold text-sm ml-2 transition-colors">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            ) : !isLoading ? (
              <div className="text-center text-secondary py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <p className="text-sm font-semibold">No results match your search term.</p>
                <button
                  onClick={() => setQuery('')}
                  className="mt-3 text-xs font-bold text-accent hover:underline uppercase tracking-wider"
                >
                  Clear search query
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
