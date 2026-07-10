'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ResultsChart from '@/components/quiz/ResultsChart';

/**
 * QuizResultsClient
 * Reads the stored result for this quiz slug from localStorage
 * and renders a full report with score ring, insights, and chart.
 */
export default function QuizResultsClient({ quiz, user }) {
  const [result, setResult] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('quiz-results') || '[]');
      const found = stored.find((r) => r.slug === quiz.slug);
      setResult(found || null);
    } catch { setResult(null); }
    setLoaded(true);
  }, [quiz.slug]);

  function getScoreResult(score) {
    if (!quiz.scoring || quiz.scoring[0]?.min === undefined) return null;
    return quiz.scoring.find((s) => score >= s.min && score <= s.max) || quiz.scoring.at(-1);
  }

  const maxScore = quiz.questions.length * 3;

  // ─── No result found ────────────────────────────────────────────────────────
  if (loaded && !result) {
    return (
      <div
        className="min-h-screen pt-28 pb-20 px-4 flex flex-col items-center justify-center text-center"
        style={{ background: 'linear-gradient(180deg, #f0fdfd 0%, #f8fafc 100%)' }}
      >
        <div className="text-[52px] mb-4">🔍</div>
        <h1 className="font-heading font-extrabold text-[26px] text-primary mb-2">No result found</h1>
        <p className="text-secondary text-[14px] mb-6 max-w-sm">
          We couldn't find a saved result for this quiz. Take the quiz first to see your report here.
        </p>
        <Link
          href={`/quizzes/${quiz.slug}`}
          className="px-6 py-3 rounded-full font-bold text-[13.5px] text-white no-underline"
          style={{ background: '#0f7c85' }}
        >
          Take the Quiz
        </Link>
      </div>
    );
  }

  if (!loaded) return null;

  const score = result.score;
  const pct = Math.round((score / maxScore) * 100);
  const scoreResult = getScoreResult(score);

  // Build chart bars per question
  const bars = quiz.questions.map((q, i) => {
    const ans = result.answers?.[i];
    const s = ans ? (typeof ans.score === 'object' ? Math.max(...Object.values(ans.score)) : ans.score) : 0;
    return {
      label: `Q${i + 1}`,
      score: s,
      maxScore: 3,
      color: scoreResult?.color || '#0f7c85',
    };
  });

  return (
    <div
      className="min-h-screen pt-24 pb-20 px-4"
      style={{ background: 'linear-gradient(180deg, #f0fdfd 0%, #f8fafc 100%)' }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-muted mb-8">
          <Link href="/quizzes" className="hover:text-primary transition-colors no-underline">Quizzes</Link>
          <span>/</span>
          <Link href="/quizzes/dashboard" className="hover:text-primary transition-colors no-underline">Dashboard</Link>
          <span>/</span>
          <span className="text-primary font-medium">{quiz.title}</span>
        </div>

        {/* Results card */}
        <div
          className="bg-white rounded-[28px] overflow-hidden shadow-xl mb-6"
          style={{ border: '1.5px solid rgba(15,124,133,0.12)' }}
        >
          <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${scoreResult?.color || '#0f7c85'}, #1fb9fb, #27ae60)` }} />

          <div className="px-8 py-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="text-[36px]">{quiz.icon}</div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[2px] text-muted mb-0.5">Results Report</p>
                <h1 className="font-heading font-extrabold text-[22px] text-primary tracking-tight">{quiz.title}</h1>
              </div>
            </div>

            {/* Score ring + label */}
            <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
              {/* Ring */}
              <div className="relative w-36 h-36 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={scoreResult?.color || '#0f7c85'}
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1) 0.3s' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading font-extrabold text-[28px]" style={{ color: scoreResult?.color || '#0f7c85' }}>
                    {pct}%
                  </span>
                  <span className="text-[10px] text-muted">{score}/{maxScore}</span>
                </div>
              </div>

              {/* Insight */}
              <div className="flex-1 text-center sm:text-left">
                {scoreResult && (
                  <>
                    <div
                      className="inline-block text-[12px] font-bold px-3 py-1 rounded-full mb-3"
                      style={{ background: scoreResult.color + '18', color: scoreResult.color }}
                    >
                      {scoreResult.label}
                    </div>
                    <p className="text-[14px] text-secondary leading-relaxed">{scoreResult.insight}</p>
                  </>
                )}
                <p className="text-[11px] text-muted mt-3">
                  Completed {new Date(result.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Per-question breakdown */}
            <div>
              <h2 className="font-heading font-bold text-[16px] text-primary mb-4">Answer Breakdown</h2>
              <ResultsChart bars={bars} accentColor={scoreResult?.color || '#0f7c85'} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/quizzes/dashboard"
            className="flex-1 py-3 text-center rounded-full font-bold text-[13.5px] text-white no-underline hover:opacity-90 transition-all"
            style={{ background: 'linear-gradient(135deg, #0f7c85, #0c646b)' }}
          >
            Back to Dashboard
          </Link>
          <Link
            href={`/quizzes/${quiz.slug}`}
            className="flex-1 py-3 text-center rounded-full font-bold text-[13.5px] no-underline border border-slate-200 hover:bg-slate-50 transition-all"
            style={{ color: '#0f7c85' }}
          >
            Retake Quiz
          </Link>
          <Link
            href="/quizzes"
            className="flex-1 py-3 text-center rounded-full font-bold text-[13.5px] no-underline border border-slate-200 hover:bg-slate-50 transition-all"
            style={{ color: '#4a4a5a' }}
          >
            More Quizzes
          </Link>
        </div>
      </div>
    </div>
  );
}
