'use client';

import { useState, useEffect } from 'react';

/**
 * AdSlot — dynamic ad zone component.
 *
 * layout="strip"  → a compact single-line pill between sections (default)
 * layout="float"  → a small card that floats right, text wraps around it
 */
const ZONE_DIMENSIONS = {
  'homepage-hero-bottom': {
    desktop: { width: 728, height: 90 },
    mobile: { width: 300, height: 50 }
  },
  'homepage-articles-bottom': {
    desktop: { width: 970, height: 90 },
    mobile: { width: 300, height: 100 }
  },
  'homepage-about-bottom': {
    desktop: { width: 728, height: 90 },
    mobile: { width: 300, height: 50 }
  },
  'homepage-events-bottom': {
    desktop: { width: 728, height: 90 },
    mobile: { width: 300, height: 50 }
  },
  'hero-sidebar-bottom': {
    desktop: { width: 300, height: 250 },
    mobile: { width: 250, height: 250 }
  },
  'services-top': {
    desktop: { width: 728, height: 90 },
    mobile: { width: 300, height: 50 }
  },
  'article-body-top': {
    desktop: { width: 728, height: 90 },
    mobile: { width: 300, height: 50 }
  },
  'article-body-inline': {
    desktop: { width: 300, height: 250 },
    mobile: { width: 250, height: 250 }
  },
  'article-body-bottom': {
    desktop: { width: 728, height: 90 },
    mobile: { width: 300, height: 50 }
  },
  'about-hero-bottom': {
    desktop: { width: 728, height: 90 },
    mobile: { width: 300, height: 50 }
  },
  'about-mission-bottom': {
    desktop: { width: 970, height: 90 },
    mobile: { width: 300, height: 100 }
  }
};

export default function AdSlot({ zone, layout = 'strip', width, height, className }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function fetchAds() {
      try {
        const res = await fetch(`/api/ads/serve?zone=${zone}`);
        const data = await res.json();
        if (data.success && data.data?.ads) {
          setAds(data.data.ads);
        }
      } catch (err) {
        console.error(`Failed to fetch ads for zone ${zone}:`, err);
      } finally {
        setLoading(false);
      }
    }
    fetchAds();
  }, [zone]);

  if (loading) return null;

  const zoneConfig = ZONE_DIMENSIONS[zone];
  const activeDimensions = isMobile ? (zoneConfig?.mobile || zoneConfig?.desktop) : zoneConfig?.desktop;

  const w = width || activeDimensions?.width;
  const h = height || activeDimensions?.height;

  // ── Active ads ──────────────────────────────────────────────
  if (ads.length > 0) {
    if (layout === 'blogCard') {
      return (
        <div className={`w-full h-full flex ${className || ''}`}>
          <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100/50 flex flex-col justify-between hover:shadow-[0_16px_40px_rgba(31,185,251,0.08)] transition-all duration-300 h-full w-full">
            <div className="flex flex-col gap-3 h-full justify-between">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-[9.5px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-teal-50 text-teal-700">
                  Sponsored
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50 min-h-[120px] my-3">
                {ads.map((ad) => {
                  if (ad.type === 'CODE') {
                    return (
                      <div key={ad.id} className="w-full h-full flex justify-center items-center" dangerouslySetInnerHTML={{ __html: ad.code }} />
                    );
                  }
                  if (ad.type === 'IMAGE' && ad.imageUrl) {
                    return (
                      <a key={ad.id} href={ad.targetUrl || '#'} target="_blank" rel="noopener noreferrer"
                        className="block w-full h-full hover:opacity-90 transition-opacity">
                        <img src={ad.imageUrl} alt={ad.name || 'Ad'}
                          className="w-full h-full object-cover" />
                      </a>
                    );
                  }
                  return null;
                })}
              </div>
              <div>
                <a href="/info?tab=support" className="text-xs text-muted hover:text-accent font-semibold uppercase tracking-[1.5px] block text-center mt-2 transition-colors">
                  Advertise with us
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (layout === 'card') {
      return (
        <div className={`w-full h-full flex flex-col items-center justify-center ${className || ''}`}>
          <span className="block text-xs font-semibold text-muted uppercase tracking-[1.5px] mb-1.5 text-center font-body">Ad</span>
          <div 
            className="flex justify-center items-center overflow-hidden rounded-[32px] bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] w-full h-full min-h-[300px]"
          >
            {ads.map((ad) => {
              if (ad.type === 'CODE') {
                return (
                  <div key={ad.id} className="w-full h-full flex justify-center items-center" dangerouslySetInnerHTML={{ __html: ad.code }} />
                );
              }
              if (ad.type === 'IMAGE' && ad.imageUrl) {
                return (
                  <a key={ad.id} href={ad.targetUrl || '#'} target="_blank" rel="noopener noreferrer"
                    className="block w-full h-full hover:opacity-90 transition-opacity">
                    <img src={ad.imageUrl} alt={ad.name || 'Ad'}
                      className="w-full h-full object-cover" />
                  </a>
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    }

    const wrapClass = layout === 'float'
      ? 'float-right clear-right ml-6 mb-4'
      : 'w-full flex flex-col items-center my-3';

    const containerStyle = w && h ? {
      width: `${w}px`,
      maxWidth: '100%',
      aspectRatio: `${w} / ${h}`,
      height: 'auto',
    } : {};

    return (
      <div className={wrapClass}>
        <span className="block text-xs font-semibold text-muted uppercase tracking-[1.5px] mb-1.5 text-center font-body">Ad</span>
        <div 
          className="flex justify-center items-center overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]" 
          style={containerStyle}
        >
          {ads.map((ad) => {
            if (ad.type === 'CODE') {
              return (
                <div key={ad.id} className="w-full h-full flex justify-center items-center" dangerouslySetInnerHTML={{ __html: ad.code }} />
              );
            }
            if (ad.type === 'IMAGE' && ad.imageUrl) {
              return (
                <a key={ad.id} href={ad.targetUrl || '#'} target="_blank" rel="noopener noreferrer"
                  className="block w-full h-full hover:opacity-90 transition-opacity">
                  <img src={ad.imageUrl} alt={ad.name || 'Ad'}
                    className="w-full h-full object-cover" />
                </a>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  }

  // ── No active ads ────────────────────────────────────────────

  if (layout === 'blogCard') {
    return (
      <div className={`w-full h-full flex ${className || ''}`}>
        <a 
          href="/info?tab=support"
          className="group bg-white rounded-[24px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-200/60 flex flex-col justify-between hover:shadow-[0_16px_40px_rgba(31,185,251,0.08)] hover:border-teal-500/40 hover:scale-[1.02] transition-all duration-300 h-full w-full no-underline cursor-pointer select-none"
        >
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-[9.5px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                Partner Spot
              </span>
            </div>
            <h4 className="font-heading font-bold text-lg text-primary group-hover:text-teal-600 transition-colors mt-2">
              Want to get featured?
            </h4>
            <p className="text-[12.5px] text-secondary leading-relaxed mt-1">
              Place your brand inside our interactive guide slider. Reach health-conscious readers.
            </p>
          </div>

          <div className="mt-6">
            <span className="w-full text-center bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs py-2.5 rounded-full shadow-sm tracking-wider uppercase transition-colors block">
              Advertise with us →
            </span>
          </div>
        </a>
      </div>
    );
  }

  if (layout === 'card') {
    const cardContent = (
      <div className="flex flex-col items-center justify-center text-center p-6 gap-4 h-full w-full">
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Partner Spot</span>
        <div className="flex flex-col gap-2">
          <h5 className="text-base font-extrabold text-slate-800 dark:text-white leading-snug">Want to get featured here?</h5>
          <p className="text-xs text-slate-600 dark:text-slate-200 leading-relaxed max-w-[200px] mx-auto font-medium">
            Align your brand with medically verified health guides.
          </p>
        </div>
        <span className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 text-white font-heading font-extrabold text-xs py-2 px-5 rounded-full shadow-sm tracking-wider uppercase transition-all duration-300 hover:scale-105 mt-2">
          Advertise with us →
        </span>
      </div>
    );

    return (
      <div className={`w-full h-full flex ${className || ''}`}>
        <a 
          href="/info?tab=support"
          className="flex flex-col justify-center items-center overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200/60 dark:border-slate-700 hover:border-teal-500/40 dark:hover:border-teal-500/60 hover:shadow-[0_8px_30px_rgba(15,124,133,0.06)] dark:hover:shadow-[0_8px_30px_rgba(20,184,166,0.15)] transition-all duration-500 group cursor-pointer no-underline select-none w-full h-full min-h-[300px]"
        >
          {cardContent}
        </a>
      </div>
    );
  }

  // If size mapping exists, display the clean mockup layout (gray box with attractive CTAs)
  if (w && h) {
    const wrapClass = layout === 'float'
      ? 'float-right clear-right ml-6 mb-4'
      : 'w-full flex flex-col items-center my-4';

    const containerStyle = {
      width: `${w}px`,
      maxWidth: '100%',
      aspectRatio: `${w} / ${h}`,
      height: 'auto',
    };

    // Determine content based on aspect ratio
    const isWide = w >= 468 && h <= 120;
    const isTall = w <= 200 && h >= 400;
    const isSmallStrip = w <= 400 && h <= 100;

    let ctaContent;
    if (isSmallStrip) {
      ctaContent = (
        <div className="flex items-center justify-center w-full h-full px-2">
          <span className="text-[11px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Advertise with us →
          </span>
        </div>
      );
    } else if (isWide) {
      ctaContent = (
        <div className="flex items-center justify-between w-full px-6 md:px-10 h-full">
          <div className="text-left">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest block">Partner Spot</span>
            <p className="text-sm md:text-sm font-bold text-slate-800 dark:text-white leading-tight">Want to get featured here?</p>
          </div>
          <span className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 text-white font-heading font-extrabold text-xs md:text-xs py-1.5 px-4 rounded-full shadow-sm tracking-wider uppercase transition-colors">
            Advertise with us →
          </span>
        </div>
      );
    } else if (isTall) {
      ctaContent = (
        <div className="flex flex-col items-center justify-center text-center p-4 gap-4 h-full">
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Partner Spot</span>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white leading-snug">Want to get featured?</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Reach 100k+ readers</p>
          </div>
          <span className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 text-white font-heading font-extrabold text-xs py-1.5 px-3 rounded-full shadow-sm tracking-wider uppercase transition-colors mt-auto mb-2">
            Advertise →
          </span>
        </div>
      );
    } else {
      // Box / Square / Default
      ctaContent = (
        <div className="flex flex-col items-center justify-center text-center p-4 gap-2.5 h-full">
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Partner Spot</span>
          <div>
            <h5 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">Want to get featured here?</h5>
            <p className="text-xs text-slate-600 dark:text-slate-200 mt-1 max-w-[200px] font-medium">Align your brand with medically verified health guides.</p>
          </div>
          <span className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 text-white font-heading font-extrabold text-xs py-1.5 px-4 rounded-full shadow-sm tracking-wider uppercase transition-colors mt-1">
            Advertise with us →
          </span>
        </div>
      );
    }

    return (
      <div className={wrapClass}>
        <a 
          href="/info?tab=support"
          className="flex justify-center items-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200/50 dark:border-slate-700 hover:border-teal-500/40 dark:hover:border-teal-500/60 hover:shadow-[0_8px_30px_rgba(15,124,133,0.06)] transition-all duration-500 group cursor-pointer no-underline select-none"
          style={containerStyle}
        >
          {ctaContent}
        </a>
      </div>
    );
  }


  // Float variant fallback if no dimensions specified
  if (layout === 'float') {
    return (
      <a href="/info?tab=support"
        className="float-right clear-right ml-6 mb-4 w-[180px] flex flex-col gap-2 bg-bg-light border border-slate-200/80 rounded-xl p-4 no-underline hover:border-accent/30 hover:shadow-[0_4px_16px_rgba(31,185,251,0.06)] transition-all duration-300 group">
        <span className="text-xs font-bold text-accent uppercase tracking-[1.5px]">Partner with us</span>
        <p className="text-xs font-semibold text-primary leading-snug group-hover:text-accent transition-colors">
          Advertise to our health audience
        </p>
        <span className="text-xs text-muted group-hover:text-accent transition-colors">Contact us →</span>
      </a>
    );
  }

  // Strip variant fallback if no dimensions specified
  return (
    <div className="w-full flex items-center justify-between px-1 py-2 my-1">
      <span className="text-xs font-semibold text-slate-300 uppercase tracking-[2px]">Ad space</span>
      <a href="/info?tab=support"
        className="text-xs font-semibold text-muted hover:text-accent uppercase tracking-[1px] transition-colors duration-200">
        Advertise with us →
      </a>
    </div>
  );
}

