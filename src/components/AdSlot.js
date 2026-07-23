'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Standard Google AdSense / IAB Fixed Dimensions
 */
const GOOGLE_AD_DIMENSIONS = {
  'homepage-blog-card': { width: 300, height: 250 },        // Google Medium Rectangle (300x250)
  'homepage-quiz-card': { width: 300, height: 250 },        // Google Medium Rectangle (300x250)
  'homepage-articles-sidebar': { width: 300, height: 600 }, // Google Half-Page / Skyscraper (300x600)
  'publication-hero-sidebar': { width: 300, height: 600 },  // Google Half-Page / Skyscraper (300x600)
  'hero-sidebar-bottom': { width: 300, height: 250 },       // Google Medium Rectangle (300x250)
  'services-top': { width: 728, height: 90 },              // Google Leaderboard (728x90)
  'article-body-top': { width: 728, height: 90 },           // Google Leaderboard (728x90)
  'article-body-inline': { width: 300, height: 250 },        // Google Medium Rectangle (300x250)
  'article-body-bottom': { width: 728, height: 90 },        // Google Leaderboard (728x90)
  'about-hero-bottom': { width: 728, height: 90 },          // Google Leaderboard (728x90)
  'about-mission-bottom': { width: 970, height: 90 },       // Google Large Leaderboard (970x90)
  'homepage-about-bottom': { width: 728, height: 90 },      // Google Leaderboard (728x90)
};

/**
 * Fixed-Size Google AdSlot Component
 */
export default function AdSlot({
  zone,
  placement,
  layout,
  badgeText = 'Partner Highlight',
  fallbackTitle = 'Advertise With Us',
  fallbackDescription = 'Showcase your brand to our engaged audience of health and wellness advocates.',
  fallbackCta = 'Get Started →',
  fallbackUrl = '/info?tab=contact',
  fallbackImage,
  width,
  height,
  className = '',
}) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const trackedImpressions = useRef(new Set());

  // Determine Google AdSense Fixed Dimensions
  const defaultDim = GOOGLE_AD_DIMENSIONS[zone] || { width: 300, height: 250 };
  const fixedWidth = width || defaultDim.width;
  const fixedHeight = height || defaultDim.height;

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DISABLE_ADS === 'true') {
      setLoading(false);
      return;
    }

    async function fetchAds() {
      try {
        const currentRoute = typeof window !== 'undefined' ? window.location.pathname : '/';
        const device = isMobile ? 'mobile' : 'desktop';
        
        let url;
        if (placement) {
          url = `/api/ads/active?placement=${placement}&device=${device}`;
        } else if (zone) {
          url = `/api/ads/serve?zone=${encodeURIComponent(zone)}&route=${encodeURIComponent(currentRoute)}`;
        } else {
          setLoading(false);
          return;
        }

        const siteId = (typeof window !== 'undefined' && localStorage.getItem('x-site-id')) || process.env.NEXT_PUBLIC_SITE_ID || 'AHP';
        const res = await fetch(url, { headers: { 'x-site-id': siteId } });
        const data = await res.json();
        
        const fetchedAds = data.data?.ads || data.ads || [];
        setAds(Array.isArray(fetchedAds) ? fetchedAds : []);
      } catch (err) {
        console.error('Failed to fetch ads for zone:', zone, err);
        setAds([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAds();
  }, [zone, placement, isMobile]);

  const handleAdClick = async (adId) => {
    try {
      const siteId = (typeof window !== 'undefined' && localStorage.getItem('x-site-id')) || process.env.NEXT_PUBLIC_SITE_ID || 'AHP';
      await fetch('/api/ads/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-site-id': siteId },
        body: JSON.stringify({ adId, type: 'click' }),
      });
    } catch (err) {
      console.error('Failed to record ad click:', err);
    }
  };

  const activeAd = ads && ads.length > 0 ? ads[0] : null;

  // Track impression once
  useEffect(() => {
    if (activeAd && activeAd.id && !trackedImpressions.current.has(activeAd.id)) {
      trackedImpressions.current.add(activeAd.id);
      const siteId = (typeof window !== 'undefined' && localStorage.getItem('x-site-id')) || process.env.NEXT_PUBLIC_SITE_ID || 'AHP';
      fetch('/api/ads/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-site-id': siteId },
        body: JSON.stringify({ adId: activeAd.id, type: 'impression' }),
      }).catch(() => {});
    }
  }, [activeAd]);

  const fixedStyle = {
    width: `${fixedWidth}px`,
    height: `${fixedHeight}px`,
    maxWidth: '100%',
    flexShrink: 0,
  };

  // Loading skeleton matching fixed dimensions
  if (loading) {
    return (
      <div className={`flex items-center justify-center my-4 ${className}`}>
        <div
          style={fixedStyle}
          className="bg-[#f0f9fa]/80 rounded-[20px] p-4 border border-[#0f7c85]/20 flex flex-col items-center justify-center text-center shadow-xs"
        >
          <div className="w-5 h-5 rounded-full border-2 border-[#0f7c85] border-t-transparent animate-spin mb-2" />
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Loading Ad ({fixedWidth}x{fixedHeight})...</span>
        </div>
      </div>
    );
  }

  // Active Ad Rendering
  if (activeAd) {
    if (activeAd.code) {
      return (
        <div className={`flex items-center justify-center my-4 ${className}`}>
          <div
            style={fixedStyle}
            className="bg-white rounded-[20px] p-2 border border-slate-200 flex items-center justify-center overflow-hidden"
            onClick={() => handleAdClick(activeAd.id)}
            dangerouslySetInnerHTML={{ __html: activeAd.code }}
          />
        </div>
      );
    }

    return (
      <div className={`flex items-center justify-center my-4 ${className}`}>
        <div
          style={fixedStyle}
          className="bg-gradient-to-br from-[#f0f9fa] via-[#f7fdfd] to-[#eef9fa] rounded-[20px] p-4 border border-[#0f7c85]/20 hover:border-[#0f7c85]/40 transition-all duration-300 shadow-xs flex flex-col justify-between text-center overflow-hidden group cursor-pointer"
        >
          <div className="flex flex-col items-center flex-1 justify-center min-h-0">
            <span className="inline-block bg-[#0f7c85]/10 border border-[#0f7c85]/20 text-[#0f7c85] font-extrabold text-[9px] uppercase tracking-[1.5px] px-2.5 py-0.5 rounded-full mb-2 shrink-0">
              {badgeText}
            </span>

            {activeAd.imageUrl && (
              <div className="w-full max-h-[50%] mb-2 overflow-hidden rounded-[14px] flex justify-center items-center bg-white shadow-2xs shrink-0">
                <img src={activeAd.imageUrl} alt={activeAd.headline || activeAd.name} className="max-w-full max-h-full w-auto h-auto object-cover rounded-[14px]" />
              </div>
            )}

            {activeAd.headline && (
              <h4 className="font-heading font-extrabold text-sm text-slate-900 mb-1 leading-snug line-clamp-2 shrink-0">
                {activeAd.headline}
              </h4>
            )}

            {activeAd.description && (
              <p className="text-slate-600 font-medium text-[11px] leading-tight max-w-xs mb-2 line-clamp-2 shrink-0">
                {activeAd.description}
              </p>
            )}
          </div>

          <a
            href={activeAd.targetUrl || fallbackUrl}
            target={activeAd.targetUrl?.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            onClick={() => handleAdClick(activeAd.id)}
            className="w-max mx-auto bg-[#0f7c85] hover:bg-[#0c646b] text-white font-extrabold text-[11px] py-2 px-5 rounded-full transition-all duration-300 no-underline shadow-xs inline-flex items-center gap-1 cursor-pointer shrink-0"
          >
            {activeAd.ctaText || fallbackCta}
          </a>
        </div>
      </div>
    );
  }

  // Fallback Card (Google AdSense Fixed Specs)
  return (
    <div className={`flex items-center justify-center my-4 ${className}`}>
      <div
        style={fixedStyle}
        className="bg-gradient-to-br from-[#f0f9fa] via-[#f7fdfd] to-[#eef9fa] rounded-[20px] p-4 border border-[#0f7c85]/20 flex flex-col justify-between text-center shadow-xs overflow-hidden group hover:border-[#0f7c85]/40 transition-all duration-300"
      >
        <div className="flex flex-col items-center flex-1 justify-center min-h-0">
          <span className="inline-block bg-[#0f7c85]/10 border border-[#0f7c85]/20 text-[#0f7c85] font-extrabold text-[9px] uppercase tracking-[1.5px] px-2.5 py-0.5 rounded-full mb-2 shrink-0">
            {badgeText}
          </span>

          {fallbackImage && (
            <div className="w-full max-h-[45%] mb-2 overflow-hidden rounded-[14px] flex justify-center items-center bg-white shadow-2xs shrink-0">
              <img src={fallbackImage} alt={fallbackTitle} className="w-full h-full object-cover rounded-[14px]" />
            </div>
          )}

          <h4 className="font-heading font-extrabold text-sm text-slate-900 mb-1 leading-snug line-clamp-2 shrink-0">
            {fallbackTitle}
          </h4>
          <p className="text-slate-600 font-medium text-[11px] leading-tight max-w-xs mb-2 line-clamp-2 shrink-0">
            {fallbackDescription}
          </p>
        </div>

        <a
          href={fallbackUrl}
          className="w-max mx-auto bg-[#0f7c85] hover:bg-[#0c646b] text-white font-extrabold text-[11px] py-2 px-5 rounded-full transition-all duration-300 no-underline shadow-xs inline-flex items-center gap-1 cursor-pointer shrink-0"
        >
          {fallbackCta}
        </a>
      </div>
    </div>
  );
}
