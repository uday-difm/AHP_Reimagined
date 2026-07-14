'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { ChevronDown, BookOpen, PenTool, Target, PlayCircle, Activity, Heart, Brain, Calendar, Mail, FileText, Info, HelpCircle, ArrowRight, Users } from 'lucide-react';
import Search from '@/components/Search';
import Marquee from '@/components/Marquee';
import { quizzes } from '@/data/quizzes';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [dynamicBlogs, setDynamicBlogs] = useState([]);
  const [dynamicPublications, setDynamicPublications] = useState([]);

  useEffect(() => {
    // Fetch recent blogs
    fetch('/api/posts?limit=4')
      .then(res => res.json())
      .then(data => {
        if (data.posts) setDynamicBlogs(data.posts);
      })
      .catch(err => console.error("Error fetching blogs for header:", err));

    // Fetch recent publications
    fetch('/api/magazine?limit=4')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDynamicPublications(data);
      })
      .catch(err => console.error("Error fetching publications for header:", err));
  }, []);



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

  return (
    <>
      <Marquee />
      {/* Header */}
      <header className="fixed top-[40px] left-0 w-full flex items-center h-20 bg-white/30 backdrop-blur-lg z-[9000]" style={{ WebkitBackdropFilter: 'blur(48px)' }}>
        <div className="header-container flex justify-between items-center w-full  mx-auto px-6 md:px-10">
          <a href="/" className="logo-link flex items-center">
            <Image
              src="/images/Logo-web.png"
              alt="A Health Place Logo"
              width={360}
              height={100}
              className="logo-img h-10 sm:h-12 md:h-16 w-auto object-contain block transition-transform duration-300 hover:scale-[1.03]"
              priority
            />
          </a>

          {/* Desktop Nav - Mega Menu */}
          <nav className="nav-desktop hidden lg:flex items-center gap-2 xl:gap-4 flex-1 justify-center relative">
            <Link href="/" className="text-[15px] font-semibold text-secondary hover:text-[#0F766E] py-2 px-3 transition-colors">
              Home
            </Link>

            {/* Resources Dropdown */}
            <div className="relative group px-2 xl:px-3 py-6 -my-6">
              <button className="flex items-center gap-1 text-[15px] font-semibold text-secondary hover:text-[#0F766E] group-hover:text-[#0F766E] py-2 px-3 transition-colors">
                Resources <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
              </button>
              
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                <div className="bg-white rounded-2xl border border-[#E6EEF0] p-8 w-[850px] shadow-[0_12px_35px_rgba(0,0,0,.08)] flex gap-8">
                  {/* Featured Publication */}
                  <div className="w-[30%] bg-slate-50/50 rounded-xl p-4 border border-[#E6EEF0]/80 flex flex-col">
                    <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider mb-3">Latest Publication</span>
                    <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden mb-4 shadow-sm border border-slate-100">
                      <Image src="/images/mag_nutrition.png" alt="Holistic Living" fill className="object-cover" />
                    </div>
                    <h4 className="font-bold text-[#0F766E] text-lg mb-1 leading-tight">Holistic Living</h4>
                    <p className="text-xs text-[#374151] mb-5 leading-relaxed">Summer 2026 Edition.<br/>Your guide to nutrition, mind, body and soul.</p>
                    <Link href="/publication" className="mt-auto inline-block bg-[#0F766E] hover:bg-[#0a524c] text-white text-center py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm">
                      Read Now &rarr;
                    </Link>
                  </div>

                  {/* Links Grid */}
                  <div className="w-[70%] grid grid-cols-3 gap-6">
                    {/* Publications */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-5 h-5 text-[#0F766E]" />
                        <h4 className="font-bold text-[#0F766E] text-base">Publications</h4>
                      </div>
                      <ul className="space-y-3 mb-4 flex-1">
                        {dynamicPublications.length > 0 ? (
                          dynamicPublications.slice(0, 4).map((pub) => (
                            <li key={pub.id || pub.slug}>
                              <Link href={`/magazine/${pub.slug}`} className="text-sm text-[#374151] hover:text-[#0F766E] hover:font-medium transition-colors block line-clamp-1" title={pub.title}>
                                {pub.title}
                              </Link>
                            </li>
                          ))
                        ) : (
                          <>
                            <li><Link href="/magazine/the-sleep-revolution" className="text-sm text-[#374151] hover:text-[#0F766E] hover:font-medium transition-colors block">The Sleep Revolution</Link></li>
                            <li><Link href="/magazine/holistic-nutrition" className="text-sm text-[#374151] hover:text-[#0F766E] hover:font-medium transition-colors block">Holistic Nutrition</Link></li>
                            <li><Link href="/magazine/the-strength-within" className="text-sm text-[#374151] hover:text-[#0F766E] hover:font-medium transition-colors block">The Strength Within</Link></li>
                            <li><Link href="/magazine/digital-detox" className="text-sm text-[#374151] hover:text-[#0F766E] hover:font-medium transition-colors block">Digital Detox</Link></li>
                          </>
                        )}
                      </ul>
                      <Link href="/publication" className="inline-block mt-auto text-[13px] font-bold text-[#0F766E] hover:text-[#0a524c]">View all Publications &rarr;</Link>
                    </div>
                    {/* Blogs */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <PenTool className="w-5 h-5 text-[#0F766E]" />
                        <h4 className="font-bold text-[#0F766E] text-base">Blogs</h4>
                      </div>
                      <ul className="space-y-3 mb-4 flex-1">
                        {dynamicBlogs.length > 0 ? (
                          dynamicBlogs.slice(0, 4).map((blog) => (
                            <li key={blog.id || blog.slug}>
                              <Link href={`/blogs/${blog.slug}`} className="text-sm text-[#374151] hover:text-[#0F766E] hover:font-medium transition-colors block line-clamp-1" title={blog.title}>
                                {blog.title}
                              </Link>
                            </li>
                          ))
                        ) : (
                          <>
                            <li><Link href="/blogs/ayurvedic-secrets-for-better-digestion" className="text-sm text-[#374151] hover:text-[#0F766E] hover:font-medium transition-colors block line-clamp-1">Ayurvedic Secrets for Better Digestion</Link></li>
                            <li><Link href="/blogs/breathwork-vs-meditation-for-anxiety" className="text-sm text-[#374151] hover:text-[#0F766E] hover:font-medium transition-colors block line-clamp-1">Breathwork vs. Meditation for Anxiety</Link></li>
                            <li><Link href="/blogs/how-inactivity-impacts-physical-health" className="text-sm text-[#374151] hover:text-[#0F766E] hover:font-medium transition-colors block line-clamp-1">How Inactivity Impacts Physical Health</Link></li>
                            <li><Link href="/blogs/exercise-for-better-mental-health" className="text-sm text-[#374151] hover:text-[#0F766E] hover:font-medium transition-colors block line-clamp-1">Exercise for Better Mental Health</Link></li>
                          </>
                        )}
                      </ul>
                      <Link href="/blogs" className="inline-block mt-auto text-[13px] font-bold text-[#0F766E] hover:text-[#0a524c]">View all Blogs &rarr;</Link>
                    </div>
                    {/* Quizzes */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-5 h-5 text-[#0F766E]" />
                        <h4 className="font-bold text-[#0F766E] text-base">Quizzes</h4>
                      </div>
                      <ul className="space-y-3 mb-4 flex-1">
                        {quizzes && quizzes.length > 0 ? (
                          quizzes.slice(0, 4).map((quiz) => (
                            <li key={quiz.slug}>
                              <Link href={`/quizzes/${quiz.slug}`} className="text-sm text-[#374151] hover:text-[#0F766E] hover:font-medium transition-colors block line-clamp-1" title={quiz.title}>
                                {quiz.title}
                              </Link>
                            </li>
                          ))
                        ) : (
                          <li><Link href="/quizzes" className="text-sm text-[#374151] hover:text-[#0F766E] hover:font-medium transition-colors block line-clamp-1">General Wellness</Link></li>
                        )}
                      </ul>
                      <Link href="/quizzes" className="inline-block mt-auto text-[13px] font-bold text-[#0F766E] hover:text-[#0a524c]">View all Quizzes &rarr;</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Services - No dropdown since subpages don't exist */}
            <Link href="/services" className="text-[15px] font-semibold text-secondary hover:text-[#0F766E] py-2 px-3 transition-colors">
              Services
            </Link>



            {/* About Dropdown */}
            <div className="relative group px-2 xl:px-3 py-6 -my-6">
              <button className="flex items-center gap-1 text-[15px] font-semibold text-secondary hover:text-[#0F766E] group-hover:text-[#0F766E] py-2 px-3 transition-colors">
                About <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                <div className="bg-white rounded-2xl border border-[#E6EEF0] p-4 w-[240px] shadow-[0_12px_35px_rgba(0,0,0,.08)]">
                  <ul className="space-y-1">
                    <li><Link href="/about" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#374151] hover:text-[#0F766E] hover:bg-[#ECFEFF] transition-colors"><Info className="w-4 h-4 text-[#0F766E]" /> About Us</Link></li>
                    <li><Link href="/contact" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#374151] hover:text-[#0F766E] hover:bg-[#ECFEFF] transition-colors"><FileText className="w-4 h-4 text-[#0F766E]" /> Contact</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>


          {/* Actions wrapper */}
          <div className="flex items-center gap-2 lg:gap-3 z-[10000]">
            <Search />
            
            <div className="hidden lg:flex items-center">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link href="/quizzes/dashboard" className="bg-[#0F766E] hover:bg-[#0d655e] text-white px-5 py-2.5 rounded-full text-[13px] font-semibold transition-colors shadow-sm">
                    Dashboard
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="text-[13px] font-semibold text-red-500 hover:text-red-600 transition-colors py-2.5 px-2">
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login" className="bg-[#0F766E] hover:bg-[#0d655e] text-white px-6 py-2.5 rounded-full text-[13px] font-semibold transition-colors shadow-sm">
                  Login
                </Link>
              )}
            </div>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`lg:hidden relative w-12 h-12 rounded-full flex justify-center items-center cursor-pointer z-[10000] shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-500 border ${menuOpen ? 'bg-accent border-accent shadow-[0_6px_24px_rgba(15,124,133,0.15)]' : 'bg-white/90 border-[var(--color-border)]/80 hover:scale-105 hover:border-accent hover:shadow-[0_6px_24px_rgba(31,185,251,0.12)]'
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

          {/* 
          <div className={`hb-meta-panel hidden md:flex flex-col gap-10 border-r border-primary/10 pr-12 transition-all duration-500 delay-300 ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}>
            <div className="hb-quote-section flex items-start justify-start py-6 px-6 md:px-8 max-w-[650px]">
              <div className="hb-quote-container font-['Optima',_'Candara',_'Noto_Sans',_sans-serif] text-[#1a1a1a] py-6 leading-[1.1] uppercase">
                <h1 className="hb-main-text text-4xl md:text-5xl lg:text-6xl tracking-[2px] font-normal m-0 leading-[1.1]">
                  "Small Changes Big Impact"
                </h1>
                <p className="hb-sub-text text-2xl md:text-2xl lg:text-3xl tracking-[1px] mt-2 md:mt-3 font-normal pl-1 leading-[1.1] text-secondary">
                  Start today—your future self will thank you.
                </p>
              </div>
            </div>
          </div> 
          */}
          <nav className="hb-nav-links flex flex-col items-end pr-0 md:pr-16 lg:pr-32 w-full my-auto">
            <div className="flex flex-col items-start text-left gap-2 sm:gap-4 w-fit px-6 md:px-0">
              {['Home', 'About', 'Publication', 'Blogs', 'Quizzes', 'Contact Us', ...(isAuthenticated ? ['Dashboard', 'Logout'] : ['Login'])].map((label, i) => {
                const isPublication = label === 'Publication';
                const isBlogs = label === 'Blogs';
                const isHome = label === 'Home';
                const isAbout = label === 'About';
                const isQuizzes = label === 'Quizzes';
                const isContact = label === 'Contact Us';
                const isDashboard = label === 'Dashboard';
                const isLogin = label === 'Login';
                const isLogout = label === 'Logout';

                const href = isHome
                  ? '/'
                  : isAbout
                    ? '/about'
                    : isContact
                      ? '/contact'
                      : isPublication
                        ? '/publication'
                        : isBlogs
                          ? '/blogs'
                          : isQuizzes
                            ? '/quizzes'
                            : isDashboard
                              ? '/quizzes/dashboard'
                              : isLogin
                                ? '/login'
                                : '#';

                if (isLogout) {
                  return (
                    <button
                      key={i}
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                      style={{ transitionDelay: `${i * 0.05}s` }}
                      className={`hb-nav-item font-heading font-extrabold text-2xl sm:text-4xl md:text-6xl lg:text-6xl text-red-500 hover:text-red-600 no-underline leading-[1.1] tracking-[-1.5px] block w-full text-left hover:-translate-x-3 hover:scale-[1.02] hover:bg-red-500/10 px-4 md:px-6 py-3 rounded-2xl transition-all duration-500 border-none bg-transparent cursor-pointer ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}
                    >
                      Logout
                    </button>
                  );
                }

                return (
                  <a
                    key={i}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    style={{ transitionDelay: `${i * 0.05}s` }}
                    className={`hb-nav-item font-heading font-extrabold text-2xl sm:text-4xl md:text-6xl lg:text-6xl text-primary no-underline leading-[1.1] tracking-[-1.5px] block w-full text-left hover:text-accent hover:-translate-x-3 hover:scale-[1.02] hover:bg-accent/10 px-4 md:px-6 py-3 rounded-2xl transition-all duration-500 ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}
                  >
                    {label}
                  </a>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
