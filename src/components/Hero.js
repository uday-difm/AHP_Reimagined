'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export default function Hero() {
  // Parallax Hero Image Effect
  useEffect(() => {
    const parallaxImg = document.querySelector('.parallax-img');
    if (!parallaxImg) return;

    let ticking = false;

    const handleParallax = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPos = window.scrollY;
          const yTranslate = scrollPos * 0.12;
          parallaxImg.style.transform = `translate3d(0, ${yTranslate}px, 0) scale(1.05)`;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleParallax, { passive: true });
    return () => window.removeEventListener('scroll', handleParallax);
  }, []);

  return (
    <section className="hero-section pt-[140px] pb-20 relative overflow-hidden">
      {/* Decorative sharp gradient circle with flare blur on the right */}
      <div className="absolute w-[450px] h-[450px] md:w-[800px] md:h-[800px] rounded-full bg-gradient-to-tr from-accent/25 to-purple-500/20 top-[-60px] md:top-[-120px] right-[-120px] md:right-[-250px] pointer-events-none z-0 shadow-[0_0_60px_rgba(31,185,251,0.2),0_0_120px_rgba(168,85,247,0.15)] border border-white/10 blur-xl" />

      <div className="container hero-container flex flex-col gap-[60px] relative z-10">
        <div className="hero-text-grid grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-10 md:gap-[40px] items-end">
          <div className="hero-title-col">

            <h1 className="hero-title font-heading font-extrabold text-[48px] md:text-[92px] text-primary leading-[1.05] tracking-[-2px] flex flex-col reveal-text">
              <span>Building wellness</span>

              <span>into your Life</span>

            </h1>
          </div>
          <div className="hero-desc-col pb-3 flex flex-col gap-6 reveal-fade">
            <p className="hero-desc text-[16px] md:text-[18px] leading-relaxed text-secondary">
              Discover practical techniques to integrate mindfulness into your busy schedule, reducing stress and improving overall well-being.
            </p>
            <div className="hero-scroll-indicator flex items-center gap-3">
              <span className="scroll-dot w-2 h-2 bg-accent rounded-full animate-pulse-slow" />
              <span className="scroll-text text-[12px] font-semibold uppercase tracking-[1.5px] text-muted">Scroll to read guides</span>
            </div>
          </div>
        </div>

        {/* Featured Article Hero Image */}
        <div className="hero-image-wrapper relative z-10 w-full h-[300px] md:h-[600px] rounded-[24px] overflow-hidden shadow-[0_20px_48px_rgba(0,0,0,0.05)] reveal-scale">
          <div className="parallax-img-container w-full h-[120%] absolute -top-[10%] left-0">
            <Image
              src="/images/holistic.png"
              alt="Holistic yoga wellness concept illustration"
              fill
              priority
              className="parallax-img object-cover transition-transform duration-100 ease-out scale-[1.05]"
              style={{ willChange: 'transform' }}
              sizes="100vw"
            />
          </div>
          <div className="hero-image-overlay absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-light/50 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
