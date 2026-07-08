'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const articles = [
  {
    id: 1,
    category: 'Nutrition',
    badgeClass: 'bg-[var(--color-badge-green-bg)] text-[var(--color-badge-green-text)]',
    title: '5 Essential Foods for Optimal Gut Health',
    desc: 'Learn which fermented foods and prebiotics can transform your digestive system and boost immunity.',
    img: '/images/ayurveda.png',
  },
  {
    id: 2,
    category: 'Insurance',
    badgeClass: 'bg-[var(--color-badge-red-bg)] text-[var(--color-badge-red-text)]',
    title: "Navigating Medicare: A Beginner's Guide",
    desc: 'Demystifying Parts A, B, C, and D so you can make informed decisions about your health coverage.',
    img: '/images/disease.png',
  },
  {
    id: 3,
    category: 'Holistic',
    badgeClass: 'bg-[var(--color-badge-green-bg)] text-[var(--color-badge-green-text)]',
    title: '10-Minute Evening Yoga Routine for Sleep',
    desc: 'Unwind your body and quiet your mind with these gentle stretches before bedtime.',
    img: '/images/holistic.png',
  },
  {
    id: 4,
    category: 'Mental Health',
    badgeClass: 'bg-[var(--color-badge-blue-bg)] text-[var(--color-badge-blue-text)]',
    title: 'How Exercise Reduces Daily Stress',
    desc: 'Science-backed strategies showing how regular movement rewires the brain for resilience and calm.',
    img: '/images/hero_exercise.png',
  },
  {
    id: 5,
    category: 'Physical Health',
    badgeClass: 'bg-[var(--color-badge-yellow-bg)] text-[var(--color-badge-yellow-text)]',
    title: 'Impact of Inactivity on Physical Health',
    desc: "Research links sedentary lifestyles to chronic conditions — here's what you can do immediately.",
    img: '/images/physical_health.png',
  },
  {
    id: 6,
    category: 'Life Stages',
    badgeClass: 'bg-[var(--color-badge-purple-bg)] text-[var(--color-badge-purple-text)]',
    title: 'When Is the Right Time for Hospice Care?',
    desc: 'Compassionate guidance on recognizing the signs and having difficult but important family conversations.',
    img: '/images/hero_hospice.png',
  },
];

const timelineSlides = [
  {
    year: '2024',
    phase: 'Board Setup',
    title: 'Board Integration & Science Check',
    desc: 'Establishing collaboration protocols with certified dietitians and clinical psychologists for verifying article content.',
    img: '/images/disease.png',
  },
  {
    year: '2025',
    phase: 'Digital Magazine',
    title: 'Launching the Digital Journal',
    desc: 'Releasing interactive health calculators, sleep diaries, and medically vetted nutritional guides on our website.',
    img: '/images/holistic.png',
  },
  {
    year: '2026',
    phase: 'Directories',
    title: 'Ayurvedic & Clinical Directories',
    desc: 'Providing certified practitioner mappings and insurance compatibility guidelines for holistic therapies.',
    img: '/images/ayurveda.png',
  },
  {
    year: '2027+',
    phase: 'Scale',
    title: 'AI Diagnostics Collaborations',
    desc: 'Leveraging machine learning checklists to help readers map family health plans to insurance benefits.',
    img: '/images/physical_health.png',
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [progressWidth, setProgressWidth] = useState('25%');

  // Refs for custom cursor lag
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);

  // Refs for 3D card tilt
  const cardRefs = useRef([]);

  // Refs for timeline slider
  const sliderRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // Track hover state globally for custom cursor scale
  useEffect(() => {
    const handleMouseHover = (e) => {
      const target = e.target.closest('a, button, [role="button"], input, textarea, .tilt-card');
      if (target) {
        document.body.classList.add('hover-link');
      } else {
        document.body.classList.remove('hover-link');
      }
    };

    document.addEventListener('mouseover', handleMouseHover);
    return () => {
      document.removeEventListener('mouseover', handleMouseHover);
    };
  }, []);

  // Cursor Inertia tracking
  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    const inertiaSpeed = 0.12;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = `${mouseX}px`;
        cursorDotRef.current.style.top = `${mouseY}px`;
      }
    };

    const updateCursor = () => {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;

      cursorX += dx * inertiaSpeed;
      cursorY += dy * cursorY ? dy * inertiaSpeed : dy * inertiaSpeed; // vertical lag
      cursorY += dy * inertiaSpeed;

      if (cursorRef.current) {
        cursorRef.current.style.left = `${cursorX}px`;
        cursorRef.current.style.top = `${cursorY}px`;
      }

      requestAnimationFrame(updateCursor);
    };

    document.addEventListener('mousemove', handleMouseMove);
    const animId = requestAnimationFrame(updateCursor);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

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

  // Intersection Observer scroll reveals
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

  // Parallax Hero Image Effect
  useEffect(() => {
    const parallaxImg = document.querySelector('.parallax-img');
    if (!parallaxImg) return;

    const handleParallax = () => {
      const scrollPos = window.scrollY;
      const yTranslate = scrollPos * 0.12;
      parallaxImg.style.transform = `translateY(${yTranslate}px) scale(1.05)`;
    };

    window.addEventListener('scroll', handleParallax, { passive: true });
    return () => window.removeEventListener('scroll', handleParallax);
  }, []);

  // Body scroll locking when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('hb-no-scroll');
    } else {
      document.body.classList.remove('hb-no-scroll');
    }
  }, [menuOpen]);

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

  // Draggable timeline handlers
  const handleSliderScroll = () => {
    const slider = sliderRef.current;
    if (!slider) return;

    const maxScroll = slider.scrollWidth - slider.clientWidth;
    if (maxScroll <= 0) {
      setProgressWidth('100%');
      return;
    }
    const scrollFraction = slider.scrollLeft / maxScroll;
    setProgressWidth(`${Math.min(100, Math.max(10, scrollFraction * 100))}%`);
  };

  const handleSliderMouseDown = (e) => {
    const slider = sliderRef.current;
    if (!slider) return;

    isDraggingRef.current = true;
    slider.classList.add('dragging');
    startXRef.current = e.pageX - slider.offsetLeft;
    scrollLeftRef.current = slider.scrollLeft;
  };

  const handleSliderMouseUp = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    isDraggingRef.current = false;
    slider.classList.remove('dragging');
  };

  const handleSliderMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const slider = sliderRef.current;
    if (!slider) return;

    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    slider.scrollLeft = scrollLeftRef.current - walk;
  };

  const slideLeft = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    const slide = slider.querySelector('.timeline-slide');
    const width = slide ? slide.clientWidth + 32 : 380;
    slider.scrollBy({ left: -width, behavior: 'smooth' });
  };

  const slideRight = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    const slide = slider.querySelector('.timeline-slide');
    const width = slide ? slide.clientWidth + 32 : 380;
    slider.scrollBy({ left: width, behavior: 'smooth' });
  };

  return (
    <>
      {/* Custom Inertia Cursor */}
      <div
        ref={cursorRef}
        id="custom-cursor"
        className="fixed top-0 left-0 w-8 h-8 border-[1.5px] border-accent rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden lg:block"
      />
      <div
        ref={cursorDotRef}
        id="custom-cursor-dot"
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-accent rounded-full pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2 hidden lg:block"
      />

      {/* Floating Backdrop Decorative Blobs */}
      <div className="bg-blobs-container fixed inset-0 z-[-2] overflow-hidden pointer-events-none opacity-75">
        <div className="blob blob-1 absolute rounded-full filter blur-[120px] mix-blend-multiply w-[500px] h-[500px] bg-accent/15 -top-[10%] -left-[10%] animate-float-blobs-1" />
        <div className="blob blob-2 absolute rounded-full filter blur-[120px] mix-blend-multiply w-[600px] h-[600px] bg-[rgba(39,174,96,0.1)] -bottom-[15%] -right-[5%] animate-float-blobs-2" />
        <div className="blob blob-3 absolute rounded-full filter blur-[120px] mix-blend-multiply w-[400px] h-[400px] bg-[rgba(224,82,72,0.06)] top-[40%] left-[50%] animate-float-blobs-3" />
      </div>

      {/* Sticky Header */}
      <header
        className={`fixed top-0 left-0 w-full flex items-center z-[1000] border-b border-[var(--color-border)]/40 backdrop-blur-md transition-all duration-300 ${
          scrolled ? 'bg-white/92 h-[70px] shadow-[0_4px_30px_rgba(0,0,0,0.02)]' : 'bg-white/80 h-20'
        } ${hideHeader ? '-translate-y-full' : 'translate-y-0'}`}
      >
        <div className="header-container flex justify-between items-center w-full max-w-[1200px] mx-auto px-6 md:px-10">
          <a href="#" className="logo-link flex items-center">
            <Image
              src="/images/Logo-web.png"
              alt="A Health Place Logo"
              width={180}
              height={36}
              className="logo-img h-9 w-auto object-contain block transition-transform duration-300 hover:scale-[1.03]"
              priority
            />
          </a>

          {/* Desktop Nav */}
          <nav className="nav-desktop hidden md:flex items-center gap-8">
            <a href="#about" className="nav-item text-sm font-medium text-secondary relative py-1.5 transition-colors hover:text-primary after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full">About</a>
            <a href="#articles" className="nav-item text-sm font-medium text-secondary relative py-1.5 transition-colors hover:text-primary after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full">Articles</a>
            <a href="#timeline" className="nav-item text-sm font-medium text-secondary relative py-1.5 transition-colors hover:text-primary after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full">Journey</a>
            <a href="#events" className="nav-item text-sm font-medium text-secondary relative py-1.5 transition-colors hover:text-primary after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full">Community</a>
            <a href="#contact" className="nav-item text-sm font-medium text-secondary relative py-1.5 transition-colors hover:text-primary after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full">Newsletter</a>
          </nav>

          {/* Action Button */}
          <div className="header-actions flex items-center gap-4 mr-[70px] md:mr-0">
            <a href="#contact" className="btn-primary hover-glow bg-primary text-white px-6 py-3 rounded-full font-semibold text-[13.5px] border border-primary hover:bg-transparent hover:text-primary transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(26,26,46,0.12)]">
              Subscribe
            </a>
          </div>
        </div>
      </header>

      {/* Floating Hamburger Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={`fixed top-5 right-5 md:right-10 w-14 h-14 rounded-full flex flex-col justify-center items-center gap-1.25 cursor-pointer z-[10000] shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-500 border ${
          menuOpen ? 'bg-primary border-primary' : 'bg-white/90 border-[var(--color-border)]/80 hover:scale-105 hover:border-accent hover:shadow-[0_6px_24px_rgba(31,185,251,0.12)]'
        }`}
        aria-label="Toggle Menu"
      >
        <span className={`w-[22px] h-[2px] rounded-sm transition-all duration-500 origin-center ${menuOpen ? 'bg-white translate-y-[7px] rotate-45' : 'bg-primary'}`} />
        <span className={`w-[22px] h-[2px] rounded-sm transition-all duration-500 ${menuOpen ? 'opacity-0 scale-x-0' : 'bg-primary'}`} />
        <span className={`w-[22px] h-[2px] rounded-sm transition-all duration-500 origin-center ${menuOpen ? 'bg-white -translate-y-[7px] -rotate-45' : 'bg-primary'}`} />
      </button>

      {/* Universal Hamburger Menu Overlay */}
      <div
        className={`fixed inset-0 w-full h-screen bg-white/96 backdrop-blur-3xl z-[9999] flex items-center justify-center transition-all duration-500 ${
          menuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
        }`}
      >
        <div className={`hb-menu-container w-full max-w-[1280px] px-10 grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-10 md:gap-20 items-center transition-transform duration-700 ${menuOpen ? 'translate-y-0' : 'translate-y-10'}`}>
          <nav className="hb-nav-links flex flex-col gap-4">
            {['About', 'Articles', 'Journey', 'Community', 'Newsletter'].map((label, i) => (
              <a
                key={i}
                href={`#${label.toLowerCase().replace('journey', 'timeline').replace('newsletter', 'contact').replace('community', 'events')}`}
                onClick={() => setMenuOpen(false)}
                style={{ transitionDelay: `${i * 0.1}s` }}
                className={`hb-nav-item font-heading font-extrabold text-[36px] sm:text-[48px] md:text-[64px] text-primary no-underline leading-[1.1] tracking-[-2px] inline-block hover:text-accent hover:translate-x-3 transition-all duration-500 ${
                  menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                }`}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className={`hb-meta-panel flex flex-col gap-10 border-l-0 md:border-l border-primary/10 pl-0 md:pl-16 transition-all duration-500 delay-400 ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}>
            <div className="hb-meta-section">
              <h4 className="hb-meta-title font-heading text-[12px] font-bold uppercase tracking-[2px] text-accent mb-2">Our Philosophy</h4>
              <p className="hb-meta-text text-[15px] text-[#555565] leading-relaxed">Empowering you with calm, clear, and medically accurate information to support your holistic lifestyle.</p>
            </div>
            <div className="hb-meta-section">
              <h4 className="hb-meta-title font-heading text-[12px] font-bold uppercase tracking-[2px] text-accent mb-2">Explore Categories</h4>
              <p className="hb-meta-text text-[15px] text-[#555565] leading-relaxed">Physical Health • Mental Health • Holistic & Ayurveda • Insurance • Life Stages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-section pt-[140px] pb-20 relative">
        <div className="container hero-container flex flex-col gap-[60px]">
          <div className="hero-text-grid grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-10 md:gap-[40px] items-end">
            <div className="hero-title-col">
              <div className="hero-badge-row flex flex-wrap items-center gap-3 mb-5 reveal-fade">
                <span className="badge-mindfulness bg-badge-blue-bg text-badge-blue-text font-bold text-[11px] tracking-[1px] px-3.5 py-1.5 rounded-full border border-accent/20">MINDFULNESS</span>
                <span className="badge-meta text-[11.5px] text-muted">Medically Reviewed • Oct 12, 2026</span>
              </div>
              <h1 className="hero-title font-heading font-extrabold text-[48px] md:text-[92px] text-primary leading-[1.05] tracking-[-2px] flex flex-col reveal-text">
                <span>Building</span>
                <span className="italic-serif font-serif italic font-normal pl-5 text-accent">wellness</span>
                <span>into</span>
                <span className="text-outline text-transparent [-webkit-text-stroke:1.5px_var(--color-primary)] tracking-[-1px]">your Life</span>
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
          <div className="hero-image-wrapper relative w-full h-[300px] md:h-[600px] rounded-[24px] overflow-hidden shadow-[0_20px_48px_rgba(0,0,0,0.05)] reveal-scale">
            <div className="parallax-img-container w-full h-[120%] absolute -top-[10%] left-0">
              <Image
                src="/images/holistic.png"
                alt="Holistic yoga wellness concept illustration"
                fill
                priority
                className="parallax-img object-cover transition-transform duration-100 ease-out scale-[1.05]"
                sizes="100vw"
              />
            </div>
            <div className="hero-image-overlay absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-light/50 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section id="about" className="values-section py-[100px] relative">
        <div className="container">
          <div className="section-header-grid grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-[60px] mb-16 items-end">
            <div className="reveal-slide">
              <h2 className="section-title-large font-heading font-bold text-[32px] md:text-[54px] leading-[1.15] text-primary tracking-[-1px]">Empathetic, verified, and forward-thinking.</h2>
            </div>
            <div className="reveal-fade">
              <p className="section-subtitle-text text-[16px] text-secondary leading-[1.7]">
                We believe health information should be transparent and accessible. We work alongside leading physicians, registered dietitians, and clinical advisors to structure guides that promote physical longevity and mental resilience.
              </p>
            </div>
          </div>

          {/* Asymmetrical Gallery Grid */}
          <div className="gallery-grid grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] md:grid-rows-[240px_240px] gap-6">
            <div
              className="gallery-item item-skewed relative rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)] md:row-span-2 reveal-slide group cursor-pointer"
              style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)' }}
            >
              <div className="image-zoom-container w-full h-full overflow-hidden relative">
                <Image
                  src="/images/ayurveda.png"
                  alt="Ayurvedic herbs and holistic healthcare"
                  fill
                  className="gallery-img object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-hover:rotate-1"
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
              </div>
              <div className="gallery-caption absolute bottom-5 left-5 bg-white/85 backdrop-blur-md px-4 py-2 rounded-full text-[12px] font-semibold text-primary shadow-[0_4px_12px_rgba(0,0,0,0.05)]">Holistic Ayurveda</div>
            </div>

            <div
              className="gallery-item item-rect-top relative rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)] md:col-start-2 md:row-start-1 reveal-slide group cursor-pointer"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 15% 100%)' }}
            >
              <div className="image-zoom-container w-full h-full overflow-hidden relative">
                <Image
                  src="/images/hero_sleep.png"
                  alt="Quiet sleep environment"
                  fill
                  className="gallery-img object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-hover:rotate-1"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
              <div className="gallery-caption absolute bottom-5 left-5 bg-white/85 backdrop-blur-md px-4 py-2 rounded-full text-[12px] font-semibold text-primary shadow-[0_4px_12px_rgba(0,0,0,0.05)]">Restful Decompression</div>
            </div>

            <div
              className="gallery-item item-rect-bottom relative rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)] md:col-start-2 md:row-start-2 reveal-slide group cursor-pointer"
              style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)' }}
            >
              <div className="image-zoom-container w-full h-full overflow-hidden relative">
                <Image
                  src="/images/physical_health.png"
                  alt="Healthy active lifestyle"
                  fill
                  className="gallery-img object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-hover:rotate-1"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
              <div className="gallery-caption absolute bottom-5 left-5 bg-white/85 backdrop-blur-md px-4 py-2 rounded-full text-[12px] font-semibold text-primary shadow-[0_4px_12px_rgba(0,0,0,0.05)]">Active Physical Longevity</div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid Section */}
      <section id="articles" className="projects-section py-[100px] bg-white rounded-t-[40px] shadow-[0_-20px_40px_rgba(0,0,0,0.01)]">
        <div className="container">
          <div className="section-title-center text-center max-w-[600px] mx-auto mb-16 reveal-slide">
            <span className="section-tag text-[11px] font-bold tracking-[2px] text-accent uppercase mb-3 block">EXPERT-BACKED GUIDES</span>
            <h2 className="section-title font-heading font-extrabold text-[32px] md:text-[44px] text-primary tracking-[-1px]">Latest Articles</h2>
          </div>

          <div className="projects-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((art, i) => (
              <div
                key={art.id}
                ref={el => cardRefs.current[i] = el}
                onMouseMove={(e) => handleCardMouseMove(e, i)}
                onMouseLeave={() => handleCardMouseLeave(i)}
                style={{ '--order': i + 1 }}
                className="project-card tilt-card bg-bg-light rounded-[20px] overflow-hidden border border-slate-200 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer flex flex-col h-full [transform-style:preserve-3d] [perspective:1000px] hover:border-accent/30 hover:shadow-[0_16px_40px_rgba(31,185,251,0.05)] reveal-slide"
              >
                <div className="project-img-wrapper relative w-full h-[220px] overflow-hidden [transform:translateZ(20px)]">
                  <Image
                    src={art.img}
                    alt={art.title}
                    fill
                    className="project-img object-cover transition-transform duration-500 hover:scale-106"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <span className={`project-badge absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.5px] ${art.badgeClass}`}>
                    {art.category}
                  </span>
                </div>
                <div className="project-content p-6 flex flex-col gap-2.5 flex-grow [transform:translateZ(10px)]">
                  <h3 className="project-name font-heading font-bold text-[17px] text-primary leading-snug group-hover:text-accent transition-colors">
                    {art.title}
                  </h3>
                  <p className="project-desc text-[13px] text-secondary leading-relaxed">
                    {art.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="timeline-section py-[100px] bg-bg-timeline rounded-t-[40px] relative">
        <div className="container">
          <div className="section-title-center text-center max-w-[600px] mx-auto mb-16 reveal-slide">
            <span className="section-tag text-[11px] font-bold tracking-[2px] text-accent uppercase mb-3 block">MILESTONES</span>
            <h2 className="section-title text-white-section font-heading font-extrabold text-[32px] md:text-[44px] text-primary tracking-[-1px]">Our medical advisory journey</h2>
          </div>

          {/* Interactive Horizontal Slider */}
          <div className="timeline-slider-container relative overflow-hidden mt-12 pb-8 cursor-grab active:cursor-grabbing reveal-scale">
            <div
              ref={sliderRef}
              onMouseDown={handleSliderMouseDown}
              onMouseUp={handleSliderMouseUp}
              onMouseLeave={handleSliderMouseUp}
              onMouseMove={handleSliderMouseMove}
              onScroll={handleSliderScroll}
              className="timeline-slider-track flex gap-8 overflow-x-auto scrollbar-none transition-transform duration-500 select-none"
            >
              {timelineSlides.map((slide, i) => (
                <div
                  key={i}
                  className="timeline-slide flex-[0_0_380px] bg-white rounded-[24px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col gap-5 select-none"
                >
                  <div className="slide-header flex justify-between items-center border-b border-slate-200 pb-3">
                    <span className="slide-year font-heading font-extrabold text-[28px] text-primary">{slide.year}</span>
                    <span className="slide-phase text-[11px] font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full uppercase">{slide.phase}</span>
                  </div>
                  <div className="slide-body flex flex-col gap-3">
                    <h4 className="slide-title font-heading font-bold text-[16px] text-primary">{slide.title}</h4>
                    <p className="slide-desc text-[13px] text-secondary leading-relaxed">{slide.desc}</p>
                    <div className="slide-image relative mt-2 h-[140px] rounded-xl overflow-hidden">
                      <Image
                        src={slide.img}
                        alt={slide.title}
                        fill
                        className="object-cover"
                        sizes="380px"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Slider Controls */}
            <div className="slider-controls mt-10 flex items-center justify-between gap-10">
              <div className="progress-bar-bg flex-grow h-1 bg-primary/10 rounded-full relative overflow-hidden">
                <div
                  className="progress-bar-fill absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: progressWidth }}
                />
              </div>
              <div className="slider-buttons flex gap-4">
                <button
                  onClick={slideLeft}
                  className="slider-btn bg-white border border-slate-200 text-primary w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:bg-primary hover:text-white hover:scale-105"
                  aria-label="Previous Slide"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </button>
                <button
                  onClick={slideRight}
                  className="slider-btn bg-white border border-slate-200 text-primary w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:bg-primary hover:text-white hover:scale-105"
                  aria-label="Next Slide"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community & Events Section */}
      <section id="events" className="community-section py-[100px] bg-bg-light rounded-t-[40px]">
        <div className="container">
          <div className="community-grid grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-12 md:gap-20 items-center">
            <div className="community-info flex flex-col items-start gap-5 reveal-slide">
              <span className="section-tag text-[11px] font-bold tracking-[2px] text-accent uppercase mb-1 block">COMMUNITY CONNECTION</span>
              <h2 class="section-title font-heading font-extrabold text-[32px] md:text-[44px] text-primary tracking-[-1px]">Our Community & Events</h2>
              <p className="community-text text-[16px] leading-[1.7] text-secondary">
                We hold regular group nature walks, online yoga classes, and stress management seminars hosted by clinical professionals to keep you connected.
              </p>
              <a href="#" className="btn-text text-sm font-bold text-primary no-underline inline-flex items-center gap-2 hover:translate-x-1 transition-all duration-300">
                View publication archives <span className="arrow transition-transform duration-300">→</span>
              </a>
            </div>

            <div className="community-featured reveal-scale">
              <div className="featured-card bg-white rounded-[24px] overflow-hidden shadow-[0_20px_48px_rgba(0,0,0,0.03)] border border-slate-200 group">
                <div className="featured-img-wrapper relative h-[260px] overflow-hidden">
                  <Image
                    src="/images/hero_exercise.png"
                    alt="A pathway under trees during autumn walk"
                    fill
                    className="featured-img object-cover transition-transform duration-[600ms] group-hover:scale-104"
                    sizes="(max-width: 900px) 100vw, 50vw"
                  />
                  <div className="featured-badge absolute top-5 left-5 bg-primary text-white px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.5px]">JULY 2026</div>
                </div>
                <div className="featured-content p-8 flex flex-col gap-3">
                  <span className="featured-tag text-[11px] font-bold text-accent uppercase tracking-wider">Mindfulness Walk</span>
                  <h3 className="featured-title font-heading font-bold text-[18px] md:text-[22px] text-primary leading-[1.3]">Restorative Walk: Managing Stress in Nature</h3>
                  <p className="featured-desc text-[14px] text-secondary leading-relaxed">Join lead eco-therapists and clinical wellness advisors for a morning sensory walk through regional reservation paths.</p>
                  <div className="featured-footer flex items-center justify-between mt-3 pt-5 border-t border-slate-200">
                    <span className="featured-meta text-[12px] font-semibold text-muted">9:00 AM — 11:30 AM</span>
                    <a href="#" className="btn-primary btn-sm bg-primary text-white px-4 py-2 rounded-full font-semibold text-xs border border-primary hover:bg-transparent hover:text-primary transition-all duration-500">Reserve Spot</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="contact" className="cta-section py-[120px] bg-white text-center relative">
        <div className="container">
          <div className="cta-content max-w-[700px] mx-auto flex flex-col items-center gap-6 reveal-slide">
            <h2 className="cta-title font-heading font-extrabold text-[36px] md:text-[54px] text-primary tracking-[-2px] leading-[1.1]">Subscribe to our newsletter</h2>
            <p className="cta-subtitle text-[15px] md:text-[17px] text-secondary leading-relaxed mb-3">Join 50,000+ wellness readers receiving expert medical guidelines directly in their inbox every week.</p>
            
            <form
              className="newsletter-form-main flex flex-col sm:flex-row w-full max-w-[560px] gap-4 mb-2"
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for subscribing to A Health Place!');
              }}
            >
              <input
                type="email"
                placeholder="Enter your email address"
                required
                className="newsletter-input-main flex-grow bg-bg-light border border-slate-200 rounded-full px-7 py-4 text-sm outline-none text-primary transition-all duration-300 focus:border-accent focus:bg-white focus:shadow-[0_0_0_4px_rgba(31,185,251,0.1)]"
              />
              <button type="submit" className="btn-primary btn-large hover-glow bg-primary text-white px-9 py-4 rounded-full font-bold text-[15px] border border-primary hover:bg-transparent hover:text-primary transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(26,26,46,0.12)]">
                Subscribe
              </button>
            </form>
            <p className="form-disclaimer text-[12px] text-muted">Zero spam. Unsubscribe at any time.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-bg-dark text-white py-20 rounded-t-[40px]">
        <div className="container">
          <div className="footer-grid grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-20 border-b border-white/8 pb-15">
            {/* Logo and Info */}
            <div className="footer-brand flex flex-col gap-5">
              <a href="#" className="logo-link-footer inline-block">
                <div className="logo-badge bg-white px-5 py-2.5 rounded-xl inline-flex items-center justify-center transition-transform hover:scale-[1.03]">
                  <Image
                    src="/images/Logo-web.png"
                    alt="A Health Place Logo"
                    width={180}
                    height={36}
                    className="logo-img h-9 w-auto object-contain"
                  />
                </div>
              </a>
              <p className="footer-tagline text-[14px] text-white/60 leading-relaxed max-w-[320px]">Empowering individuals with reliable, medically verified guides to navigate daily physical and emotional health.</p>
            </div>

            {/* Links Grid */}
            <div className="footer-links-group grid grid-cols-1 sm:grid-cols-3 gap-10">
              {/* Categories */}
              <div className="footer-col">
                <h4 className="footer-title font-heading text-[12px] font-semibold uppercase tracking-[2px] text-accent mb-6">Categories</h4>
                <ul className="footer-links list-none flex flex-col gap-3">
                  <li><a href="#" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Physical Health</a></li>
                  <li><a href="#" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Mental Health</a></li>
                  <li><a href="#" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Holistic Ayurveda</a></li>
                  <li><a href="#" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Insurance Mappings</a></li>
                </ul>
              </div>

              {/* Company */}
              <div className="footer-col">
                <h4 className="footer-title font-heading text-[12px] font-semibold uppercase tracking-[2px] text-accent mb-6">Company</h4>
                <ul className="footer-links list-none flex flex-col gap-3">
                  <li><a href="mailto:support@ahealthplace.com" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">support@ahealthplace.com</a></li>
                  <li><a href="#" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">About Our Board</a></li>
                  <li><a href="#" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Contact Support</a></li>
                </ul>
              </div>

              {/* Legal */}
              <div className="footer-col">
                <h4 className="footer-title font-heading text-[12px] font-semibold uppercase tracking-[2px] text-accent mb-6">Legal</h4>
                <ul className="footer-links list-none flex flex-col gap-3">
                  <li><a href="#" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Privacy Policy</a></li>
                  <li><a href="#" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Terms of Service</a></li>
                  <li><a href="#" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Medical Disclaimer</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom flex justify-between items-center pt-10 flex-wrap gap-5">
            <p className="copyright text-[12px] text-white/40 leading-relaxed">© 2026 A Health Place. All rights reserved. Professional medical advice should be sought for any health concerns.</p>
            <div className="footer-bottom-links flex gap-6">
              <a href="#" className="footer-bottom-link text-[12px] text-white/40 no-underline hover:text-white">Privacy Policy</a>
              <a href="#" className="footer-bottom-link text-[12px] text-white/40 no-underline hover:text-white">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
