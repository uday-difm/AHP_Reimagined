'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Search from '@/components/Search';
import Marquee from '@/components/Marquee';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';



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

          {/* Desktop Nav */}
          <nav className="nav-desktop hidden md:flex items-center gap-4 md:gap-8 flex-1 justify-center">
            <Link href="/" className="nav-item group text-sm md:text-[15px] font-medium text-secondary relative py-2 px-4 rounded-full transition-all duration-300 ease-out hover:text-primary overflow-hidden">
              <span className="relative z-10">Home</span>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent transition-all duration-300 ease-out group-hover:w-[60%] rounded-full"></span>
            </Link>
            <Link href="/about" className="nav-item group text-sm md:text-[15px] font-medium text-secondary relative py-2 px-4 rounded-full transition-all duration-300 ease-out hover:text-[#0f7c85] overflow-hidden">
              <span className="relative z-10">About</span>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent transition-all duration-300 ease-out group-hover:w-[60%] rounded-full"></span>
            </Link>
            <Link href="/publication" className="nav-item group text-sm md:text-[15px] font-medium text-secondary relative py-2 px-4 rounded-full transition-all duration-300 ease-out hover:text-[#0f7c85] overflow-hidden">
              <span className="relative z-10">Publication</span>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent transition-all duration-300 ease-out group-hover:w-[60%] rounded-full"></span>
            </Link>
            <Link href="/blogs" className="nav-item group text-sm md:text-[15px] font-medium text-secondary relative py-2 px-4 rounded-full transition-all duration-300 ease-out hover:text-[#0f7c85] overflow-hidden">
              <span className="relative z-10">Blogs</span>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent transition-all duration-300 ease-out group-hover:w-[60%] rounded-full"></span>
            </Link>
            <Link href="/quizzes" className="nav-item group text-sm md:text-[15px] font-medium text-secondary relative py-2 px-4 rounded-full transition-all duration-300 ease-out hover:text-[#0f7c85] overflow-hidden">
              <span className="relative z-10">Quizzes</span>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent transition-all duration-300 ease-out group-hover:w-[60%] rounded-full"></span>
            </Link>
            <Link href="/contact" className="nav-item group text-sm md:text-[15px] font-medium text-secondary relative py-2 px-4 rounded-full transition-all duration-300 ease-out hover:text-[#0f7c85] overflow-hidden">
              <span className="relative z-10">Contact Us</span>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent transition-all duration-300 ease-out group-hover:w-[60%] rounded-full"></span>
            </Link>
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
              <a href="/login" className="nav-item group text-sm md:text-[15px] font-medium text-secondary relative py-2 px-4 rounded-full transition-all duration-300 ease-out hover:text-[#0f7c85] hover:bg-[#0f7c85]/10 overflow-hidden">
                <span className="relative z-10">Login</span>
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent transition-all duration-300 ease-out group-hover:w-[60%] rounded-full"></span>
              </a>
            )}
          </nav>

          {/* Actions wrapper */}
          <div className="flex items-center gap-3 z-[10000]">
            <Search />

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden relative w-12 h-12 rounded-full flex justify-center items-center cursor-pointer z-[10000] shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-500 border ${menuOpen ? 'bg-accent border-accent shadow-[0_6px_24px_rgba(15,124,133,0.15)]' : 'bg-white/90 border-[var(--color-border)]/80 hover:scale-105 hover:border-accent hover:shadow-[0_6px_24px_rgba(31,185,251,0.12)]'
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
                <h1 className="hb-main-text text-[40px] md:text-[52px] lg:text-[64px] tracking-[2px] font-normal m-0 leading-[1.1]">
                  "Small Changes Big Impact"
                </h1>
                <p className="hb-sub-text text-[24px] md:text-[28px] lg:text-[32px] tracking-[1px] mt-2 md:mt-3 font-normal pl-1 leading-[1.1] text-secondary">
                  Start today—your future self will thank you.
                </p>
              </div>
            </div>
          </div> 
          */}
          <nav className="hb-nav-links flex flex-col items-end pr-0 md:pr-16 lg:pr-32 w-full my-auto">
            <div className="flex flex-col items-end text-right gap-2 sm:gap-4 w-full">
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
                      className={`hb-nav-item font-heading font-extrabold text-[28px] sm:text-[40px] md:text-[56px] lg:text-[64px] text-red-500 hover:text-red-600 no-underline leading-[1.1] tracking-[-1.5px] block w-full text-right hover:-translate-x-3 hover:scale-[1.02] hover:bg-red-500/10 px-6 py-3 rounded-2xl transition-all duration-500 border-none bg-transparent cursor-pointer ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}
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
                    className={`hb-nav-item font-heading font-extrabold text-[28px] sm:text-[40px] md:text-[56px] lg:text-[64px] text-primary no-underline leading-[1.1] tracking-[-1.5px] block w-full text-right hover:text-accent hover:-translate-x-3 hover:scale-[1.02] hover:bg-accent/10 px-6 py-3 rounded-2xl transition-all duration-500 ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}
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
