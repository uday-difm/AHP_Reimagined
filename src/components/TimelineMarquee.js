'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const timelineSlides = [
  {
    season: 'WINTER 2023',
    phase: 'Sleep',
    title: 'The Sleep Revolution',
    slug: 'the-sleep-revolution',
    desc: 'Diving into physical sleep quality, REM cycles, and how daily brain recovery shapes cognitive health.',
    img: '/images/mag_sleep.png',
  },
  {
    season: 'FALL 2023',
    phase: 'Nutrition',
    title: 'Holistic Nutrition',
    slug: 'holistic-nutrition',
    desc: 'Understanding gut-brain axis pathways, balanced meal preparations, and clean biophilic diets.',
    img: '/images/mag_nutrition.png',
  },
  {
    season: 'SUMMER 2023',
    phase: 'Strength',
    title: 'The Strength Within',
    slug: 'the-strength-within',
    desc: 'Certified clinical routines, posture alignment standards, and functional energy maintenance guides.',
    img: '/images/mag_strength.png',
  },
  {
    season: 'SPRING 2023',
    phase: 'Mental Health',
    title: 'Digital Detox',
    slug: 'digital-detox',
    desc: 'Setting boundaries with tech to eliminate micro-anxiety loops and restore daily cognitive clarity.',
    img: '/images/mag_detox.png',
  },
];

export default function TimelineMarquee() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCards(3);
      } else if (window.innerWidth >= 768) {
        setVisibleCards(2);
      } else {
        setVisibleCards(1);
      }
    };
    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, []);

  const maxIndex = Math.max(0, timelineSlides.length - visibleCards);
  const activeIndex = Math.min(currentIndex, maxIndex);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const boundedPrev = Math.min(prev, maxIndex);
      return boundedPrev >= maxIndex ? 0 : boundedPrev + 1;
    });
  }, [maxIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => {
      const boundedPrev = Math.min(prev, maxIndex);
      return boundedPrev === 0 ? maxIndex : boundedPrev - 1;
    });
  }, [maxIndex]);

  // Autoplay timer: runs every 4 seconds unless hovered
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered, handleNext]);

  // Swipe handlers for mobile
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <section id="timeline" className="timeline-section py-[100px] bg-bg-timeline rounded-t-[40px] relative overflow-hidden">
      <div className="container relative px-6 md:px-8">
        {/* Section Header with Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 reveal-slide gap-6">
          <div className="text-left max-w-[600px]">
            <span className="section-tag text-[11px] font-bold tracking-[2px] text-accent uppercase mb-3 block">DIGITAL PUBLICATIONS</span>
            <h2 className="section-title text-white-section font-heading font-extrabold text-[32px] md:text-[44px] text-primary tracking-[-1px]">Explore Our Latest Issues</h2>
          </div>
          
          {/* Navigation Controls in Header */}
          <div className="flex gap-3 shrink-0">
            <button
              onClick={handlePrev}
              className="bg-white hover:bg-accent text-primary hover:text-white w-12 h-12 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_rgba(31,185,251,0.2)] transition-all duration-300 group border border-slate-100 cursor-pointer active:scale-95"
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            <button
              onClick={handleNext}
              className="bg-white hover:bg-accent text-primary hover:text-white w-12 h-12 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_rgba(31,185,251,0.2)] transition-all duration-300 group border border-slate-100 cursor-pointer active:scale-95"
              aria-label="Next slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-0.5 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel Viewport Wrapper */}
        <div 
          className="relative reveal-scale"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Slides Viewport */}
          <div 
            className="overflow-hidden -mx-3"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${activeIndex * (100 / visibleCards)}%)`,
              }}
            >
              {timelineSlides.map((slide, i) => (
                <div 
                  key={i} 
                  className="shrink-0 px-3"
                  style={{ width: `${100 / visibleCards}%` }}
                >
                  <Link
                    href={`/blogs/${slide.slug}`}
                    className="timeline-slide block bg-white rounded-[24px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col gap-5 select-none no-underline hover:shadow-[0_16px_40px_rgba(31,185,251,0.08)] hover:scale-[1.01] transition-all duration-300 h-full"
                  >
                    <div className="slide-header flex justify-center items-center gap-3.5 border-b border-slate-200 pb-3">
                      <span className="slide-year font-heading font-extrabold text-[18px] text-primary whitespace-nowrap">{slide.season}</span>
                      <span className="slide-phase text-[10px] font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full uppercase">{slide.phase}</span>
                    </div>
                    <div className="slide-body flex flex-col items-center text-center gap-3 flex-grow justify-between">
                      <div className="flex flex-col gap-3 items-center">
                        <h4 className="slide-title font-heading font-bold text-[16px] text-primary text-center">{slide.title}</h4>
                        <p className="slide-desc text-[13px] text-secondary leading-relaxed text-center">{slide.desc}</p>
                      </div>
                      <div className="slide-image relative mt-4 h-[140px] w-full rounded-xl overflow-hidden">
                        <Image
                          src={slide.img}
                          alt={slide.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2.5 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === idx ? 'w-8 bg-accent' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
