'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Search from '@/components/Search';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);

  // Header Hide/Show on Scroll
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHideHeader(true);
      } else {
        setHideHeader(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Body scroll locking when menu is open
  useEffect(() => {
    if (menuOpen) {
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
  }, [menuOpen]);

  return (
    <>
      {/* Sticky Header */}
      <header
        className={`fixed top-0 left-0 w-full flex items-center z-[9000] transition-all duration-300 ${menuOpen
          ? 'bg-transparent border-b border-transparent h-20'
          : scrolled
            ? 'bg-transparent h-[70px] shadow-[0_4px_30px_rgba(0,0,0,0.02)] border-b border-[var(--color-border)]/40 backdrop-blur-md'
            : 'bg-transparent h-20 border-b border-[var(--color-border)]/40 backdrop-blur-md'
          } ${hideHeader && !menuOpen ? '-translate-y-full' : 'translate-y-0'}`}
      >
        <div className="header-container flex justify-between items-center w-full px-6 md:px-10">
          <a href="/" className="logo-link flex items-center">
            <Image
              src="/images/Logo-web.png"
              alt="A Health Place Logo"
              width={360}
              height={100}
              className="logo-img h-16 w-auto object-contain block transition-transform duration-300 hover:scale-[1.03]"
              priority
            />
          </a>
          {/* Desktop Nav */}
          <nav className="nav-desktop flex items-center gap-4 md:gap-8 flex-1 justify-center">
            <a href="/" className="nav-item text-xs md:text-sm font-medium text-secondary relative py-1.5 transition-colors hover:text-primary after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full">Home</a>
            <a href="/publication" className="nav-item text-xs md:text-sm font-medium text-secondary relative py-1.5 transition-colors hover:text-primary after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full">Publication</a>
          </nav>

          {/* Actions wrapper */}
          <div className="flex items-center gap-3 z-[10000]">
            <Search />

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`relative w-12 h-12 rounded-full flex flex-col justify-center items-center gap-1.25 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-500 border ${menuOpen ? 'bg-primary border-primary' : 'bg-white/90 border-[var(--color-border)]/80 hover:scale-105 hover:border-accent hover:shadow-[0_6px_24px_rgba(31,185,251,0.12)]'
                }`}
              aria-label="Toggle Menu"
            >
              <span className={`w-[20px] h-[2px] rounded-sm transition-all duration-500 origin-center ${menuOpen ? 'bg-white translate-y-[6px] rotate-45' : 'bg-primary'}`} />
              <span className={`w-[20px] h-[2px] rounded-sm transition-all duration-500 ${menuOpen ? 'opacity-0 scale-x-0' : 'bg-primary'}`} />
              <span className={`w-[20px] h-[2px] rounded-sm transition-all duration-500 origin-center ${menuOpen ? 'bg-white -translate-y-[6px] -rotate-45' : 'bg-primary'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Universal Hamburger Menu Overlay */}
      <div
        className={`fixed inset-0 w-full h-screen bg-white/60 backdrop-blur-3xl z-[8999] flex items-center justify-center transition-all duration-500 ${menuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
          }`}
      >
        <div className={`hb-menu-container w-full px-10 md:px-20 grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-10 md:gap-20 items-center transition-transform duration-700 ${menuOpen ? 'translate-y-0' : 'translate-y-10'}`}>
          <nav className="hb-nav-links flex flex-col gap-4">
            {['About', 'Blogs', 'Journey', 'Community', 'Newsletter', 'Digital Magazine'].map((label, i) => {
              const isPublication = label === 'Digital Magazine';
              const isBlogs = label === 'Blogs';
              const href = isPublication
                ? '/publication'
                : isBlogs
                  ? '/blogs'
                  : `/#${label.toLowerCase().replace('journey', 'timeline').replace('newsletter', 'contact').replace('community', 'events')}`;
              return (
                <a
                  key={i}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  style={{ transitionDelay: `${i * 0.1}s` }}
                  className={`hb-nav-item font-heading font-extrabold text-[36px] sm:text-[48px] md:text-[64px] text-primary no-underline leading-[1.1] tracking-[-2px] inline-block hover:text-accent hover:translate-x-3 transition-all duration-500 ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                    }`}
                >
                  {label}
                </a>
              );
            })}
          </nav>
          <div className={`hb-meta-panel flex flex-col gap-10 border-l-0 md:border-l border-primary/10 pl-0 md:pl-12 transition-all duration-500 delay-400 ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}>
            <div className="hb-quote-section flex items-start justify-start py-10 px-6 md:px-8 max-w-[650px]">
              <div className="hb-quote-container font-['Optima',_'Candara',_'Noto_Sans',_sans-serif] text-[#1a1a1a] py-10 leading-[1.1] uppercase">
                <h1 className="hb-main-text text-[48px] md:text-[60px] lg:text-[70px] tracking-[3px] font-normal m-0 leading-[1.1]">
                  "Small Changes Big Impact"
                </h1>
                <p className="hb-sub-text text-[28px] md:text-[33px] lg:text-[38px] tracking-[1px] mt-2 md:mt-3 font-normal pl-1 leading-[1.1]">
                  Start today—your future self will thank you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
