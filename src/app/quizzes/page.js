'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import BackdropBlobs from '@/components/BackdropBlobs';
import QuizCard from '@/components/quiz/QuizCard';
import { quizzes } from '@/data/quizzes';
import Link from 'next/link';

export default function QuizzesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Wellness', 'Sleep', 'Mental Health', 'Nutrition', 'Ayurveda'];

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesCategory = activeCategory === 'All' || quiz.category === activeCategory;
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
          <div className="container max-w-4xl mx-auto px-4 relative z-10">
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

            {/* Modern Search Input */}
            <div className="max-w-md mx-auto relative mb-6">
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

        {/* ── QUIZ SECTION ───────────────────────────────────────────────── */}
        <section className="py-12 px-4">
          <div className="container max-w-6xl mx-auto">
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2.5 mb-12">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="px-6 py-2.5 rounded-full font-bold text-[13px] transition-all duration-300 cursor-pointer"
                    style={{
                      backgroundColor: isActive ? '#0f7c85' : '#ffffff',
                      color: isActive ? '#ffffff' : '#4a4a5a',
                      border: isActive ? '1px solid #0f7c85' : '1px solid #e2e8f0',
                      boxShadow: isActive ? '0 8px 16px rgba(15,124,133,0.15)' : 'none',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Quizzes Grid */}
            {filteredQuizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredQuizzes.map((quiz) => (
                  <QuizCard key={quiz.slug} quiz={quiz} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-[24px] border border-slate-200/50">
                <div className="text-[48px] mb-4">🔍</div>
                <h3 className="font-heading font-extrabold text-[18px] text-primary">No Quizzes Found</h3>
                <p className="text-secondary text-[13px] mt-1">Try resetting your search query or filters.</p>
              </div>
            )}

            {/* ── SAVE PROGRESS NOTICE ───────────────────────────────── */}
            <div
              className="mt-14 rounded-[24px] p-6 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left border border-slate-200/50 bg-white"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-[20px]"
                style={{ background: '#e8f4ff' }}
              >
                📊
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
                  href="/login"
                  className="bg-[#0f7c85] hover:bg-[#0c6b73] text-white px-5 py-2.5 rounded-full font-bold text-[13px] no-underline transition-colors"
                >
                  Sign In Free
                </Link>
                <Link
                  href="/quizzes/dashboard"
                  className="bg-slate-50 hover:bg-slate-100 text-[#0f7c85] border border-slate-200 px-5 py-2.5 rounded-full font-bold text-[13px] no-underline transition-colors"
                >
                  My Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
