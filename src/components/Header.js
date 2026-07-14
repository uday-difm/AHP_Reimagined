'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Search from '@/components/Search';
import Marquee from '@/components/Marquee';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [navItems, setNavItems] = useState([]);
  const [headerConfig, setHeaderConfig] = useState(null);
  console.log(headerConfig)

  // Fetch header configurations from DB
  useEffect(() => {
    fetch('/api/header')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.data?.header) {
          setHeaderConfig(data.data.header);
        }
      })
      .catch(() => { });
  }, []);

  // Fetch dynamic menu based on header configuration selection (defaults to 'main')
  const activeMenuType = headerConfig?.menuType || 'main';

  useEffect(() => {
    fetch(`/api/navigation/${activeMenuType}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.data?.items)) {
          setNavItems(data.data.items);
        }
      })
      .catch(() => { });
  }, [activeMenuType]);

  // Default links fallback
  const defaultLinks = useMemo(() => [
    { label: 'Home', url: '/', type: 'internal' },
    { label: 'About', url: '/about', type: 'internal' },
    { label: 'Publication', url: '/publication', type: 'internal' },
    { label: 'Blogs', url: '/blogs', type: 'internal' },
    { label: 'Quizzes', url: '/quizzes', type: 'internal' },
    { label: 'Contact Us', url: '/contact', type: 'internal' },
  ], []);

  const displayLinks = useMemo(() => {
    return navItems.length > 0 ? navItems : defaultLinks;
  }, [navItems, defaultLinks]);

  // Mobile links appending Dashboard & Authentication
  const displayMobileLinks = useMemo(() => {
    return [
      ...displayLinks,
      ...(isAuthenticated
        ? [
          { label: 'Dashboard', url: '/quizzes/dashboard', type: 'internal' },
          { label: 'Logout', url: '#', type: 'internal', isLogout: true },
        ]
        : [
          { label: 'Login', url: '/login', type: 'internal' },
        ]),
    ];
  }, [displayLinks, isAuthenticated]);

  // Body and HTML scroll locking when menu is open
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

  // Derived Header Configurations
  const showAnnounce = headerConfig?.announcementBar?.enabled;
  const announceLink = headerConfig?.announcementBar?.link || "/blogs";
  const announceBg = headerConfig?.announcementBar?.bgColor || "#2563eb";
  const announceColor = headerConfig?.announcementBar?.textColor || "#ffffff";

  // Resolve multiple texts to display with individual links
  const announceItems = useMemo(() => {
    if (!headerConfig?.announcementBar) {
      return [{ text: "Welcome to our new headless multi-site CMS console!", link: "/blogs" }];
    }
    // Check items array
    if (Array.isArray(headerConfig.announcementBar.items) && headerConfig.announcementBar.items.length > 0) {
      const valid = headerConfig.announcementBar.items.filter(item => item && item.text && item.text.trim());
      if (valid.length > 0) return valid;
    }
    // Check texts array
    if (Array.isArray(headerConfig.announcementBar.texts) && headerConfig.announcementBar.texts.length > 0) {
      const valid = headerConfig.announcementBar.texts.filter(t => t && t.trim());
      if (valid.length > 0) {
        return valid.map(t => ({ text: t, link: headerConfig.announcementBar.link || "/blogs" }));
      }
    }
    // Check fallback text
    if (headerConfig.announcementBar.text) {
      return [{ text: headerConfig.announcementBar.text, link: headerConfig.announcementBar.link || "/blogs" }];
    }
    return [{ text: "Welcome to our new headless multi-site CMS console!", link: "/blogs" }];
  }, [headerConfig]);

  // Repeat announcements sequence to fill screen width
  const repeatedAnnouncements = useMemo(() => {
    if (announceItems.length === 0) return [];
    const repeats = Math.max(2, Math.ceil(8 / announceItems.length));
    return Array(repeats).fill(announceItems).flat();
  }, [announceItems]);

  // If announcement bar is disabled, the marquee acts as a nice aesthetic fallback.
  // We offset header top height based on whether a top bar exists.
  const topBarHeight = showAnnounce ? '40px' : (headerConfig === null ? '40px' : '0px');

  const logoType = headerConfig?.logoType || 'image';
  const logoText = headerConfig?.logoText || 'A Health Place';
  const logoUrl = headerConfig?.logoUrl || '/images/Logo-web.png';
  const logoWidth = Number(headerConfig?.logoWidth) || 360;
  const logoHeight = Number(headerConfig?.logoHeight) || 48;

  const paddingY = headerConfig?.paddingY || 'medium';
  const headerHeightClass = {
    small: 'h-16',
    medium: 'h-20',
    large: 'h-24',
  }[paddingY] || 'h-20';

  const borderBottom = headerConfig?.borderBottom !== false;
  const shadowSize = headerConfig?.shadowSize || 'none';
  const shadowClass = {
    none: '',
    small: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg',
  }[shadowSize] || '';

  const ctaText = headerConfig?.ctaText;
  const ctaLink = headerConfig?.ctaLink || '/contact';

  return (
    <>
      {/* Dynamic Announcement Bar or fallback Marquee */}
      {showAnnounce ? (
        <div
          className="fixed top-0 left-0 right-0 h-10 flex items-center overflow-hidden whitespace-nowrap select-none z-[9001] shadow-xs"
          style={{ backgroundColor: announceBg, color: announceColor }}
        >
          <div className="inline-block animate-marquee whitespace-nowrap">
            {repeatedAnnouncements.map((item, idx) => (
              <span key={idx} className="inline-flex items-center mx-6 font-heading text-[13px] md:text-[14px] tracking-[1.5px]">
                <span className="w-2 h-2 rounded-full mr-4" style={{ backgroundColor: announceColor === '#ffffff' ? '#8fe9ec' : 'currentColor', opacity: 0.8 }} />
                {item.link ? (
                  <Link href={item.link} className="hover:underline text-inherit no-underline font-semibold">
                    {item.text}
                  </Link>
                ) : (
                  <span className="font-semibold">{item.text}</span>
                )}
              </span>
            ))}
          </div>
          <div className="inline-block animate-marquee whitespace-nowrap" aria-hidden="true">
            {repeatedAnnouncements.map((item, idx) => (
              <span key={`clone-${idx}`} className="inline-flex items-center mx-6 font-heading text-[13px] md:text-[14px] tracking-[1.5px]">
                <span className="w-2 h-2 rounded-full mr-4" style={{ backgroundColor: announceColor === '#ffffff' ? '#8fe9ec' : 'currentColor', opacity: 0.8 }} />
                {item.link ? (
                  <Link href={item.link} className="hover:underline text-inherit no-underline font-semibold">
                    {item.text}
                  </Link>
                ) : (
                  <span className="font-semibold">{item.text}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      ) : (
        headerConfig === null && <Marquee />
      )}

      {/* Header Container */}
      <header
        className={`fixed left-0 w-full flex items-center ${headerHeightClass} bg-white/30 backdrop-blur-lg z-[9000] transition-all duration-300 ${borderBottom ? 'border-b border-slate-200/50' : ''
          } ${shadowClass}`}
        style={{ top: topBarHeight, WebkitBackdropFilter: 'blur(48px)' }}
      >
        <div className="header-container flex justify-between items-center w-full mx-auto px-6 md:px-10">

          {/* Dynamic Logo rendering */}
          <Link href="/" className="logo-link flex items-center no-underline">
            {logoType === 'image' ? (
              <img
                src={logoUrl}
                alt={logoText}
                width={logoWidth}
                height={logoHeight}
                className="logo-img w-auto object-contain block transition-transform duration-300 hover:scale-[1.03]"
                style={{ height: `${logoHeight}px` }}
              />
            ) : (
              <span className="font-heading font-extrabold text-[20px] sm:text-[24px] tracking-tight text-primary transition-colors hover:text-[#0f7c85]">
                {logoText}
              </span>
            )}
          </Link>

          {/* Desktop Dynamic Nav with Dropdown support */}
          <nav className="nav-desktop hidden md:flex items-center gap-4 md:gap-6 flex-1 justify-center">
            {displayLinks.map((item, idx) => {
              const hasChildren = Array.isArray(item.children) && item.children.length > 0;

              if (hasChildren) {
                return (
                  <div key={idx} className="relative group/dropdown py-2">
                    <button className="nav-item group text-sm md:text-[15px] font-medium text-secondary relative py-2 px-4 rounded-full transition-all duration-300 ease-out hover:text-[#0f7c85] flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none">
                      <span className="relative z-10">{item.label}</span>
                      <svg className="w-3 h-3 relative z-10 transition-transform duration-300 group-hover/dropdown:rotate-180" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    {/* Floating Dropdown Panel */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-48 opacity-0 pointer-events-none group-hover/dropdown:opacity-100 group-hover/dropdown:pointer-events-auto transition-all duration-300 ease-out z-[9999]">
                      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden p-1.5 flex flex-col gap-0.5">
                        {item.children.map((child, cIdx) => (
                          <Link
                            key={cIdx}
                            href={child.url}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-secondary hover:text-[#0f7c85] hover:bg-[#0f7c85]/05 no-underline transition-all block"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={idx}
                  href={item.url}
                  className="nav-item group text-sm md:text-[15px] font-medium text-secondary relative py-2 px-4 rounded-full transition-all duration-300 ease-out hover:text-[#0f7c85] overflow-hidden"
                >
                  <span className="relative z-10">{item.label}</span>
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent transition-all duration-300 ease-out group-hover:w-[60%] rounded-full"></span>
                </Link>
              );
            })}

            {/* Auth section */}
            {isAuthenticated ? (
              <>
                <Link href="/quizzes/dashboard" className="nav-item group text-sm md:text-[15px] font-medium text-secondary relative py-2 px-4 rounded-full transition-all duration-300 ease-out hover:text-[#0f7c85] overflow-hidden">
                  <span className="relative z-10">Dashboard</span>
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent transition-all duration-300 ease-out group-hover:w-[60%] rounded-full"></span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="nav-item group text-sm md:text-[15px] font-medium text-secondary relative py-2 px-4 rounded-full transition-all duration-300 ease-out hover:text-red-500 border-none bg-transparent cursor-pointer overflow-hidden"
                >
                  <span className="relative z-10">Logout</span>
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-red-500 transition-all duration-300 ease-out group-hover:w-[60%] rounded-full"></span>
                </button>
              </>
            ) : (
              <Link href="/login" className="nav-item group text-sm md:text-[15px] font-medium text-secondary relative py-2 px-4 rounded-full transition-all duration-300 ease-out hover:text-[#0f7c85] hover:bg-[#0f7c85]/10 overflow-hidden">
                <span className="relative z-10">Login</span>
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent transition-all duration-300 ease-out group-hover:w-[60%] rounded-full"></span>
              </Link>
            )}
          </nav>

          {/* Actions wrapper */}
          <div className="flex items-center gap-3.5 z-[10000]">
            <Search />

            {/* Configured CTA Button */}
            {ctaText && (
              <Link
                href={ctaLink}
                className="hidden sm:inline-flex items-center justify-center bg-[#0f7c85] hover:bg-[#0c6b73] text-white px-5 py-2.5 rounded-full font-bold text-xs no-underline transition-all duration-300 shadow-sm hover:shadow"
              >
                {ctaText}
              </Link>
            )}

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden relative w-12 h-12 rounded-full flex justify-center items-center cursor-pointer z-[10000] shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-500 border ${menuOpen
                ? 'bg-accent border-accent shadow-[0_6px_24px_rgba(15,124,133,0.15)]'
                : 'bg-white/90 border-[var(--color-border)]/80 hover:scale-105 hover:border-accent hover:shadow-[0_6px_24px_rgba(31,185,251,0.12)]'
                }`}
              aria-label="Toggle Menu"
            >
              <div className="w-5 h-3.5 relative">
                <span className={`w-[20px] h-[2px] rounded-sm transition-all duration-500 absolute left-0 ${menuOpen ? 'bg-white rotate-45 top-1/2 -translate-y-1/2' : 'bg-primary top-0'}`} />
                <span className={`w-[20px] h-[2px] rounded-sm transition-all duration-500 absolute left-0 top-1/2 -translate-y-1/2 ${menuOpen ? 'opacity-0 scale-x-0' : 'bg-primary'}`} />
                <span className={`w-[20px] h-[2px] rounded-sm transition-all duration-500 absolute left-0 ${menuOpen ? 'bg-white -rotate-45 top-1/2 -translate-y-1/2' : 'bg-primary bottom-0'}`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Universal Hamburger Menu Overlay */}
      <div
        className={`fixed inset-0 w-full h-[100dvh] bg-white/98 backdrop-blur-3xl z-[8999] flex flex-col justify-center transition-all duration-500 ${menuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
          }`}
      >
        <div className={`hb-menu-container w-full h-full max-h-[100dvh] overflow-y-auto py-24 px-6 sm:px-10 md:px-20 flex flex-col justify-center transition-transform duration-700 ${menuOpen ? 'translate-y-0' : 'translate-y-10'}`}>
          <nav className="hb-nav-links flex flex-col items-end pr-0 md:pr-16 lg:pr-32 w-full my-auto">
            <div className="flex flex-col items-end text-right gap-2 sm:gap-4 w-full">
              {displayMobileLinks.map((item, idx) => {
                if (item.isLogout) {
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      style={{ transitionDelay: `${idx * 0.04}s` }}
                      className={`hb-nav-item font-heading font-extrabold text-[28px] sm:text-[40px] md:text-[56px] lg:text-[64px] text-red-500 hover:text-red-600 no-underline leading-[1.1] tracking-[-1.5px] block w-full text-right hover:-translate-x-3 hover:scale-[1.02] hover:bg-red-500/10 px-6 py-3 rounded-2xl transition-all duration-500 border-none bg-transparent cursor-pointer ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                        }`}
                    >
                      Logout
                    </button>
                  );
                }

                const hasChildren = Array.isArray(item.children) && item.children.length > 0;

                return (
                  <div key={idx} className="w-full text-right" style={{ transitionDelay: `${idx * 0.04}s` }}>
                    <Link
                      href={item.url}
                      onClick={() => !hasChildren && setMenuOpen(false)}
                      className={`hb-nav-item font-heading font-extrabold text-[28px] sm:text-[40px] md:text-[56px] lg:text-[64px] text-primary no-underline leading-[1.1] tracking-[-1.5px] block w-full hover:text-accent hover:-translate-x-3 hover:scale-[1.02] hover:bg-accent/10 px-6 py-3 rounded-2xl transition-all duration-500 ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                        }`}
                    >
                      {item.label}
                    </Link>
                    {hasChildren && (
                      <div className="flex flex-col items-end gap-1.5 mt-2 pr-6 border-r border-slate-200">
                        {item.children.map((child, cIdx) => (
                          <Link
                            key={cIdx}
                            href={child.url}
                            onClick={() => setMenuOpen(false)}
                            className="text-secondary hover:text-[#0f7c85] font-semibold text-lg no-underline py-1 px-3 rounded-xl hover:bg-[#0f7c85]/05 transition"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
