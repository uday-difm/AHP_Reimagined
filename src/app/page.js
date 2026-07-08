'use client';

import { useEffect } from 'react';
import CustomCursor from '@/components/CustomCursor';
import BackdropBlobs from '@/components/BackdropBlobs';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import ArticlesGrid from '@/components/ArticlesGrid';
import TimelineMarquee from '@/components/TimelineMarquee';
import CommunityEvents from '@/components/CommunityEvents';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';

export default function Home() {
  // Global scroll reveal intersection observer setup
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal-text, .reveal-slide, .reveal-scale, .reveal-fade');

    const revealCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(revealCallback, {
      root: null,
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    });

    revealElements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Global Animation Utilities */}
      <CustomCursor />
      <BackdropBlobs />

      {/* Persistent Navigation */}
      <Header />

      {/* Modular Page Sections */}
      <main className="w-full">
        <Hero />
        <About />
        <ArticlesGrid />
        <TimelineMarquee />
        <CommunityEvents />
        <Newsletter />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
