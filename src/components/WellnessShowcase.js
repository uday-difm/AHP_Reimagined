'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import QuizIcon from '@/components/quiz/QuizIcon';

const getQuizEmoji = (slug = "") => {
  const s = String(slug).toLowerCase();
  if (s.includes("sleep")) return "🌙";
  if (s.includes("stress") || s.includes("burnout")) return "🧠";
  if (s.includes("dosha") || s.includes("ayurveda") || s.includes("body-type")) return "🌿";
  if (s.includes("nutrition") || s.includes("diet") || s.includes("gut")) return "🥗";
  return "📋";
};

const DEFAULT_CONTENT = {
  enabled: true,
  headline: 'Know your body,\none quiz at a time.',
  subtext:
    'Our clinically informed quizzes help you understand your health from the inside out — covering sleep, stress, nutrition, and Ayurvedic wellness. Start free, go deeper with a free account.',
  badges: ['Clinically Informed', 'Personalised Insights', 'Private & Secure'],
  heroTag: 'Daily Wellness Quiz',
  heroTitle: 'Test yourself today.',
  heroBody:
    'Take a quick 5-minute assessment and discover actionable insights about your sleep, stress, nutrition, or Ayurvedic body type — all backed by clinical research.',
  heroPrimaryLabel: 'Browse All Quizzes',
  heroPrimaryLink: '/quizzes',
  heroSecondaryLabel: 'Start Now →',
  heroSecondaryLink: '/quizzes/sleep-quality',
  quickCards: [
    {
      tag: 'Daily Quiz',
      icon: '🌅',
      desc: 'A fresh 5-question wellness check, updated every day.',
      link: '/quizzes/sleep-quality',
    },
    {
      tag: 'Stress Check',
      icon: '🧠',
      desc: 'Measure your mental load and unlock targeted breathing guides.',
      link: '/quizzes/stress-burnout',
    },
    {
      tag: 'Nutrition IQ',
      icon: '🥗',
      desc: 'Rate your diet quality and get personalised food insights.',
      link: '/quizzes/nutrition-gut',
    },
  ],
  snapshot: {
    title: "Your Today's Wellness Snapshot",
    sleep: 78,
    stress: 62,
    nutrition: 72,
    hydration: 48,
    score: 72,
  },
  healthyBite: {
    title: 'Healthy Bite of the Day',
    recipeName: 'Quinoa & Avocado Power Bowl',
    image: '/images/healthy_bite.png',
    points: ['High in Protein', 'Gut Friendly', 'Quick & Easy'],
    recipeLink: '/blogs/quinoa-avocado-power-bowl',
    time: '15 mins',
    calories: '320 kcal',
  },
  wellnessTip: {
    title: 'Daily Wellness Tip',
    quote: 'A 10-minute walk after meals can improve digestion and boost your energy.',
    linkText: 'Learn more →',
    linkUrl: '/blogs/benefits-of-walking',
  },
  popularQuizzes: [
    {
      title: 'Sleep Quality Assessment',
      duration: '5 min',
      image: '/images/physical_health.png',
      link: '/quizzes/sleep-quality',
    },
    {
      title: 'Stress & Mental Wellness Check',
      duration: '5 min',
      image: '/images/ayurveda.png',
      link: '/quizzes/stress-burnout',
    },
    {
      title: 'Nutrition & Diet Evaluation',
      duration: '5 min',
      image: '/images/mag_mindfulness.png',
      link: '/quizzes/nutrition-gut',
    },
    {
      title: 'Ayurvedic Body Type Quiz',
      duration: '5 min',
      image: '/images/dosha-body-type.png',
      link: '/quizzes/dosha-body-type',
    },
  ],
  progressTracker: {
    title: 'Track Your Progress',
    chartValues: [30, 45, 58, 80],
    btnLabel: 'Go to Dashboard →',
    btnLink: '/quizzes/dashboard',
  },
};

export default function WellnessShowcase({ content }) {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  // State for dynamically loaded active quizzes
  const [dbQuizzes, setDbQuizzes] = useState([]);

  useEffect(() => {
    fetch('/api/quizzes/types')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (data && data.length > 0) {
          const fallbackImages = {
            'sleep-quality': '/images/physical_health.png',
            'stress-burnout': '/images/ayurveda.png',
            'nutrition-gut': '/images/mag_mindfulness.png',
            'dosha-body-type': '/images/dosha-body-type.png',
          };
          const mapped = data.map(q => ({
            title: q.title,
            duration: `${q.estimatedMinutes || 5} min`,
            image: q.imageUrl || fallbackImages[q.slug] || '/images/dosha-body-type.png',
            link: `/quizzes/${q.slug}`
          }));
          setDbQuizzes(mapped);
        }
      })
      .catch(err => console.error('Error loading db popular quizzes:', err));
  }, []);

  // Merge dynamic content with defaults
  const cmsQuizzes = content?.popularQuizzes?.length > 0 ? content.popularQuizzes : DEFAULT_CONTENT.popularQuizzes;
  
  // Use database quizzes if present, padded/backed up by CMS/default quizzes if less than 4
  let displayQuizzes = [...dbQuizzes];
  if (displayQuizzes.length < 4) {
    const defaultQuizzesToPad = cmsQuizzes.filter(
      dq => !displayQuizzes.some(dbq => dbq.link === dq.link)
    );
    displayQuizzes = [...displayQuizzes, ...defaultQuizzesToPad].slice(0, 4);
  } else {
    displayQuizzes = displayQuizzes.slice(0, 4);
  }

  const c = {
    ...DEFAULT_CONTENT,
    ...content,
    quickCards: content?.quickCards?.length > 0 ? content.quickCards : DEFAULT_CONTENT.quickCards,
    snapshot: { ...DEFAULT_CONTENT.snapshot, ...content?.snapshot },
    healthyBite: { ...DEFAULT_CONTENT.healthyBite, ...content?.healthyBite },
    wellnessTip: { ...DEFAULT_CONTENT.wellnessTip, ...content?.wellnessTip },
    popularQuizzes: displayQuizzes,
    progressTracker: { ...DEFAULT_CONTENT.progressTracker, ...content?.progressTracker },
  };

  if (c.enabled === false) return null;

  // Render headline with \n → <br />
  const headlineLines = (c.headline || '').split('\n');

  // Overall Score Circular Progress Calculations
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((c.snapshot.score || 0) / 100) * circumference;

  // Render customized SVG path for the progress tracker line chart
  const getChartPath = (values) => {
    if (!values || values.length === 0) return '';
    const width = 180;
    const height = 60;
    const maxVal = Math.max(...values, 100);
    const points = values.map((val, idx) => {
      const x = (idx / (values.length - 1)) * width + 10;
      const y = height - (val / maxVal) * (height - 20) - 10;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  return (
    <section id="wellness-dashboard" className="py-20 bg-slate-50/50 rounded-b-[40px] border-b border-slate-100">
      <div className="container mx-auto px-4">
        
        {/* Header Grid: Title, intro text & badges */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16 relative">
          
          {/* Header Left (6 cols) */}
          <div className="lg:col-span-6 space-y-6 reveal-slide z-10">
            <h2 className="font-heading font-extrabold text-3xl md:text-5xl text-primary tracking-[-1.5px] leading-[1.1] mb-2">
              {headlineLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < headlineLines.length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p className="text-secondary text-sm md:text-base leading-relaxed max-w-lg">
              {c.subtext}
            </p>
            
            {/* Header Badges List */}
            <div className="flex flex-wrap gap-3.5 pt-2">
              {(c.badges || DEFAULT_CONTENT.badges).map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200/80 rounded-full text-xs font-bold text-slate-700 shadow-xs">
                  {idx === 0 && (
                    <svg className="w-3.5 h-3.5 text-[#0f7c85]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                  )}
                  {idx === 1 && (
                    <svg className="w-3.5 h-3.5 text-[#0f7c85]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  )}
                  {idx === 2 && (
                    <svg className="w-3.5 h-3.5 text-[#0f7c85]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  )}
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Header Right — Graphic background woman headshot (6 cols) */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end relative">
            <div className="relative w-80 h-72 rounded-[40px] overflow-hidden bg-gradient-to-tr from-[#c8e8e7] to-teal-50 shadow-md border border-white">
              {/* Overlay graphics */}
              <div className="absolute inset-0 bg-radial-gradient(from 70% 30%, transparent, rgba(15,124,133,0.05))" />
              <img
                src="/images/wellness_avatar.png"
                alt="Mindfulness Serene Woman"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* ── ROW 1: Hero Quiz & 3 Quick Cards ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Daily Quiz Hero Card */}
          <div
            className="lg:col-span-2 rounded-[32px] p-8 md:p-10 flex flex-col justify-between items-center text-center relative overflow-hidden h-[400px] reveal-slide"
            style={{ background: 'linear-gradient(145deg, #dceeed 0%, #c8e8e7 100%)', border: '1px solid rgba(15,124,133,0.15)' }}
          >
            <div className="flex flex-col items-center max-w-md z-10">
              <span className="text-[#0f7c85] font-extrabold text-xs uppercase tracking-[2.5px] mb-3.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0f7c85] animate-pulse inline-block" />
                {c.heroTag}
              </span>
              <h3 className="text-primary font-heading font-extrabold text-2xl md:text-3xl leading-tight tracking-tight mb-4">
                {c.heroTitle}
              </h3>
              <p className="text-[#4a4a5a] text-[13.5px] md:text-[14.5px] leading-relaxed mb-6">
                {c.heroBody}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={c.heroPrimaryLink}
                  className="bg-[#0f7c85] hover:bg-[#0c646b] text-white font-bold text-[12.5px] py-3 px-6 rounded-full transition-all duration-300 no-underline shadow-sm"
                >
                  {c.heroPrimaryLabel}
                </Link>
                <Link
                  href={c.heroSecondaryLink}
                  className="bg-white hover:bg-slate-50 text-[#0f7c85] font-bold text-[12.5px] py-3 px-6 rounded-full transition-all duration-300 no-underline shadow-sm border border-[#0f7c85]/20"
                >
                  {c.heroSecondaryLabel}
                </Link>
              </div>
            </div>
            {/* SVG Floating ring decoration */}
            <div className="absolute bottom-[-60px] w-40 h-40 z-0 opacity-20 pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#0f7c85" strokeWidth="8" strokeDasharray="140 124" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Quick Quiz Cards Column */}
          <div className="flex flex-col gap-4 justify-between reveal-slide">
            {c.quickCards.map((item, idx) => (
              <Link
                key={idx}
                href={item.link || '#'}
                className="bg-[#eaf1f0] hover:bg-[#e0e9e8] rounded-[24px] p-5 flex items-center justify-between gap-4 border border-slate-100/50 hover:shadow-md transition-all duration-300 group no-underline text-left flex-1"
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <div className="w-10 h-10 rounded-full bg-[#0f7c85]/10 text-[#0f7c85] flex items-center justify-center shrink-0">
                    <QuizIcon name={item.icon} className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[#0f7c85] font-extrabold text-[10px] uppercase tracking-wider">{item.tag}</span>
                    <p className="text-primary font-heading font-bold text-[13px] leading-snug">{item.desc}</p>
                  </div>
                </div>
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 text-[#0f7c85]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── ROW 2: Snapshot, Recipe Card, Daily Wellness Tip ────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 reveal-slide">
          
          {/* Card 2.1: Wellness Snapshot */}
          <div className="bg-white rounded-[28px] p-6 border border-slate-200/60 shadow-xs flex flex-col justify-between h-[380px]">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight mb-5 border-b pb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0f7c85]" />
                {c.snapshot.title}
              </h3>
              
              <div className="space-y-4">
                {[
                  { name: 'Sleep Quality', val: c.snapshot.sleep, color: 'bg-gradient-to-r from-violet-500 to-indigo-500' },
                  { name: 'Stress Level', val: c.snapshot.stress, color: 'bg-gradient-to-r from-emerald-400 to-teal-500' },
                  { name: 'Nutrition Score', val: c.snapshot.nutrition, color: 'bg-gradient-to-r from-amber-400 to-orange-500' },
                  { name: 'Hydration', val: c.snapshot.hydration, color: 'bg-gradient-to-r from-sky-400 to-blue-500' },
                ].map((bar, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{bar.name}</span>
                      <span>{bar.val}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                      <div className={`h-full ${bar.color} rounded-full transition-all duration-500`} style={{ width: `${bar.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Circular score chart overlay */}
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <div className="text-xs text-slate-450 leading-snug">
                <span className="font-extrabold text-slate-800 block text-sm">Overall Wellness</span>
                Keep going! Small steps count.
              </div>
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 80 80" className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="transparent"
                    stroke="#0f7c85"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center flex flex-col items-center">
                  <span className="text-base font-extrabold text-slate-800 leading-none">{c.snapshot.score}</span>
                  <span className="text-[10px] font-bold text-slate-400">/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2.2: Healthy Bite of the Day */}
          <div className="bg-white rounded-[28px] border border-slate-200/60 shadow-xs flex flex-col overflow-hidden h-[380px]">
            {/* Full-bleed recipe cover image */}
            <div className="relative h-[155px] bg-slate-50 w-full overflow-hidden shrink-0 border-b">
              {c.healthyBite.image ? (
                <img 
                  src={c.healthyBite.image} 
                  alt={c.healthyBite.recipeName} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-500/10 to-teal-500/20">
                <span className="text-4xl">🥗</span>
              </div>
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full shadow-sm text-[10px] font-extrabold text-slate-800 tracking-wider uppercase flex items-center gap-1.5 border border-slate-100/80">
                <span className="text-red-400">❤️</span> {c.healthyBite.title}
              </div>
            </div>

            {/* Content area */}
            <div className="p-4.5 flex-1 flex flex-col justify-between min-h-[200px]">
              <div>
                <h4 className="font-heading font-extrabold text-[15px] md:text-base text-slate-800 leading-tight mb-2.5">
                  {c.healthyBite.recipeName}
                </h4>
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {(c.healthyBite.points || []).map((pt, i) => (
                    <span key={i} className="inline-flex items-center gap-0.5 bg-[#0f7c85]/5 text-[#0f7c85] text-[10px] md:text-[11px] font-extrabold px-2 py-0.5 rounded-md border border-[#0f7c85]/10 shadow-3xs">
                      ✓ {pt}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <span className="flex items-center gap-1">⏱ {c.healthyBite.time}</span>
                  <span className="flex items-center gap-1">🔥 {c.healthyBite.calories}</span>
                </div>
                <Link
                  href={c.healthyBite.recipeLink}
                  className="block w-full bg-[#0f7c85] hover:bg-[#0c646b] text-white text-center py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm no-underline hover:scale-[1.01]"
                >
                  View Recipe →
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2.3: Daily Wellness Tip */}
          <div className="bg-[#e8f5f4] rounded-[28px] p-6 border border-[#cbebe7]/80 shadow-xs flex flex-col justify-between h-[380px]">
            <h3 className="text-xs font-extrabold text-[#0f7c85] tracking-widest uppercase flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-[#0f7c85]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a3 3 0 110-6h0a3 3 0 110 6h0zM12 18a.75.75 0 110-1.5h0a.75.75 0 010 1.5z" />
              </svg>
              {c.wellnessTip.title}
            </h3>
            
            <div className="flex-1 flex flex-col justify-center relative my-auto py-4">
              <span className="absolute top-2 -left-3 text-7xl text-[#0f7c85]/10 font-serif leading-none select-none">“</span>
              <p className="text-primary font-heading font-bold text-[15px] md:text-[16px] leading-relaxed relative z-10 text-slate-800">
                {c.wellnessTip.quote}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-[#cbebe7] pt-4 mt-2">
              <span className="text-[10px] font-bold text-[#0f7c85]/70 uppercase tracking-wider">Expert Mindset</span>
              <Link href={c.wellnessTip.linkUrl} className="text-[#0f7c85] font-extrabold text-xs hover:underline flex items-center gap-1 no-underline">
                {c.wellnessTip.linkText}
              </Link>
            </div>
          </div>
        </div>

        {/* ── ROW 3: Popular Quizzes & Track Progress ────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 reveal-slide">
          
          {/* Explore Popular Health Quizzes (3 cols) */}
          <div className="lg:col-span-3 border border-slate-200/60 rounded-[28px] p-6 bg-white flex flex-col justify-between">
            <div className="flex justify-between items-center border-b pb-3 mb-5">
              <h3 className="text-xs font-extrabold text-slate-800 tracking-tight">Explore Popular Health Quizzes</h3>
              <Link href="/quizzes" className="text-xs font-bold text-[#0f7c85] hover:underline no-underline">View All Quizzes →</Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {c.popularQuizzes.map((quiz, i) => (
                <Link
                  key={i}
                  href={quiz.link || '#'}
                  className="group flex flex-col justify-between border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 no-underline bg-slate-50/50 hover:bg-white"
                >
                  <div className="relative h-24 bg-slate-50 overflow-hidden w-full flex items-center justify-center border-b">
                    {quiz.image ? (
                      <img 
                        src={quiz.image} 
                        alt={quiz.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 relative z-10" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0f7c85]/10 to-[#0f7c85]/20">
                      <span className="text-2xl">{getQuizEmoji(quiz.link)}</span>
                    </div>
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-heading font-extrabold text-[12px] text-slate-800 leading-snug line-clamp-2 mb-2 group-hover:text-[#0f7c85] transition-colors">
                        {quiz.title}
                      </h4>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t mt-2">
                      <span className="text-[9px] font-bold text-slate-400">{quiz.duration}</span>
                      <div className="w-6 h-6 bg-[#0f7c85]/10 text-[#0f7c85] group-hover:bg-[#0f7c85] group-hover:text-white rounded-full flex items-center justify-center transition-all shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Track Your Progress line chart card (1 col) */}
          <div className="border border-slate-200/60 rounded-[28px] p-5 bg-[#fafbfe] flex flex-col justify-between shadow-xs">
            <div>
              <h3 className="text-[11px] font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5 uppercase tracking-wider mb-4 border-b pb-2">
                📊 {c.progressTracker.title}
              </h3>
              
              {/* Dynamic SVG Sparkline Line Chart */}
              <div className="flex items-center justify-center py-4 bg-white rounded-2xl border mb-4">
                <svg width="200" height="70" className="overflow-visible">
                  {/* Subtle Gridlines */}
                  <line x1="10" y1="10" x2="190" y2="10" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="2" />
                  <line x1="10" y1="35" x2="190" y2="35" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="2" />
                  <line x1="10" y1="60" x2="190" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="2" />
                  
                  {/* Gradient Area Fill */}
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f7c85" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0f7c85" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  <path
                    d={`${getChartPath(c.progressTracker.chartValues)} L 190,60 L 10,60 Z`}
                    fill="url(#chartGrad)"
                  />
                  
                  {/* The Line */}
                  <path
                    d={getChartPath(c.progressTracker.chartValues)}
                    fill="none"
                    stroke="#0f7c85"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Dot points */}
                  {c.progressTracker.chartValues.map((val, idx) => {
                    const width = 180;
                    const height = 70;
                    const maxVal = Math.max(...c.progressTracker.chartValues, 100);
                    const cx = (idx / (c.progressTracker.chartValues.length - 1)) * width + 10;
                    const cy = height - (val / maxVal) * (height - 20) - 10;
                    return (
                      <g key={idx}>
                        <circle cx={cx} cy={cy} r="4.5" fill="#0f7c85" stroke="white" strokeWidth="1.5" />
                      </g>
                    );
                  })}
                </svg>
              </div>
              
              {/* Chart timeline metrics */}
              <div className="flex justify-between text-[8px] font-bold text-slate-400 px-1 border-b pb-2.5 mb-4">
                <span>WEEK 1</span>
                <span>WEEK 2</span>
                <span>WEEK 3</span>
                <span className="text-[#0f7c85]">THIS WEEK</span>
              </div>
            </div>

            <Link
              href={c.progressTracker.btnLink}
              className="w-full bg-[#1e293b] hover:bg-slate-800 text-white text-center py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm no-underline"
            >
              {c.progressTracker.btnLabel}
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
