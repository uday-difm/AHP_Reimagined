'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';

// Proxy external URLs through the Next.js server to avoid CORS / hostname issues
function proxyUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `/api/media/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}
import ScrollReveal from '@/components/ScrollReveal';
import BackdropBlobs from '@/components/BackdropBlobs';
import Button from '@/components/Button';
import Scene from '@/components/Scene';

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
  const [dbIssues, setDbIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Refs for 3D card tilt
  const cardRefs = useRef([]);

  useEffect(() => {
    const fetchMagazines = async () => {
      try {
        const res = await fetch("/api/magazine");
        if (res.ok) {
          const data = await res.json();
          // Map database magazines to the frontend format
          const mapped = data.map((mag) => ({
            season: getSeasonFromDate(mag.magazine_date),
            title: mag.magazine_title,
            slug: mag.magazine_slug,
            img: mag.magazine_cover_image || '/images/mag_sleep.png',
            backImg: mag.magazine_back_image || '/back.jpg',
            spineImg: mag.magazine_spine_image || '/spine.jpg',
            contents: mag.magazine_tags ? mag.magazine_tags.split(',').map(t => t.trim()) : [],
            description: mag.magazine_description,
            introduction: mag.magazine_introduction || '',
            magazineId: mag.magazine_id || '',
            magCloudLink: mag.MagCloudLink,
            pdfLink: mag.magazine_link,
            timestamp: new Date(mag.magazine_date).getTime()
          }));
          setDbIssues(mapped);
        }
      } catch (err) {
        console.error("Failed to load magazines:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMagazines();
  }, []);

  function getSeasonFromDate(dateStr) {
    if (!dateStr) return 'LATEST ISSUE';
    const d = new Date(dateStr);
    const month = d.getMonth();
    const year = d.getFullYear();
    let season = 'WINTER';
    if (month >= 2 && month <= 4) season = 'SPRING';
    else if (month >= 5 && month <= 7) season = 'SUMMER';
    else if (month >= 8 && month <= 10) season = 'FALL';
    return `${season} ${year}`;
  }

  function getTimestampFromSeason(seasonStr) {
    if (!seasonStr) return 0;
    const parts = seasonStr.split(' ');
    if (parts.length !== 2) return 0;
    const season = parts[0].toUpperCase();
    const year = parseInt(parts[1]);
    let month = 0;
    if (season === 'SPRING') month = 2;
    else if (season === 'SUMMER') month = 5;
    else if (season === 'FALL') month = 8;
    else if (season === 'WINTER') month = 11;
    return new Date(year, month, 1).getTime();
  }

  const allIssues = useMemo(() => {
    const staticIssuesMapped = recentIssues.map(issue => ({
      ...issue,
      timestamp: getTimestampFromSeason(issue.season)
    }));
    return [
      ...dbIssues,
      ...staticIssuesMapped
    ].sort((a, b) => b.timestamp - a.timestamp);
  }, [dbIssues]);

  const itemsPerPage = 6;
  // Exclude the hero (latest) issue from Recent Issues grid
  const recentIssuesList = allIssues.slice(1);
  const totalPages = Math.ceil(recentIssuesList.length / itemsPerPage);
  const displayedIssues = recentIssuesList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const latestIssue = allIssues[0] || {
    season: 'SPRING 2024',
    title: 'The Mindfulness Issue',
    slug: 'the-mindfulness-issue',
    img: '/images/mag_sleep.png',
    backImg: '/back.jpg',
    spineImg: '/spine.jpg',
    description: 'Explore the intersection of ancient wisdom and modern neuroscience. Our latest issue dives deep into meditative practices, cognitive health, and the art of intentional living.',
    magCloudLink: 'https://www.magcloud.com/'
  };

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
  }, [currentPage, dbIssues]);

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
      {/* Global Animation Utilities */}
      <CustomCursor />
      <ScrollReveal />
      <BackdropBlobs />

      <Header />

      {/* Hero — Current Issue */}
      <section className="bg-[#f0f6f3]/60 pt-[140px] pb-20 rounded-b-[40px] border-b border-slate-200/20 relative">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center gap-10 xl:gap-14 justify-between">

            {/* Left — 3D Magazine Cover (3D Book effect) */}

            <Scene
              frontUrl={latestIssue.img}
              backUrl={latestIssue.backImg}
              spineUrl={latestIssue.spineImg}
            />

            {/* Middle — Info */}
            <div className="flex-grow max-w-xl reveal-slide">
              <div className="inline-flex items-center gap-2 bg-[#27ae60]/10 border border-[#27ae60]/20 rounded-full px-3.5 py-1.5 mb-6">
                <span className="w-2 h-2 bg-accent-green rounded-full animate-pulse-slow" />
                <span className="text-accent-green text-[10.5px] font-extrabold uppercase tracking-[2px]">LATEST ISSUE • {latestIssue.magazineId || latestIssue.season}</span>
              </div>

              <h1 className="text-primary font-heading font-extrabold text-4xl md:text-5xl leading-tight mb-5 tracking-[-1.5px]">
                {latestIssue.title}
              </h1>

              <p className="text-secondary text-[15px] md:text-base leading-relaxed mb-10 max-w-md">
                {latestIssue.description}
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <Link href={`/magazine/${latestIssue.slug}`} className="btn-primary hover-glow bg-[#0f7c85] hover:bg-[#0c646b] text-white px-8 py-4 rounded-full font-bold text-[14px] border border-[#0f7c85] transition-all duration-500 hover:-translate-y-0.5 shadow-md hover:shadow-[0_8px_24px_rgba(15,124,133,0.25)] cursor-pointer flex items-center justify-center no-underline">
                  Read Digital Issue
                </Link>
                <a href="#recent-issues" className="border-2 border-[#0f7c85]/20 text-[#0f7c85] hover:border-[#0f7c85] hover:bg-[#0f7c85]/5 font-bold text-[14px] px-8 py-4 rounded-full transition-all duration-500 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center no-underline">
                  Browse Archive
                </a>
              </div>

              <div className="flex flex-wrap gap-10 pt-10 border-t border-slate-200">
                {stats.map((s, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-primary font-heading font-extrabold text-lg leading-tight">{s.value}</span>
                    <span className="text-muted text-[11px] font-semibold uppercase tracking-wider mt-1">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column — Partner Ad/Promo Card */}
            <div className="hidden lg:block lg:w-[280px] flex-shrink-0 self-stretch reveal-scale">
              <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-5 border border-white/60 shadow-[0_12px_32px_rgba(0,0,0,0.03)] h-full flex flex-col justify-between">
                <div>
                  <span className="inline-block bg-[#27ae60]/10 border border-[#27ae60]/20 text-[#27ae60] font-bold text-[9px] uppercase tracking-[1.5px] px-2.5 py-1 rounded-full mb-3.5">
                    Partner Highlight
                  </span>

                  <div className="relative w-full h-[120px] rounded-2xl overflow-hidden mb-4 border border-slate-100 shadow-sm bg-slate-50">
                    <Image
                      src="/images/service_partner_roundup_mockup.png"
                      alt="Wellness Consultation Partner"
                      fill
                      className="object-cover animate-pulse-slow"
                    />
                  </div>

                  <h3 className="font-heading font-extrabold text-[14px] text-primary leading-tight mb-2">
                    Personalized Health Plans
                  </h3>
                  <p className="text-secondary text-[12px] leading-relaxed mb-4">
                    Unlock tailored nutrition, circadian alignment, and somatic reset coaching from certified wellness experts.
                  </p>
                </div>

                <a
                  href="/services"
                  className="w-full text-center bg-[#0f7c85] hover:bg-[#0c646b] text-white font-extrabold text-[12px] py-3 px-4 rounded-xl transition-all duration-300 no-underline block shadow-sm hover:shadow-[0_6px_20px_rgba(15,124,133,0.3)] hover:-translate-y-0.5 transform"
                >
                  Book Free Consultation
                </a>
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
          <div className="flex flex-col items-center text-center max-w-xl mx-auto mb-14 reveal-slide">
            <span className="section-tag text-[10px] font-extrabold tracking-[3px] text-accent uppercase mb-2 bg-[#0f7c85]/10 px-3.5 py-1.5 rounded-full">
              BACK JOURNAL
            </span>
            <h2 className="text-primary font-heading font-extrabold text-3xl md:text-4xl tracking-[-0.5px] mt-2 mb-3">
              Recent Issues
            </h2>
            <p className="text-muted text-[14px] leading-relaxed max-w-md">
              Journey through our curated collection of wellness wisdom.
            </p>
            <button className="flex items-center gap-1 text-accent text-[12px] font-extrabold uppercase tracking-wider hover:underline mt-4 cursor-pointer">
              All Years <span className="arrow">→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-12 mx-auto">
            {displayedIssues.map((issue, i) => {
              const slug = issue.slug || issue.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              return (
                <div
                  key={issue.slug}
                  ref={el => cardRefs.current[i] = el}
                  onMouseMove={(e) => handleCardMouseMove(e, i)}
                  onMouseLeave={() => handleCardMouseLeave(i)}
                  style={{ transitionDelay: `${i * 0.1}s` }}
                  className="project-card tilt-card bg-bg-light rounded-[24px] overflow-hidden border border-slate-200 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer flex flex-col [transform-style:preserve-3d] [perspective:1000px] hover:border-[#0f7c85]/40 hover:shadow-[0_24px_48px_rgba(15,124,133,0.14)] hover:scale-[1.04] hover:-translate-y-2.5 active:scale-[0.98] reveal-slide p-5 min-h-[400px] md:min-h-[490px] group relative"
                >
                  {/* The Flipping Card Wrapper */}
                  <div className="w-full h-full relative transition-transform duration-[800ms] [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] flex flex-col flex-grow">

                    {/* Front Face */}
                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] flex flex-col justify-between">
                      <div className="relative rounded-2xl overflow-hidden shadow-[0_12px_28px_rgba(0,0,0,0.04)] border border-slate-100 transition-all duration-500 mb-5 flex-grow h-[240px] md:h-[330px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={proxyUrl(issue.img)}
                          alt={issue.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex flex-col gap-1 mt-auto">
                        <p className="text-accent text-[11px] font-extrabold uppercase tracking-[1.5px] mb-1">{issue.magazineId || issue.season}</p>
                        <p className="text-primary font-heading font-extrabold text-[15px] leading-snug tracking-[-0.3px] group-hover:text-accent transition-colors duration-300">{issue.title}</p>
                      </div>
                    </div>

                    {/* Back Face */}
                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#0f7c85] rounded-2xl p-6 text-white flex flex-col justify-between shadow-2xl border border-white/20 select-none">
                      <div className="flex flex-col gap-4.5 text-left">
                        <div className="border-b border-white/20 pb-3">
                          <span className="text-[10px] font-extrabold text-[#4FC0C3] uppercase tracking-[1.5px] block mb-0.5">{issue.magazineId || issue.season}</span>
                          <h4 className="font-heading font-extrabold text-[15px] md:text-[17px] text-white leading-tight tracking-tight">{issue.title}</h4>
                        </div>

                        <div className="flex flex-col gap-2.5">
                          <span className="text-[11px] text-white/50 font-bold uppercase tracking-[1px] block">Inside:</span>
                          {issue.description ? (
                            <p className="text-[12px] leading-relaxed text-white/90 font-medium line-clamp-6 overflow-hidden text-ellipsis">
                              {issue.description}
                            </p>
                          ) : (
                            <ul className="text-[12px] md:text-[13.5px] leading-relaxed text-white/90 list-disc pl-4 space-y-1.5 font-medium">
                              {issue.contents.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/magazine/${slug}`}
                        className="w-full text-center bg-white text-[#0f7c85] font-extrabold text-[12px] py-3 rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-md no-underline block border border-transparent"
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


      {/* Subscribe + Advertise — Side by Side */}
      <section className="container my-14 reveal-scale">
        <div className="grid grid-cols-1 md:grid-cols-[7fr_3fr] gap-6 md:items-center items-stretch">

          {/* Left — Terracotta Subscribe CTA */}
          <div
            ref={subscribeCardRef}
            onMouseMove={handleSubscribeMouseMove}
            onMouseLeave={handleSubscribeMouseLeave}
            className="bg-[#e28c6f]/92 rounded-[40px] shadow-[0_20px_48px_rgba(226,140,111,0.15)] relative [perspective:1200px] flex flex-row items-stretch min-h-[280px]"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#df7f60]/20 to-transparent pointer-events-none rounded-[40px]" />

            {/* Text content — left */}
            <div className="relative z-10 flex flex-col justify-center gap-5 flex-1 py-8 px-6 md:py-10 md:pl-10 md:pr-6 min-w-0">
              <div>
                <h2 className="text-primary font-heading font-extrabold text-2xl md:text-3xl leading-tight mb-3 tracking-[-1px] break-words">
                  Never miss a moment<br className="hidden md:block" /> of wellness.
                </h2>
                <p className="text-[#3a2520]/80 text-[13.5px] leading-relaxed max-w-md">
                  Subscribe to our digital edition for just $15/year. Get exclusive interviews, medically-vetted health guides, and a sanctuary of inspiration delivered to your inbox every quarter.
                </p>
              </div>

              <div>
                {subscribed ? (
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 text-[#1a1a2e] font-bold text-sm shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
                    ✅ You&apos;re subscribed! Welcome to the A Health Place community.
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="Your email address"
                      className="flex-1 rounded-full px-6 py-3.5 text-sm text-[#1a1a2e] outline-none focus:ring-2 focus:ring-white/50 bg-white/90 placeholder:text-[#9a8680]"
                    />
                    <Button type="submit" variant="primary" className="!bg-primary hover:!bg-primary/90 !text-sm !py-3.5 !px-7 shadow-md whitespace-nowrap">
                      Subscribe Now
                    </Button>
                  </form>
                )}
                <p className="text-[#3a2520]/60 text-[11px] mt-3">
                  By subscribing, you agree to our{' '}
                  <Link href="/info?tab=legal&doc=privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                  You can unsubscribe at any time.
                </p>
              </div>
            </div>

            {/* Phone mockup — right column, centered */}
            <div
              style={phoneTransform}
              className="hidden md:flex shrink-0 w-[180px] items-center justify-center pr-10 pb-0 select-none [transform-style:preserve-3d]"
            >
              <div className="relative">
                <div className="absolute -top-4 -right-3 w-24 h-36 bg-[#f4ded7]/50 rounded-[24px] rotate-6 opacity-60" />
                <div className="relative z-10 rounded-[28px] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.15)] border-[4px] border-white/60">
                  <Image src="/images/mag_phone.png" alt="A Health Place magazine app" width={160} height={300} className="w-full object-cover" />
                </div>
              </div>
            </div>

          </div>

          {/* Right — Advertise With Us */}
          <div className="bg-bg-light rounded-[40px] p-8 border border-slate-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between hover:border-[#0f7c85]/20 transition-all duration-300">
            <div>
              <div className="w-12 h-12 bg-[#e8f4ff] rounded-full flex items-center justify-center mb-6 shadow-sm">
                <svg className="w-5 h-5 text-[#0f7c85]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h2 className="text-primary font-heading font-extrabold text-2xl md:text-3xl mb-4 tracking-[-0.5px]">
                Advertise With Us.
              </h2>
              <p className="text-secondary text-[14px] leading-relaxed mb-8">
                Reach our highly engaged audience of health and wellness enthusiasts. Partner with us for editorial integrations, custom newsletter sponsorships, or digital media packages.
              </p>
            </div>
            <Link
              href="/info?tab=contact"
              className="inline-flex items-center justify-center bg-[#0f7c85] hover:bg-[#0c646b] text-white font-extrabold text-[12px] py-3 px-6 rounded-xl transition-all duration-300 no-underline w-max shadow-sm hover:shadow-[0_6px_20px_rgba(15,124,133,0.2)] hover:-translate-y-0.5 transform"
            >
              Contact Us
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
