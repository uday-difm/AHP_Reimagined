'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { quizzes } from '@/data/quizzes';
import { Hand, CheckCircle, ClipboardList, Hourglass, BarChart2, Beaker, Activity, Moon, Salad, Sparkles, ArrowRight } from 'lucide-react';

/**
 * QuizDashboardClient
 * Reads quiz results from localStorage and renders a dashboard
 * showing history, scores, and recommended next quizzes.
 */
export default function QuizDashboardClient({ user }) {
  const [results, setResults] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('quiz-results') || '[]');
      setResults(stored);
    } catch { setResults([]); }
    setLoaded(true);
  }, []);

  const completedSlugs = results.map((r) => r.slug);
  const remaining = quizzes.filter((q) => !completedSlugs.includes(q.slug));

  function getScoreLabel(quiz, score) {
    if (!quiz?.scoring) return null;
    if (quiz.scoring[0]?.min !== undefined) {
      return quiz.scoring.find((s) => score >= s.min && score <= s.max) || quiz.scoring.at(-1);
    }
    return null;
  }

  function getMaxScore(slug) {
    const q = quizzes.find((x) => x.slug === slug);
    return q ? q.questions.length * 3 : 30;
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return '—'; }
  }

  const renderQuizIcon = (quiz) => {
    if (!quiz) return <ClipboardList size={22} />;
    if (quiz.title.includes('Stress')) return <Activity size={22} style={{color: quiz.categoryColor}} />;
    if (quiz.title.includes('Sleep')) return <Moon size={22} style={{color: quiz.categoryColor}} />;
    if (quiz.title.includes('Nutrition')) return <Salad size={22} style={{color: quiz.categoryColor}} />;
    return <Sparkles size={22} style={{color: quiz.categoryColor}} />;
  };

  return (
    <div
      className="min-h-screen pt-24 pb-20 px-4 sm:px-8 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: 'url("/images/Quizzesdashboardbg.png")' }}
    >
      <div className="w-full max-w-[1400px] mx-auto">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[2px] mb-1" style={{ color: '#0f7c85' }}>
              ✦ Your Wellness Dashboard
            </p>
            <h1 className="font-heading font-extrabold text-[32px] md:text-[40px] text-primary tracking-tight leading-tight flex items-center">
              Hello, {user?.name?.split(' ')[0] || 'there'} <Hand size={36} className="text-amber-500 animate-[wave_2s_ease-in-out_infinite] ml-3" />
            </h1>
            <p className="text-secondary text-[14px] mt-1">
              {results.length} quiz{results.length !== 1 ? 'zes' : ''} completed · {remaining.length} remaining
            </p>
          </div>
          <Link
            href="/quizzes"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-[13px] text-white no-underline transition-all duration-300 hover:opacity-90 shrink-0"
            style={{ background: 'linear-gradient(135deg, #0f7c85, #0c646b)' }}
          >
            Browse Quizzes
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Completed', value: results.length, icon: <CheckCircle size={28} color="#27ae60" />, bg: '#e8f8f0', color: '#27ae60' },
            { label: 'Available', value: quizzes.length, icon: <ClipboardList size={28} color="#1fb9fb" />, bg: '#e8f4ff', color: '#1fb9fb' },
            { label: 'Remaining', value: remaining.length, icon: <Hourglass size={28} color="#f39c12" />, bg: '#fff8e8', color: '#f39c12' },
            {
              label: 'Avg Score',
              value: results.length
                ? Math.round(results.reduce((s, r) => s + (r.score / getMaxScore(r.slug)) * 100, 0) / results.length) + '%'
                : '—',
              icon: <BarChart2 size={28} color="#8e44ad" />,
              bg: '#f3eeff',
              color: '#8e44ad',
              isTrend: true
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="backdrop-blur-md rounded-[20px] p-5 flex flex-col gap-1 transition-all duration-300 shadow-md shadow-black/5 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 relative overflow-hidden"
              style={{ background: stat.bg, border: `1px solid ${stat.color}33` }}
            >
              <div className="mb-1">{stat.icon}</div>
              <span className="font-heading font-extrabold text-[26px]" style={{ color: stat.color }}>
                {stat.value}
              </span>
              <span className="text-[11px] text-muted uppercase tracking-wider relative z-10">{stat.label}</span>
              
              {stat.isTrend && results.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 pointer-events-none">
                  <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 40">
                    <polyline 
                      points={results.map((r, idx) => `${(idx / (results.length - 1)) * 100},${35 - ((r.score / getMaxScore(r.slug))) * 30}`).join(' ')} 
                      fill="none" stroke={stat.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" 
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Completed quizzes */}
        {loaded && results.length > 0 && (
          <section className="mb-10">
            <h2 className="font-heading font-bold text-[18px] text-primary mb-4">Completed Quizzes</h2>
            <div className="flex flex-col gap-4">
              {results.map((result, i) => {
                const quiz = quizzes.find((q) => q.slug === result.slug);
                const maxScore = getMaxScore(result.slug);
                const pct = Math.round((result.score / maxScore) * 100);
                const scoreResult = getScoreLabel(quiz, result.score);

                return (
                  <div
                    key={i}
                    className="backdrop-blur-md rounded-[20px] p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300 shadow-md shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 cursor-pointer"
                    style={{ background: (quiz?.categoryBg || '#f0fdfd') + 'e6', border: `1px solid ${scoreResult?.color || '#0f7c85'}44` }}
                  >
                    {/* Icon + info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm"
                      >
                        {renderQuizIcon(quiz)}
                      </div>
                      <div>
                        <p className="font-heading font-bold text-[15px] text-primary">
                          {result.title}
                        </p>
                        <p className="text-[12px] text-muted">{formatDate(result.completedAt)}</p>
                      </div>
                    </div>

                    {/* Score bar */}
                    <div className="flex-1 min-w-[120px]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-bold text-muted">Score</span>
                        <span className="text-[12px] font-extrabold" style={{ color: scoreResult?.color || '#0f7c85' }}>
                          {result.score}/{maxScore}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: scoreResult?.color || '#0f7c85' }}
                        />
                      </div>
                      {scoreResult && (
                        <span
                          className="text-[10px] font-bold mt-1 inline-block px-2 py-0.5 rounded-full"
                          style={{ background: scoreResult.color + '18', color: scoreResult.color }}
                        >
                          {scoreResult.label}
                        </span>
                      )}
                    </div>

                    {/* Retake */}
                    <Link
                      href={`/quizzes/${result.slug}`}
                      className="shrink-0 text-[12px] font-bold no-underline px-4 py-2 rounded-full border border-slate-200 transition-all duration-200 hover:bg-slate-50"
                      style={{ color: '#0f7c85' }}
                    >
                      Retake
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {loaded && results.length === 0 && (
          <div className="text-center py-16 px-4 bg-white/90 backdrop-blur-md rounded-[24px] border border-white shadow-lg shadow-black/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <img src="/images/holistic.png" alt="Start your wellness journey" className="w-48 h-48 object-contain mx-auto mb-4 opacity-90 drop-shadow-sm hover:scale-105 transition-transform duration-500" />
            <h2 className="font-heading font-bold text-[22px] text-primary mb-2">Begin Your Wellness Journey</h2>
            <p className="text-secondary text-[14px] mb-6 max-w-md mx-auto">Take your first wellness quiz to discover actionable insights and track your progress here.</p>
            <Link
              href="/quizzes"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-[13.5px] text-white no-underline"
              style={{ background: 'linear-gradient(135deg, #0f7c85, #0c646b)' }}
            >
              Start a Quiz
            </Link>
          </div>
        )}

        {/* Recommended next */}
        {remaining.length > 0 && (
          <section>
            <h2 className="font-heading font-bold text-[18px] text-primary mb-4">Try Next</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {remaining.slice(0, 2).map((quiz) => (
                <Link
                  key={quiz.slug}
                  href={`/quizzes/${quiz.slug}`}
                  className="no-underline group flex items-center gap-4 backdrop-blur-md rounded-[20px] p-5 transition-all duration-300 shadow-md shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1"
                  style={{ background: quiz.categoryBg + 'e6', border: `1px solid ${quiz.categoryColor}44` }}
                >
                  <div
                    className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center shrink-0"
                  >
                    {renderQuizIcon(quiz)}
                  </div>
                  <div className="flex-1">
                    <p className="font-heading font-bold text-[14px] text-primary">{quiz.title}</p>
                    <p className="text-[12px] text-muted">{quiz.estimatedMinutes} min · {quiz.questionCount} Qs</p>
                  </div>
                  <div
                    className="w-8 h-8 bg-white shadow-sm rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform"
                  >
                    <svg className="w-3.5 h-3.5" style={{ color: quiz.categoryColor }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
