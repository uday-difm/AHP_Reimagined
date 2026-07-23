'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import BackdropBlobs from '@/components/BackdropBlobs';
import QuizIcon from '@/components/quiz/QuizIcon';
import Link from 'next/link';
import Image from 'next/image';

// ─── DB-driven Quiz Card ──────────────────────────────────────────────────────

function QuizCard({ quiz }) {
  const [hovered, setHovered] = useState(false);

  const difficultyColors = {
    Beginner:     { bg: '#e8f8f0', text: '#27ae60' },
    Intermediate: { bg: '#fff8e8', text: '#f39c12' },
    Advanced:     { bg: '#fdecea', text: '#e05248' },
  }[quiz.difficulty] || { bg: '#e8f8f0', text: '#27ae60' };

  const hasImage = !!quiz.imageUrl;

  return (
    <Link
      href={`/quizzes/${quiz.slug}`}
      target="_blank"
      className="group block no-underline h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="h-full bg-white rounded-[24px] overflow-hidden border border-slate-200/50 flex flex-col transition-all duration-500"
        style={{
          boxShadow: hovered
            ? '0 20px 35px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.03)'
            : '0 10px 25px rgba(0,0,0,0.03), 0 2px 6px rgba(0,0,0,0.01)',
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        }}
      >
        {/* Cover Image */}
        <div className="relative h-[220px] w-full overflow-hidden bg-slate-100">
          {hasImage ? (
            <Image
              src={quiz.imageUrl}
              alt={quiz.title}
              fill
              className="object-cover transition-transform duration-700 ease-out"
              style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            /* Fallback gradient when no image */
            <div
              className="w-full h-full flex items-center justify-center text-[64px]"
              style={{ background: `linear-gradient(135deg, ${quiz.categoryColor}33 0%, ${quiz.categoryColor}11 100%)` }}
            >
              {quiz.icon || '📋'}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />

          {/* Category badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md backdrop-blur-md border border-white/20"
              style={{ backgroundColor: 'rgba(255,255,255,0.95)', color: '#1a1a2e' }}>
              {quiz.category}
            </span>
          </div>

          {/* Time */}
          <div className="absolute bottom-4 left-4 z-10 text-white flex items-center gap-1.5 text-[10.5px] font-bold bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
            </svg>
            <span>{quiz.estimatedMinutes} Mins Read</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col flex-1">
          <h3 className="card-title text-[#1a2a35] mb-3 transition-colors duration-300 group-hover:text-[#0f7c85]">
            {quiz.title}
          </h3>
          <p className="description text-secondary mb-6 flex-1">
            {quiz.description}
          </p>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{ backgroundColor: difficultyColors.bg, color: difficultyColors.text }}>
                {quiz.difficulty}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {quiz.questionCount} Questions
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#0f7c85] font-extrabold text-[12.5px] uppercase tracking-wider transition-all duration-300">
              <span className="group-hover:mr-1 transition-all">Play Quiz</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                style={{ backgroundColor: hovered ? '#0f7c85' : '#f0fdfd', color: hovered ? '#fff' : '#0f7c85' }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuizzesPage() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [searchQuery, setSearchQuery] = useState('');
  // DB-driven quiz types with questionCount already filtered to ≥1
  const [quizTypes, setQuizTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  useEffect(() => {
    fetch('/api/quizzes/types')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setQuizTypes(Array.isArray(data) ? data : []))
      .catch(() => setQuizTypes([]))
      .finally(() => setLoadingTypes(false));
  }, []);

  const filtered = searchQuery.trim()
    ? quizTypes.filter((q) => {
        const lc = searchQuery.toLowerCase();
        return (
          q.title.toLowerCase().includes(lc) ||
          q.description.toLowerCase().includes(lc) ||
          (q.category || '').toLowerCase().includes(lc)
        );
      })
    : quizTypes;

  return (
    <>
      <ScrollReveal />
      <BackdropBlobs />
      <Header />

      <main className="min-h-screen bg-[#f8fafc] relative">
        {/* ── HERO ── */}
        <section
          className="pt-[140px] pb-12 border-b border-slate-200/20 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, rgba(240,246,243,0.8) 0%, rgba(248,250,252,1) 100%)' }}
        >
          <div className="container mx-auto px-4 relative z-10">
            <span className="text-[#0f7c85] text-[11px] font-extrabold uppercase tracking-[3px] mb-3 block">
              ✦ Interactive Fun Zone ✦
            </span>
            <h1 className="main-heading text-[#1e2a35] mb-5">
              Take a Quiz and Test <br />
              <span className="text-[#0f7c85]">Your Wellness Knowledge</span>
            </h1>
            <p className="description text-[#4a4a5a] max-w-2xl mx-auto mb-10">
              Pick a category below and discover actionable insights about sleep quality, stress indices, nutrition, gut health, and Ayurvedic dosha mind-body constitution.
            </p>
            <div className="max-w-2xl mx-auto relative mb-6">
              <input
                type="text"
                placeholder="Search wellness quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-full border border-slate-200 bg-white text-[14px] text-primary focus:outline-none focus:ring-2 focus:ring-[#0f7c85]/20 focus:border-[#0f7c85] transition-all"
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}
              />
              <span className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
          </div>
        </section>

        {/* ── QUIZ GRID ── */}
        <section className="py-12 px-4">
          <div className="container mx-auto px-4">
            {!isAuthenticated ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center my-12">
                {/* Left: perks */}
                <div className="text-left space-y-6">
                  <span className="text-[#0f7c85] text-[11px] font-extrabold uppercase tracking-[3px] bg-[#0f7c85]/10 px-3.5 py-1.5 rounded-full w-max inline-block">
                    Exclusive Member Benefits
                  </span>
                  <h2 className="main-heading text-[#1e2a35]">
                    Unlock Your Personalized <br />
                    <span className="text-[#0f7c85]">Wellness Dashboard</span>
                  </h2>
                  <p className="description text-secondary">
                    Take control of your health. Create a free account to access our interactive wellness checks, save your scores, and receive advisor-vetted insights.
                  </p>
                  <div className="space-y-4 pt-2">
                    {[
                      { t: 'Interactive Health Checks', d: 'Evaluate sleep patterns, stress resilience, and biophilic dosha maps.' },
                      { t: 'Secure Progress Logs', d: 'Track score metrics over time and save trends to your dashboard.' },
                      { t: 'Empathetic Advising Matches', d: 'Receive tailored advice based on your unique wellness profiles.' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-[#e8f8f0] text-[#27ae60] flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-heading font-bold text-[15px] text-[#1e2a35]">{item.t}</h4>
                          <p className="text-[13px] text-secondary mt-0.5">{item.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: login gate */}
                <div className="flex justify-center lg:justify-end">
                  <div className="w-full max-w-[440px] aspect-square flex flex-col justify-center items-center bg-white border border-slate-200/60 rounded-[32px] p-8 md:p-10 text-center shadow-lg">
                    <div className="w-14 h-14 rounded-full bg-[#0f7c85]/10 text-[#0f7c85] flex items-center justify-center mb-6">
                      <QuizIcon name="general-wellness" className="w-7 h-7" />
                    </div>
                    <h3 className="card-title text-primary mb-3">Login Required</h3>
                    <p className="description text-secondary mb-8 max-w-xs mx-auto">
                      Please sign in to view all wellness quizzes, evaluate your profile, and track your scores.
                    </p>
                    <Link
                      href="/login?callbackUrl=/quizzes"
                      className="bg-[#0f7c85] hover:bg-[#0c6b73] text-white px-8 py-3.5 rounded-full font-bold text-[14px] no-underline transition-all block shadow-sm w-full"
                    >
                      Login to Continue
                    </Link>
                  </div>
                </div>
              </div>
            ) : loadingTypes ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 rounded-full border-4 border-[#0f7c85]/20 border-t-[#0f7c85] animate-spin" />
              </div>
            ) : filtered.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((quiz) => (
                    <QuizCard key={quiz.id} quiz={quiz} />
                  ))}
                </div>

                {/* Save progress notice */}
                <div
                  className="mt-14 rounded-[24px] p-6 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left border border-slate-200/50 bg-white"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: '#e8f4ff' }}>
                    <QuizIcon name="dashboard" className="w-5 h-5 text-[#0f7c85]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-heading font-bold text-[15px] text-primary mb-0.5">Save your wellness progress</p>
                    <p className="text-[13px] text-secondary">Complete any quiz and keep track of your wellness profile. No hidden charges.</p>
                  </div>
                  <Link href="/quizzes/dashboard"
                    className="bg-slate-50 hover:bg-slate-100 text-[#0f7c85] border border-slate-200 px-5 py-2.5 rounded-full font-bold text-[13px] no-underline transition-colors shrink-0">
                    My Dashboard
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-[24px] border border-slate-200/50">
                <div className="text-[48px] mb-4">{searchQuery ? '🔍' : '📋'}</div>
                <h3 className="font-heading font-extrabold text-[18px] text-primary">
                  {searchQuery ? 'No Quizzes Found' : 'No Quizzes Available'}
                </h3>
                <p className="text-secondary text-[13px] mt-1">
                  {searchQuery ? 'Try a different search term.' : 'Check back soon — quizzes are being added.'}
                </p>
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}
                    className="mt-4 text-[13px] font-bold text-[#0f7c85] hover:underline">
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
