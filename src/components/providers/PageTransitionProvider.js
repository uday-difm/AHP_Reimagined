'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const PageTransitionContext = createContext(null);

const healthTips = [
  "Drinking water first thing in the morning boosts metabolism and hydration.",
  "Taking a 5-minute walking break every hour improves cardiovascular health.",
  "Regular deep breathing activates your parasympathetic nervous system, lowering stress.",
  "Consistency is key. A short daily walk is better than a single long weekend run.",
  "Blue light from screens disrupts melatonin. Try going screen-free 30 mins before bed.",
  "Balancing your diet with dosha-specific foods promotes natural digestion.",
  "Small changes make the biggest impact. Focus on one small habit at a time.",
  "Stretching daily keeps joints flexible and maintains proper spinal posture."
];

export default function PageTransitionProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState('idle'); // 'idle' | 'covering' | 'revealing'
  const [currentTip, setCurrentTip] = useState('');

  // When pathname changes, start sliding the panel out to reveal the new content
  useEffect(() => {
    if (status === 'covering') {
      setStatus('revealing');
      const timer = setTimeout(() => {
        setStatus('idle');
      }, 650); // duration matching the slide-out animation
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Global click interceptor to catch any local page navigation clicks
  useEffect(() => {
    const handleLinkClick = (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const target = anchor.getAttribute('target');

      // Intercept only standard local relative URLs (not external links, anchors, or new tabs)
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//#') &&
        !href.includes('#') &&
        target !== '_blank' &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        // Prevent loading animation if navigating to the current page
        const cleanHref = href.split('?')[0].split('#')[0];
        const cleanPathname = pathname.split('?')[0].split('#')[0];
        if (cleanHref === cleanPathname) {
          return;
        }

        e.preventDefault();

        // Select a random health tip for this transition
        const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
        setCurrentTip(randomTip);

        // Start slide-in wipe from the right
        setStatus('covering');

        // Route change occurs exactly when the cover has covered the viewport
        setTimeout(() => {
          router.push(href);
        }, 600); // slightly before anim ends to allow prefetch/load latency
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, [router, status]);

  return (
    <PageTransitionContext.Provider value={{ setStatus }}>
      {children}

      {/* Wipe Overlay Panel */}
      {status !== 'idle' && (
        <div
          className={`fixed inset-0 w-screen h-screen bg-white z-[99999] flex flex-col items-center justify-center pointer-events-none p-6 ${
            status === 'covering' ? 'wipe-enter' : 'wipe-exit'
          }`}
        >
          {/* Animated/Pulsing Heart Logo */}
          <div className="flex flex-col items-center max-w-md text-center transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-[#e8f8f0] flex items-center justify-center text-[#27ae60] mb-6 animate-pulse shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>

            {/* Health Tip */}
            <span className="text-xs font-bold tracking-[2.5px] uppercase text-[#27ae60] mb-2 block">HEALTH TIP</span>
            <p className="font-heading font-bold text-lg md:text-xl leading-snug text-primary max-w-sm mb-6">
              &ldquo;{currentTip}&rdquo;
            </p>

            {/* Loading Indicator */}
            <div className="flex items-center gap-2 text-secondary/60 text-xs font-medium tracking-wide">
              <svg className="animate-spin h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Preparing guides...
            </div>
          </div>
        </div>
      )}
    </PageTransitionContext.Provider>
  );
}
