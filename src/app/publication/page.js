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
  {
    season: 'WINTER 2023',
    title: 'The Sleep Revolution',
    slug: 'the-sleep-revolution',
    img: '/images/mag_sleep.png',
    contents: ['Glymphatic Clearance', 'Sleep Cycle Science', 'Behavioral Routines', 'Circadian Alignments']
  },
  {
    season: 'FALL 2023',
    title: 'Holistic Nutrition',
    slug: 'holistic-nutrition',
    img: '/images/mag_nutrition.png',
    contents: ['Gut Microbiome Health', 'Prebiotics & Fibers', 'Mindful Eating Keys', 'Caloric Realignment']
  },
  {
    season: 'SUMMER 2023',
    title: 'The Strength Within',
    slug: 'the-strength-within',
    img: '/images/mag_strength.png',
    contents: ['Muscular Longevity', 'Postural Alignments', 'Core Stabilization', 'Mobility & Energy']
  },
  {
    season: 'SPRING 2023',
    title: 'Digital Detox',
    slug: 'digital-detox',
    img: '/images/mag_detox.png',
    contents: ['Screen Exhaustion', 'Prefrontal Decompress', 'App Boundaries', 'Attention Currencies']
  },
  {
    season: 'WINTER 2022',
    title: 'Mindful Eating Keys',
    slug: 'mindful-eating-keys',
    img: '/images/holistic.png',
    contents: ['Portion Consciousness', 'Satiety Bio-feedback', 'Mindful Chewing Patterns', 'Sensory Flavor Profiles']
  },
  {
    season: 'FALL 2022',
    title: 'Somatic Healing Guides',
    slug: 'somatic-healing-guides',
    img: '/images/ayurveda.png',
    contents: ['Vagus Nerve Toning', 'Trauma Release Exercises', 'Sensory Grounding Keys', 'Body Scan Meditations']
  },
  {
    season: 'SUMMER 2022',
    title: 'Active Longevity Systems',
    slug: 'active-longevity-systems',
    img: '/images/physical_health.png',
    contents: ['Cardiorespiratory Reserves', 'Joint Mobility Drills', 'Muscle Density Focus', 'Longevity Biomarkers']
  },
  {
    season: 'SPRING 2022',
    title: 'Circadian Sleep Hygiene',
    slug: 'circadian-sleep-hygiene',
    img: '/images/hero_sleep.png',
    contents: ['Morning Light Anchoring', 'Melatonin Blockers', 'Temperature Control', 'Adenosine Dynamics']
  },
  {
    season: 'WINTER 2021',
    title: 'Heart Health Protocols',
    slug: 'heart-health-protocols',
    img: '/images/disease.png',
    contents: ['HRV Optimization', 'Endothelial Integrity', 'Inflammatory Biomarkers', 'Cardio-protective Fats']
  },
  {
    season: 'FALL 2021',
    title: 'Mental Clarity Routines',
    slug: 'mental-clarity-routines',
    img: '/images/hero_exercise.png',
    contents: ['BDNF Stimulation', 'Deep Work Frameworks', 'Nootropic Whole Foods', 'Neuroplastic Habits']
  },
  {
    season: 'SUMMER 2021',
    title: 'Immune Resilience Keys',
    slug: 'immune-resilience-keys',
    img: '/images/hero_hospice.png',
    contents: ['Lymphatic Flow Optimization', 'Micronutrient Synergies', 'Cold & Heat Stressors', 'Gut-Immune Axis']
  },
  {
    season: 'SPRING 2021',
    title: 'AI & Future Healthcare',
    slug: 'ai-and-future-healthcare',
    img: '/images/hero_ai_healthcare.png',
    contents: ['Predictive Diagnostics', 'Personalized Bio-data', 'Wearable Integrations', 'AI Longevity Coding']
  }
];
export default function PublicationPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Refs for 3D card tilt
  const cardRefs = useRef([]);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(recentIssues.length / itemsPerPage);
  const displayedIssues = recentIssues.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const section = document.getElementById('recent-issues');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
  }, [currentPage]);

  // Ref & State for Terracotta CTA cursor tracking
  const subscribeCardRef = useRef(null);
  const [phoneTransform, setPhoneTransform] = useState({});

  const handleSubscribeMouseMove = (e) => {
    const card = subscribeCardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    const px = (x / width) - 0.5;
    const py = (y / height) - 0.5;

    setPhoneTransform({
      transform: `perspective(1000px) rotateX(${py * -22}deg) rotateY(${px * 22}deg) translate3d(${px * 30}px, ${py * 30}px, 0px) scale(1.06)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleSubscribeMouseLeave = () => {
    setPhoneTransform({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0) scale(1)',
      transition: 'transform 0.8s ease-in-out'
    });
  };

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
    <div className="min-h-screen bg-bg-light relative">
      <Header />

      {/* Hero — Current Issue */}
      <section className="bg-[#f0f6f3]/60 pt-[140px] pb-20 rounded-b-[40px] border-b border-slate-200/20 relative">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center gap-14">

            {/* Left — 3D Magazine Cover (Flipping on Hover) */}
            <div className="flex-shrink-0 reveal-scale [perspective:1000px] w-[220px] md:w-[260px] h-[290px] md:h-[340px] relative group cursor-pointer">

              {/* Shadow and Background glows that shift slightly */}
              <div className="absolute inset-0 translate-x-3.5 translate-y-3.5 bg-black/10 rounded-2xl blur-md transition-transform duration-500 group-hover:translate-x-5 group-hover:translate-y-5" />
              <div className="absolute inset-0 translate-x-2 translate-y-1.5 bg-accent/15 rounded-2xl transition-transform duration-500 group-hover:scale-105" />

              {/* The Flipping Card */}
              <div className="w-full h-full relative transition-transform duration-[800ms] [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">

                {/* Front Face (Cover Image) */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-2xl overflow-hidden shadow-2xl border border-white/60">
                  <Image
                    src="/images/mag_mindfulness.png"
                    alt="The Mindfulness Issue – Spring 2024"
                    fill
                    sizes="(max-width: 768px) 220px, 260px"
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Back Face (Table of Contents / Editorial summary) */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#1e4a45] rounded-2xl p-6 text-white flex flex-col justify-between shadow-2xl border border-white/20 select-none">
                  <div className="flex flex-col gap-4 text-left">
                    <div className="border-b border-white/25 pb-3">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-[2px] block mb-1">EDITORIAL BOARD</span>
                      <h4 className="font-heading font-extrabold text-[15px] md:text-[17px] text-white tracking-[-0.5px]">Spring 2024 Issue</h4>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <span className="text-[11px] text-white/50 font-bold uppercase tracking-[1px] block">Inside This Issue:</span>
                      <ul className="text-[12.5px] leading-relaxed text-white/90 list-disc pl-4 space-y-1.5 font-medium">
                        <li>Neuroscience of Focus</li>
                        <li>Anxiety Somatic Resets</li>
                        <li>Circadian Rhythms & Sleep</li>
                        <li>Dosha-Balanced Nutrition</li>
                      </ul>
                    </div>
                  </div>

                  <Link
                    href="/blogs/the-mindfulness-issue"
                    className="w-full text-center bg-white text-primary font-bold text-[12px] py-2.5 rounded-full hover:bg-accent hover:text-white transition-all duration-300 shadow-md no-underline block"
                  >
                    Read Digital Issue →
                  </Link>
                </div>

              </div>
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
                <Link href="/blogs/the-mindfulness-issue" className="btn-primary hover-glow bg-primary text-white px-7 py-3.5 rounded-full font-bold text-[13.5px] border border-primary hover:bg-transparent hover:text-primary transition-all duration-500 hover:-translate-y-0.5 shadow-md cursor-pointer flex items-center justify-center no-underline">
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

      {/* Trust Badges Bar (Text Only) */}
      <div className="bg-white border-y border-slate-200/50 shadow-[0_2px_12px_rgba(0,0,0,0.01)] py-5 relative">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {trustBadges.map((b, i) => (
              <div key={i} className="flex items-center gap-2.5">
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
            {displayedIssues.map((issue, i) => {
              const slug = issue.slug || issue.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              return (
                <div
                  key={issue.slug}
                  ref={el => cardRefs.current[i] = el}
                  onMouseMove={(e) => handleCardMouseMove(e, i)}
                  onMouseLeave={() => handleCardMouseLeave(i)}
                  style={{ transitionDelay: `${i * 0.1}s` }}
                  className="project-card tilt-card bg-bg-light rounded-[20px] overflow-hidden border border-slate-200 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer flex flex-col [transform-style:preserve-3d] [perspective:1000px] hover:border-accent/30 hover:shadow-[0_16px_40px_rgba(31,185,251,0.05)] reveal-slide p-4 min-h-[360px] md:min-h-[420px] group relative"
                >
                  {/* The Flipping Card Wrapper */}
                  <div className="w-full h-full relative transition-transform duration-[800ms] [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] flex flex-col flex-grow">

                    {/* Front Face */}
                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] flex flex-col justify-between">
                      <div className="relative rounded-xl overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.03)] border border-slate-100 transition-all duration-500 mb-4 flex-grow h-[220px] md:h-[280px]">
                        <Image
                          src={issue.img}
                          alt={issue.title}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 mt-auto">
                        <p className="text-accent text-[10px] font-bold uppercase tracking-wider">{issue.season}</p>
                        <p className="text-primary font-heading font-semibold text-sm leading-snug">{issue.title}</p>
                      </div>
                    </div>

                    {/* Back Face */}
                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#1e4a45] rounded-xl p-5 text-white flex flex-col justify-between shadow-2xl border border-white/20 select-none">
                      <div className="flex flex-col gap-3 text-left">
                        <div className="border-b border-white/20 pb-2.5">
                          <span className="text-[9px] font-bold text-accent uppercase tracking-[1.5px] block mb-0.5">{issue.season}</span>
                          <h4 className="font-heading font-extrabold text-[13px] md:text-[14px] text-white leading-tight">{issue.title}</h4>
                        </div>

                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] text-white/50 font-bold uppercase tracking-[1px] block">Inside:</span>
                          <ul className="text-[11px] md:text-[12px] leading-relaxed text-white/90 list-disc pl-3.5 space-y-1 font-medium">
                            {issue.contents.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <Link
                        href={`/blogs/${slug}`}
                        className="w-full text-center bg-white text-primary font-bold text-[10.5px] py-2 rounded-full hover:bg-accent hover:text-white transition-all duration-300 shadow-md no-underline block"
                      >
                        Read Issue →
                      </Link>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 reveal-slide">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 text-primary transition-all duration-300 font-bold text-sm cursor-pointer select-none
                  ${currentPage === 1
                    ? 'opacity-40 cursor-not-allowed border-slate-100 text-slate-400'
                    : 'hover:border-accent hover:bg-accent/5 hover:text-accent active:scale-95'}`}
                aria-label="Previous Page"
              >
                ←
              </button>

              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border font-bold text-sm transition-all duration-300 cursor-pointer select-none
                      ${currentPage === pageNum
                        ? 'bg-primary text-white border-primary shadow-md hover:bg-primary/95'
                        : 'border-slate-200 text-primary hover:border-accent hover:bg-accent/5 hover:text-accent active:scale-95'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 text-primary transition-all duration-300 font-bold text-sm cursor-pointer select-none
                  ${currentPage === totalPages
                    ? 'opacity-40 cursor-not-allowed border-slate-100 text-slate-400'
                    : 'hover:border-accent hover:bg-accent/5 hover:text-accent active:scale-95'}`}
                aria-label="Next Page"
              >
                →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Terracotta Subscribe CTA */}
      <section className="container my-14 reveal-scale">
        <div
          ref={subscribeCardRef}
          onMouseMove={handleSubscribeMouseMove}
          onMouseLeave={handleSubscribeMouseLeave}
          className="bg-[#e28c6f]/92 rounded-[40px] py-14 px-8 md:px-16 shadow-[0_20px_48px_rgba(226,140,111,0.15)] relative overflow-hidden [perspective:1200px]"
        >
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

            {/* Mobile/Tablet Mockup (Interactive cursor tracking shifts applied here) */}
            <div
              style={phoneTransform}
              className="flex-shrink-0 relative w-[220px] md:w-[260px] hidden md:block select-none [transform-style:preserve-3d]"
            >
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
    </div>
  );
}
