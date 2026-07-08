'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const stats = [
  { value: '145k+', label: 'Active Readers' },
  { value: 'Medically', label: 'Reviewed Content' },
  { value: 'Awarded', label: 'Wellness Poll 2023' },
];

const trustBadges = [
  { icon: '🏛', label: 'NATIONAL HEALTH COUNCIL' },
  { icon: '🏆', label: 'WEBBY NOMINEE 2024' },
  { icon: '🔒', label: 'PRIVACY FIRST CONTENT' },
  { icon: '📖', label: 'AD-FREE READING' },
];

const recentIssues = [
  { season: 'WINTER 2023', title: 'The Sleep Revolution', img: '/images/mag_sleep.png' },
  { season: 'FALL 2023',   title: 'Holistic Nutrition',   img: '/images/mag_nutrition.png' },
  { season: 'SUMMER 2023', title: 'The Strength Within',  img: '/images/mag_strength.png' },
  { season: 'SPRING 2023', title: 'Digital Detox',        img: '/images/mag_detox.png' },
];

function CookieConsent() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] bg-[#4cc4c4] py-4.5 px-6 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      <div className="container flex flex-wrap items-center gap-4 justify-between">
        <p className="text-white text-[13.5px] font-medium flex-1 min-w-[280px]">
          We use cookies to improve your digital reading experience. By continuing, you agree to our cookie policy.
        </p>
        <div className="flex items-center gap-3">
          <button onClick={() => setVisible(false)} className="bg-[#a3cb43] text-white font-bold text-xs px-5 py-2.5 rounded-full hover:bg-[#8db535] transition-colors cursor-pointer">Ok</button>
          <button onClick={() => setVisible(false)} className="bg-[#a3cb43]/20 border border-[#a3cb43]/40 text-white font-bold text-xs px-5 py-2.5 rounded-full hover:bg-[#a3cb43]/30 transition-colors cursor-pointer">Privacy Policy</button>
          <button onClick={() => setVisible(false)} className="text-white font-bold text-base leading-none pl-2 hover:opacity-75 transition-opacity cursor-pointer">✕</button>
        </div>
      </div>
    </div>
  );
}

export default function PublicationPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Refs for 3D card tilt
  const cardRefs = useRef([]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  // Scroll reveal observer triggers
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal-text, .reveal-slide, .reveal-scale, .reveal-fade');
    const revealCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          observer.unobserve(entry.target);
        }
      });
    };
    const observer = new IntersectionObserver(revealCallback, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    });
    revealElements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // 3D Card Tilt Mousemove Handlers
  const handleCardMouseMove = (e, index) => {
    const card = cardRefs.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    const px = (x / width) - 0.5;
    const py = (y / height) - 0.5;

    const maxTilt = 12;
    const tiltX = -py * maxTilt;
    const tiltY = px * maxTilt;

    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
  };

  const handleCardMouseLeave = (index) => {
    const card = cardRefs.current[index];
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
  };

  return (
    <div className="min-h-screen bg-bg-light relative pb-10">
      <Header />

      {/* Hero — Current Issue */}
      <section className="bg-[#f0f6f3]/60 pt-[140px] pb-20 rounded-b-[40px] border-b border-slate-200/20 relative">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center gap-14">

            {/* Left — 3D Magazine Cover */}
            <div className="flex-shrink-0 reveal-scale">
              <Link href="/article/the-mindfulness-issue" className="relative w-[220px] md:w-[260px] group cursor-pointer block">
                <div className="absolute inset-0 translate-x-3.5 translate-y-3.5 bg-black/10 rounded-2xl blur-md transition-transform duration-500 group-hover:translate-x-5 group-hover:translate-y-5" />
                <div className="absolute inset-0 translate-x-2 translate-y-1.5 bg-accent/15 rounded-2xl transition-transform duration-500 group-hover:scale-105" />
                <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_48px_rgba(0,0,0,0.06)] border border-white/60 transition-transform duration-500 group-hover:scale-[1.03] group-hover:-translate-y-2">
                  <Image
                    src="/images/mag_mindfulness.png"
                    alt="The Mindfulness Issue – Spring 2024"
                    width={260}
                    height={340}
                    className="w-full object-cover"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Right — Info */}
            <div className="flex-1 max-w-xl reveal-slide">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse-slow" />
                <span className="text-accent-green text-[11px] font-bold uppercase tracking-[2px]">Current Issue • Spring 2024</span>
              </div>

              <h1 className="text-primary font-heading font-extrabold text-4xl md:text-5xl leading-tight mb-4 tracking-[-1.5px]">
                The Mindfulness<br />Issue
              </h1>

              <p className="text-secondary text-[15px] md:text-base leading-relaxed mb-8 max-w-md">
                Explore the intersection of ancient wisdom and modern neuroscience. Our latest issue dives deep into meditative practices, cognitive health, and the art of intentional living.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/article/the-mindfulness-issue" className="btn-primary hover-glow bg-primary text-white px-7 py-3.5 rounded-full font-bold text-[13.5px] border border-primary hover:bg-transparent hover:text-primary transition-all duration-500 hover:-translate-y-0.5 shadow-md cursor-pointer flex items-center justify-center no-underline">
                  Read Digital Issue
                </Link>
                <a href="#recent-issues" className="border-2 border-primary/20 text-primary hover:border-primary font-bold text-[13.5px] px-7 py-3.5 rounded-full hover:bg-primary hover:text-white transition-all duration-500 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center no-underline">
                  Browse Archive
                </a>
              </div>

              <div className="flex flex-wrap gap-10 pt-8 border-t border-slate-200">
                {stats.map((s, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-primary font-heading font-extrabold text-lg leading-tight">{s.value}</span>
                    <span className="text-muted text-[11px] font-semibold uppercase tracking-wider mt-1">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Badges Bar */}
      <div className="bg-white border-y border-slate-200/50 shadow-[0_2px_12px_rgba(0,0,0,0.01)] py-5 relative">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {trustBadges.map((b, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-lg">{b.icon}</span>
                <span className="text-[#2a5a52] text-[11px] font-bold uppercase tracking-wider">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Issues Gallery */}
      <section id="recent-issues" className="py-20 bg-white rounded-t-[40px] shadow-[0_-20px_40px_rgba(0,0,0,0.01)] relative">
        <div className="container">
          <div className="flex items-start justify-between mb-10 reveal-slide">
            <div>
              <span className="section-tag text-[11px] font-bold tracking-[2px] text-accent uppercase mb-2 block">BACK JOURNAL</span>
              <h2 className="text-primary font-heading font-extrabold text-2xl md:text-3xl tracking-[-0.5px]">Recent Issues</h2>
              <p className="text-muted text-[13.5px] mt-1.5">Journey through our curated collection of wellness wisdom.</p>
            </div>
            <button className="flex items-center gap-1 text-accent text-sm font-bold hover:underline mt-1 cursor-pointer">
              All Years <span className="arrow">→</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {recentIssues.map((issue, i) => {
              const slug = issue.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              return (
                <Link
                  key={i}
                  href={`/article/${slug}`}
                  ref={el => cardRefs.current[i] = el}
                  onMouseMove={(e) => handleCardMouseMove(e, i)}
                  onMouseLeave={() => handleCardMouseLeave(i)}
                  style={{ transitionDelay: `${i * 0.1}s` }}
                  className="project-card tilt-card bg-bg-light rounded-[20px] overflow-hidden border border-slate-200 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer flex flex-col h-full [transform-style:preserve-3d] [perspective:1000px] hover:border-accent/30 hover:shadow-[0_16px_40px_rgba(31,185,251,0.05)] reveal-slide p-4 no-underline animate-hover"
                >
                  <div className="relative rounded-xl overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.03)] border border-slate-100 transition-all duration-500 mb-4 [transform:translateZ(20px)]">
                    <Image
                      src={issue.img}
                      alt={issue.title}
                      width={220}
                      height={290}
                      className="w-full object-cover"
                    />
                  </div>
                  <div className="[transform:translateZ(10px)] flex flex-col gap-1.5 flex-grow">
                    <p className="text-accent text-[10px] font-bold uppercase tracking-wider">{issue.season}</p>
                    <p className="text-primary font-heading font-semibold text-sm leading-snug group-hover:text-accent transition-colors">{issue.title}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Terracotta Subscribe CTA */}
      <section className="container my-14 reveal-scale">
        <div className="bg-[#e28c6f]/92 rounded-[40px] py-14 px-8 md:px-16 shadow-[0_20px_48px_rgba(226,140,111,0.15)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#df7f60]/20 to-transparent pointer-events-none" />
          <div className="flex flex-col md:flex-row items-center gap-14 relative z-10">
            <div className="flex-1 max-w-lg text-left">
              <h2 className="text-primary font-heading font-extrabold text-3xl md:text-4xl leading-tight mb-4 tracking-[-1px]">
                Never miss a moment<br />of wellness.
              </h2>
              <p className="text-[#3a2520]/80 text-[14.5px] leading-relaxed mb-8 max-w-[480px]">
                Subscribe to our digital edition for just $15/year. Get exclusive interviews, medically-vetted health guides, and a sanctuary of inspiration delivered to your inbox every quarter.
              </p>

              {subscribed ? (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 text-[#1a1a2e] font-bold text-sm shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
                  ✅ You&apos;re subscribed! Welcome to the A Health Place community.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-[500px]">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="Your email address"
                    className="flex-grow rounded-full px-6 py-3.5 text-sm text-[#1a1a2e] outline-none focus:ring-2 focus:ring-white/50 bg-white/90 placeholder:text-[#9a8680]"
                  />
                  <button type="submit" className="bg-primary text-white font-bold text-sm px-7 py-3.5 rounded-full hover:bg-primary/90 transition-colors shadow-md cursor-pointer whitespace-nowrap">
                    Subscribe Now
                  </button>
                </form>
              )}
              <p className="text-[#3a2520]/60 text-[11px] mt-4">
                By subscribing, you agree to our{' '}
                <Link href="#" className="underline hover:text-primary">Privacy Policy</Link>.
                You can unsubscribe at any time.
              </p>
            </div>

            {/* Mobile/Tablet Mockup (Floating animation applied to the wrapper container) */}
            <div className="flex-shrink-0 relative w-[220px] md:w-[260px] hidden md:block select-none animate-float-phone">
              <div className="absolute -top-4 -right-4 w-40 h-52 bg-[#f4ded7]/60 rounded-[32px] rotate-6 opacity-60" />
              <div className="relative z-10 rounded-[32px] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.12)] border-[5px] border-white/50">
                <Image src="/images/mag_phone.png" alt="A Health Place magazine app" width={260} height={480} className="w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Science-Backed Verification Block */}
      <section className="bg-white py-20 rounded-[40px] shadow-[0_20px_48px_rgba(0,0,0,0.01)] relative">
        <div className="container max-w-[640px] text-center reveal-slide">
          <div className="w-14 h-14 bg-[#e4eeea] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-primary font-heading font-extrabold text-2xl md:text-3xl mb-4 tracking-[-0.5px]">
            Science-Backed. Reader-Loved.
          </h2>
          <p className="text-secondary text-[14px] md:text-[15px] leading-relaxed mb-6">
            Every article in &quot;A Health Place&quot; digital magazine undergoes a rigorous verification process by our board-certified Medical Review Committee to ensure you receive the most accurate, up-to-date health information.
          </p>
          <Link href="#" className="inline-flex items-center gap-1.5 text-accent-green text-sm font-bold hover:underline">
            Meet our Medical Review Board <span className="arrow">→</span>
          </Link>
        </div>
      </section>

      <Footer />
      <CookieConsent />
    </div>
  );
}
