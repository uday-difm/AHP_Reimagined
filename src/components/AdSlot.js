'use client';

import { useState, useEffect } from 'react';

/**
 * AdSlot — dynamic ad zone component.
 *
 * layout="strip"  → a compact single-line pill between sections (default)
 * layout="float"  → a small card that floats right, text wraps around it
 */
export default function AdSlot({ zone, layout = 'strip' }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // ── Active ads ──────────────────────────────────────────────
  if (ads.length > 0) {
    const wrapClass = layout === 'float'
      ? 'float-right clear-right ml-6 mb-4 w-[200px]'
      : 'w-full flex flex-col items-center my-3';

    return (
      <div className={wrapClass}>
        <span className="block text-[9px] font-semibold text-muted uppercase tracking-[1.5px] mb-1.5 text-center">Ad</span>
        {ads.map((ad) => {
          if (ad.type === 'CODE') {
            return (
              <div key={ad.id} dangerouslySetInnerHTML={{ __html: ad.code }} />
            );
          }
          if (ad.type === 'IMAGE' && ad.imageUrl) {
            return (
              <a key={ad.id} href={ad.targetUrl || '#'} target="_blank" rel="noopener noreferrer"
                className="block hover:opacity-90 transition-opacity">
                <img src={ad.imageUrl} alt={ad.name || 'Ad'}
                  className="w-full h-auto rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.06)]" />
              </a>
            );
          }
          return null;
        })}
      </div>
    );
  }

  // ── No active ads ────────────────────────────────────────────

  // Float variant — small sidebar-style CTA that text flows around
  if (layout === 'float') {
    return (
      <a href="/info?tab=support"
        className="float-right clear-right ml-6 mb-4 w-[180px] flex flex-col gap-2 bg-bg-light border border-slate-200/80 rounded-xl p-4 no-underline hover:border-accent/30 hover:shadow-[0_4px_16px_rgba(31,185,251,0.06)] transition-all duration-300 group">
        <span className="text-[9px] font-bold text-accent uppercase tracking-[1.5px]">Partner with us</span>
        <p className="text-[12px] font-semibold text-primary leading-snug group-hover:text-accent transition-colors">
          Advertise to our health audience
        </p>
        <span className="text-[10px] text-muted group-hover:text-accent transition-colors">Contact us →</span>
      </a>
    );
  }

  // Strip variant — a compact single-line row between page sections
  return (
    <div className="w-full flex items-center justify-between px-1 py-2 my-1">
      <span className="text-[9px] font-semibold text-slate-300 uppercase tracking-[2px]">Ad space</span>
      <a href="/info?tab=support"
        className="text-[9px] font-semibold text-muted hover:text-accent uppercase tracking-[1px] transition-colors duration-200">
        Advertise with us →
      </a>
    </div>
  );
}
