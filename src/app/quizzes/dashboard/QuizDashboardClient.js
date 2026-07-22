'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { quizzes as staticQuizzes } from '@/data/quizzes';
import { Hand, CheckCircle, ClipboardList, Hourglass, BarChart2, Activity, Moon, Salad, Sparkles, Loader2 } from 'lucide-react';

/**
 * QuizDashboardClient
 * Dynamically fetches quiz types, user profile, and completion analytics from the backend API.
 * Conditionally renders sections only when relevant data is present.
 */
export default function QuizDashboardClient({ initialUser }) {
  const [user, setUser] = useState(initialUser || null);
  const [quizTypes, setQuizTypes] = useState(staticQuizzes);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setLoading(true);

      // 1. Fetch user profile if not provided or to get latest
      try {
        const profRes = await fetch('/api/user/profile');
        if (profRes.ok) {
          const profData = await profRes.json();
          if (profData?.data?.user && isMounted) {
            setUser(profData.data.user);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }

      // 2. Fetch dynamic quiz types from backend API
      let dynamicTypes = staticQuizzes;
      try {
        const typesRes = await fetch('/api/quizzes/types');
        if (typesRes.ok) {
          const typesData = await typesRes.json();
          if (Array.isArray(typesData) && typesData.length > 0) {
            const mapped = typesData.map((t) => {
              const matchedStatic = staticQuizzes.find((s) => s.slug === t.slug);
              return {
                id: t.id,
                slug: t.slug,
                title: t.title,
                description: t.description || matchedStatic?.description || '',
                category: t.category || matchedStatic?.category || 'Wellness',
                categoryColor: t.categoryColor || matchedStatic?.categoryColor || '#0f7c85',
                categoryBg: matchedStatic?.categoryBg || '#eaf8f8',
                estimatedMinutes: t.estimatedMinutes || matchedStatic?.estimatedMinutes || 5,
                questionCount: t.questionCount || matchedStatic?.questionCount || 10,
                questions: matchedStatic?.questions || [],
                scoring: matchedStatic?.scoring || [],
              };
            });

            dynamicTypes = mapped;
          }
        }
      } catch (err) {
        console.error('Failed to fetch dynamic quiz types:', err);
      }

      if (isMounted) {
        setQuizTypes(dynamicTypes);
      }

      // 3. Fetch user quiz completion analytics from backend + localStorage fallback
      let userResults = [];

      // Read local storage first
      try {
        const localStored = JSON.parse(localStorage.getItem('quiz-results') || '[]');
        if (Array.isArray(localStored)) userResults = localStored;
      } catch { /* ignore */ }

      // Fetch from backend API
      try {
        const resRes = await fetch('/api/quizess/user-results');
        if (resRes.ok) {
          const resData = await resRes.json();
          if (Array.isArray(resData.results) && resData.results.length > 0) {
            const backendResults = resData.results;
            const merged = [...backendResults];

            userResults.forEach((lr) => {
              if (!merged.some((br) => br.slug === lr.slug)) {
                merged.push(lr);
              }
            });

            userResults = merged;
          }
        }
      } catch (err) {
        console.error('Failed to fetch backend user quiz results:', err);
      }

      if (isMounted) {
        setResults(userResults);
        setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const completedSlugs = results.map((r) => r.slug);
  const remaining = quizTypes.filter((q) => !completedSlugs.includes(q.slug));

  function getScoreLabel(quiz, score) {
    const matchedStatic = staticQuizzes.find((s) => s.slug === quiz?.slug);
    const scoringList = quiz?.scoring?.length ? quiz.scoring : matchedStatic?.scoring;
    if (!scoringList || scoringList.length === 0) return null;
    if (scoringList[0]?.min !== undefined) {
      return scoringList.find((s) => score >= s.min && score <= s.max) || scoringList.at(-1);
    }
    return null;
  }

  function getMaxScore(slug) {
    const q = quizTypes.find((x) => x.slug === slug) || staticQuizzes.find((x) => x.slug === slug);
    if (q?.questions?.length) return q.questions.length * 3;
    return 30;
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return '—'; }
  }

  const renderQuizIcon = (quiz) => {
    const color = quiz?.categoryColor || '#0f7c85';
    if (!quiz) return <ClipboardList size={22} />;
    const title = quiz.title || '';
    if (title.includes('Stress')) return <Activity size={22} style={{ color }} />;
    if (title.includes('Sleep')) return <Moon size={22} style={{ color }} />;
    if (title.includes('Nutrition')) return <Salad size={22} style={{ color }} />;
    return <Sparkles size={22} style={{ color }} />;
  };

  const avgScorePct = results.length
    ? Math.round(
        results.reduce((sum, r) => {
          const max = r.maxScore || getMaxScore(r.slug);
          return sum + (r.score / max) * 100;
        }, 0) / results.length
      )
    : 0;

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
            { label: 'Available', value: quizTypes.length, icon: <ClipboardList size={28} color="#1fb9fb" />, bg: '#e8f4ff', color: '#1fb9fb' },
            { label: 'Remaining', value: remaining.length, icon: <Hourglass size={28} color="#f39c12" />, bg: '#fff8e8', color: '#f39c12' },
            {
              label: 'Avg Score',
              value: results.length ? `${avgScorePct}%` : '—',
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
                {loading ? <Loader2 size={24} className="animate-spin" /> : stat.value}
              </span>
              <span className="text-[11px] text-muted uppercase tracking-wider relative z-10">{stat.label}</span>
              
              {stat.isTrend && results.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 pointer-events-none">
                  <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 40">
                    <polyline 
                      points={results.map((r, idx) => `${(idx / (results.length - 1)) * 100},${35 - ((r.score / (r.maxScore || getMaxScore(r.slug)))) * 30}`).join(' ')} 
                      fill="none" stroke={stat.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" 
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Loading spinner state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/80 backdrop-blur-md rounded-[24px] mb-10">
            <Loader2 size={36} className="animate-spin text-[#0f7c85] mb-3" />
            <p className="text-sm font-medium text-slate-500">Loading your wellness dashboard data...</p>
          </div>
        )}

        {/* Completed Quizzes — Only appears if user has completed 1 or more quizzes */}
        {!loading && results.length > 0 && (
          <section className="mb-10">
            <h2 className="font-heading font-bold text-[18px] text-primary mb-4">Completed Quizzes</h2>
            <div className="flex flex-col gap-4">
              {results.map((result, i) => {
                const quiz = quizTypes.find((q) => q.slug === result.slug) || staticQuizzes.find((q) => q.slug === result.slug);
                const maxScore = result.maxScore || getMaxScore(result.slug);
                const pct = Math.round((result.score / maxScore) * 100);
                const scoreResult = getScoreLabel(quiz, result.score);

                return (
                  <div
                    key={i}
                    className="backdrop-blur-md rounded-[20px] p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300 shadow-md shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 cursor-pointer"
                    style={{ background: (quiz?.categoryBg || '#f0fdfd') + 'e6', border: `1px solid ${scoreResult?.color || quiz?.categoryColor || '#0f7c85'}44` }}
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
                        <span className="text-[12px] font-extrabold" style={{ color: scoreResult?.color || quiz?.categoryColor || '#0f7c85' }}>
                          {result.score}/{maxScore}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: scoreResult?.color || quiz?.categoryColor || '#0f7c85' }}
                        />
                      </div>
                      {scoreResult && (
                        <span
                          className="text-[10px] font-bold mt-1 inline-block px-2.5 py-0.5 rounded-full"
                          style={{ background: (scoreResult.color || '#0f7c85') + '18', color: scoreResult.color || '#0f7c85' }}
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



        {/* Recommended Next — Appears whenever there are uncompleted quizzes available */}
        {!loading && remaining.length > 0 && (
          <section>
            <h2 className="font-heading font-bold text-[18px] text-primary mb-4">Try Next</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {remaining.slice(0, 4).map((quiz) => (
                <Link
                  key={quiz.slug}
                  href={`/quizzes/${quiz.slug}`}
                  className="no-underline group flex items-center gap-4 backdrop-blur-md rounded-[20px] p-5 transition-all duration-300 shadow-md shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1"
                  style={{ background: (quiz.categoryBg || '#eaf8f8') + 'e6', border: `1px solid ${(quiz.categoryColor || '#0f7c85')}44` }}
                >
                  <div
                    className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center shrink-0"
                  >
                    {renderQuizIcon(quiz)}
                  </div>
                  <div className="flex-1">
                    <p className="font-heading font-bold text-[14px] text-primary">{quiz.title}</p>
                    <p className="text-[12px] text-muted">{quiz.estimatedMinutes || 5} min · {quiz.questionCount || 10} Qs</p>
                  </div>
                  <div
                    className="w-8 h-8 bg-white shadow-sm rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform"
                  >
                    <svg className="w-3.5 h-3.5" style={{ color: quiz.categoryColor || '#0f7c85' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
