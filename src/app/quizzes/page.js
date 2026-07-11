'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import BackdropBlobs from '@/components/BackdropBlobs';
import QuizCard from '@/components/quiz/QuizCard';
import QuizIcon from '@/components/quiz/QuizIcon';
import { quizzes } from '@/data/quizzes';
import Link from 'next/link';

export default function QuizzesPage() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [searchQuery, setSearchQuery] = useState('');

  // Only keep the single General Wellness Quiz
  const filteredQuizzes = quizzes.filter(
    (quiz) => quiz.slug === 'general-wellness' &&
    (quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     quiz.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <ScrollReveal />
      <BackdropBlobs />
      <Header />

      <main className="min-h-screen bg-[#f8fafc] relative">
        {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
        <section
          className="pt-[140px] pb-12 border-b border-slate-200/20 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(240, 246, 243, 0.8) 0%, rgba(248, 250, 252, 1) 100%)',
          }}
        >
          <div className="container mx-auto px-4 relative z-10">
            <span className="text-[#0f7c85] text-[11px] font-extrabold uppercase tracking-[3px] mb-3 block">
              ✦ Interactive Fun Zone ✦
            </span>

            <h1 className="text-[#1e2a35] font-heading font-extrabold text-4xl md:text-[54px] tracking-[-1.5px] leading-tight mb-5">
              Take a Quiz and Test <br />
              <span className="text-[#0f7c85]">Your Wellness Knowledge</span>
            </h1>

            <p className="text-[#4a4a5a] text-[15px] md:text-[16.5px] leading-relaxed max-w-2xl mx-auto mb-10">
              Pick a category below and discover actionable insights about sleep quality, stress indices, nutrition gut health, and Ayurvedic dosha mind-body constitution.
            </p>

            {/* Modern Search Input — only for authenticated users */}
            {isAuthenticated && (
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
            )}
          </div>
        </section>

        {/* ── QUIZ SECTION ───────────────────────────────────────────────── */}
        <section className="py-12 px-4">
          <div className="container mx-auto px-4">
            {!isAuthenticated ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center my-12">
                {/* Left: Info Section */}
                <div className="text-left space-y-6">
                  <span className="text-[#0f7c85] text-[11px] font-extrabold uppercase tracking-[3px] bg-[#0f7c85]/10 px-3.5 py-1.5 rounded-full w-max inline-block">
                    Exclusive Member Benefits
                  </span>
                  <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-[#1e2a35] leading-tight">
                    Unlock Your Personalized <br />
                    <span className="text-[#0f7c85]">Wellness Dashboard</span>
                  </h2>
                  <p className="text-secondary text-[15px] leading-relaxed">
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

                {/* Right: Square Login Required Card */}
                <div className="flex justify-center lg:justify-end">
                  <div className="w-full max-w-[440px] aspect-square flex flex-col justify-center items-center bg-white border border-slate-200/60 rounded-[32px] p-8 md:p-10 text-center shadow-lg">
                    <div className="w-14 h-14 rounded-full bg-[#0f7c85]/10 text-[#0f7c85] flex items-center justify-center mb-6">
                      <QuizIcon name="general-wellness" className="w-7 h-7" />
                    </div>
                    <h3 className="font-heading font-bold text-[20px] text-primary mb-3">Login Required</h3>
                    <p className="text-secondary text-[13.5px] leading-relaxed mb-8 max-w-xs mx-auto">
                      Please sign in to view available quizzes, evaluate your wellness profile, and track your scores.
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
            ) : (
              <>
                {/* Quizzes Grid (only showing 1 quiz card centered) */}
                <div className="w-full max-w-4xl mx-auto">
                  {filteredQuizzes.length > 0 ? (
                    <QuizCard quiz={filteredQuizzes[0]} />
                  ) : (
                    <div className="text-center py-16 bg-white rounded-[24px] border border-slate-200/50 w-full">
                      <div className="text-[48px] mb-4">🔍</div>
                      <h3 className="font-heading font-extrabold text-[18px] text-primary">No Quizzes Found</h3>
                      <p className="text-secondary text-[13px] mt-1">Try resetting your search query.</p>
                    </div>
                  )}
                </div>

                {/* ── SAVE PROGRESS NOTICE ───────────────────────────────── */}
                <div
                  className="mt-14 rounded-[24px] p-6 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left border border-slate-200/50 bg-white"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: '#e8f4ff' }}
                  >
                    <QuizIcon name="dashboard" className="w-5 h-5 text-[#0f7c85]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-heading font-bold text-[15px] text-primary mb-0.5">
                      Save your wellness progress
                    </p>
                    <p className="text-[13px] text-secondary">
                      Complete any quiz and keep track of your wellness profile by logging in. No hidden charges.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/quizzes/dashboard"
                      className="bg-slate-50 hover:bg-slate-100 text-[#0f7c85] border border-slate-200 px-5 py-2.5 rounded-full font-bold text-[13px] no-underline transition-colors"
                    >
                      My Dashboard
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
