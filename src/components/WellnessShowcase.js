'use client';

import Link from 'next/link';
import Button from '@/components/Button';
import { useSession } from 'next-auth/react';
import QuizIcon from '@/components/quiz/QuizIcon';

// Quiz small cards — row 1 right column (light bg)
const quizQuickCards = [
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
];

// Quiz small cards — row 2 left column (teal bg)
const quizDeepCards = [
  {
    tag: 'Sleep Quality',
    icon: '🌙',
    desc: 'Assess your REM cycles, sleep hygiene, and overnight recovery.',
    link: '/quizzes/sleep-quality',
  },
  {
    tag: 'Dosha Discovery',
    icon: '🌿',
    desc: 'Uncover your Ayurvedic mind-body constitution in 10 questions.',
    link: '/quizzes/dosha-body-type',
  },
  {
    tag: 'My Dashboard',
    icon: '📊',
    desc: 'View all your past quiz scores, insights, and progress reports.',
    link: '/quizzes/dashboard',
  },
];

export default function WellnessShowcase() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <section id="about" className="values-section py-[100px] bg-slate-50/50 rounded-b-[40px]">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-grid grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-[60px] mb-16 items-end">
          <div className="reveal-slide">
            <h2 className="section-title-large font-heading font-bold text-[32px] md:text-[54px] leading-[1.15] text-primary tracking-[-1px]">
              Know your body,<br />one quiz at a time.
            </h2>
          </div>
          <div className="reveal-fade">
            <p className="section-subtitle-text text-[16px] text-secondary leading-[1.7]">
              Our clinically informed quizzes help you understand your health from the inside out — covering sleep, stress, nutrition, and Ayurvedic wellness. Start free, go deeper with a{' '}
              <Link href="/login" className="text-accent font-semibold hover:underline transition-colors">
                free account
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Modular Grid Layout */}
        <div className="flex flex-col gap-8">

          {/* Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Large Card: Daily Quiz Hero */}
            <div className="lg:col-span-2 rounded-[32px] p-8 md:p-10 flex flex-col justify-between items-center text-center relative overflow-hidden h-[420px] md:h-[460px] reveal-slide"
              style={{ background: 'linear-gradient(140deg, #dceeed 0%, #c8e8e7 100%)', border: '1px solid rgba(15,124,133,0.15)' }}>

              {/* Decorative blob */}
              <div className="absolute top-[-60px] right-[-60px] w-[220px] h-[220px] rounded-full opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #0f7c85 0%, transparent 70%)' }} />

              <div className="flex flex-col items-center max-w-md z-10">
                <span className="text-[#0f7c85] font-extrabold text-[11px] uppercase tracking-[2.5px] mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0f7c85] animate-pulse inline-block" />
                  Daily Wellness Quiz
                </span>
                <h3 className="text-primary font-heading font-extrabold text-[26px] md:text-[34px] leading-tight tracking-tight mb-4">
                  Test yourself today.
                </h3>
                <p className="text-[#4a4a5a] text-[13.5px] md:text-[14.5px] leading-relaxed mb-6">
                  Take a quick 5-minute assessment and discover actionable insights about your sleep, stress, nutrition, or Ayurvedic body type — all backed by clinical research.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/quizzes" className="bg-[#0f7c85] hover:bg-[#0c646b] text-white font-bold text-[12.5px] py-3 px-6 rounded-full transition-all duration-300 no-underline shadow-sm">
                    Browse All Quizzes
                  </Link>
                  <Link href="/quizzes/sleep-quality" className="bg-white hover:bg-slate-50 text-[#0f7c85] font-bold text-[12.5px] py-3 px-6 rounded-full transition-all duration-300 no-underline shadow-sm border border-[#0f7c85]/20">
                    Start Now →
                  </Link>
                </div>
              </div>

              {/* Decorative floating score ring */}
              <div className="absolute bottom-[-70px] w-[180px] h-[180px] z-0 opacity-30 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#0f7c85" strokeWidth="8" strokeDasharray="140 124" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#27ae60" strokeWidth="8" strokeDasharray="80 184" strokeLinecap="round" strokeDashoffset="-140" />
                </svg>
              </div>
            </div>

            {/* Right Column: 3 Quick Quiz Cards */}
            <div className="flex flex-col gap-4 reveal-slide">
              {quizQuickCards.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.link}
                  className="bg-[#eaf1f0] hover:bg-[#e0e9e8] rounded-[24px] p-5 flex items-center justify-between gap-4 border border-slate-100 hover:shadow-md transition-all duration-300 group no-underline text-left flex-grow"
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
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 border border-slate-100/50 group-hover:scale-105 transition-transform">
                    <svg className="w-4 h-4 text-[#0f7c85]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Row 2 Deep Dive Cards arranged horizontally in a line */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal-slide">
            {quizDeepCards.map((item, idx) => (
              <Link
                key={idx}
                href={item.link}
                className="bg-[#3f9a9e] hover:bg-[#368b8e] rounded-[24px] p-6 flex flex-col justify-between min-h-[150px] hover:shadow-md transition-all duration-300 group no-underline text-left"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <QuizIcon name={item.icon} className="w-5.5 h-5.5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/80 font-extrabold text-[10px] uppercase tracking-wider">{item.tag}</span>
                    <p className="font-heading font-bold text-[14px] text-white leading-snug mt-1">{item.desc}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-4 h-4 text-[#3f9a9e]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Row 3: Large Card Dashboard CTA taking full width */}
          {isAuthenticated ? (
            <div
              className="rounded-[32px] p-8 md:p-10 flex flex-col justify-center items-center text-center relative overflow-hidden min-h-[340px] reveal-slide w-full mt-4"
              style={{ background: 'linear-gradient(140deg, #1c7b80 0%, #155f64 100%)' }}
            >
              {/* Decorative blobs */}
              <div className="absolute top-[-40px] left-[-40px] w-[200px] h-[200px] rounded-full opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }} />
              <div className="absolute bottom-[-60px] right-[-30px] w-[240px] h-[240px] rounded-full opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #27ae60 0%, transparent 70%)' }} />

              <div className="flex flex-col items-center max-w-xl z-10 text-white justify-center h-full">
                <span className="text-white/80 font-extrabold text-[11px] uppercase tracking-[2.5px] mb-3">
                  Your Wellness Journey
                </span>
                <h3 className="font-heading font-extrabold text-[26px] md:text-[34px] leading-tight tracking-tight mb-4 text-white">
                  Track your health over time.
                </h3>
                <p className="text-white/90 text-[13.5px] md:text-[14.5px] leading-relaxed mb-6">
                  Welcome back! You are signed in. View your past quiz scores, track your wellness progress, and see detailed reports in your private dashboard.
                </p>

                {/* Mini stat row */}
                <div className="flex gap-10 mb-6">
                  {[{ v: '4', l: 'Quizzes' }, { v: '3', l: 'Free Qs' }, { v: '∞', l: 'Insights' }].map((s, i) => (
                    <div key={i} className="text-center">
                      <div className="font-heading font-extrabold text-[22px] text-white">{s.v}</div>
                      <div className="text-[10px] text-white/60 uppercase tracking-wider">{s.l}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/quizzes/dashboard" className="bg-white text-[#1c7b80] hover:bg-slate-100 font-bold text-[12.5px] py-3 px-6 rounded-full no-underline transition-all shadow-sm">
                    My Dashboard
                  </Link>
                  <Link href="/quizzes" className="border border-white/40 hover:border-white/80 text-white font-bold text-[12.5px] py-3 px-6 rounded-full no-underline transition-all">
                    All Quizzes
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* If not logged in, show a static promo block matching the EBH style or blur block */
            <div
              className="rounded-[32px] p-8 md:p-10 flex flex-col justify-center items-center text-center relative overflow-hidden min-h-[340px] reveal-slide border border-slate-200 w-full mt-4"
              style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}
            >
              <div className="flex flex-col items-center max-w-md z-10 justify-center h-full">
                <div className="w-12 h-12 rounded-full border border-[#0f7c85] flex items-center justify-center mb-4 text-[#0f7c85]">
                  <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <h3 className="font-heading font-extrabold text-[22px] text-primary mb-1">Login Required</h3>
                <p className="text-secondary text-[13.5px] leading-relaxed mb-6">
                  Sign in to unlock full quiz access, save your results, and track your wellness journey over time.
                </p>
                <Link href="/login" className="bg-[#0f7c85] hover:bg-[#0c6b73] text-white px-8 py-3 rounded-full font-bold text-[13.5px] no-underline transition-colors shadow-sm">
                  Login
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
