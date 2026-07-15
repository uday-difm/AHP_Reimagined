'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProgressBar from '@/components/quiz/ProgressBar';
import QuizIcon from '@/components/quiz/QuizIcon';
import { FREE_QUESTION_LIMIT } from '@/data/quizzes';

/**
 * QuizClient — redesigned to match the Earth By Humans quiz interface.
 * Features:
 *  - Split Layout: Left side shows Question card, Right side shows Options and Next button.
 *  - Next Button: Styled green.
 *  - Options: Custom rounded button lists with a radio check circle on the left.
 *  - Locked Tracker Section: A blurred "Track Your Score" segment displayed below the quiz with a "Login Required" card overlay.
 *  - Gating: If unauthenticated, after answering Q2 and clicking Next, the quiz transitions into the inline login gate card.
 */
export default function QuizClient({ quiz }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === 'authenticated';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showGate, setShowGate] = useState(status === 'unauthenticated');

  const questions = quiz?.questions ?? [];
  const currentQ = questions[currentIndex] ?? null;
  const isLastQuestion = questions.length > 0 && currentIndex === questions.length - 1;
  const firstLockedIndex = FREE_QUESTION_LIMIT;


  // Restore progress from sessionStorage after returning from login
  useEffect(() => {
    const saved = sessionStorage.getItem(`quiz-progress-${quiz.slug}`);
    if (saved && isAuthenticated) {
      try {
        const { savedIndex, savedAnswers } = JSON.parse(saved);
        if (savedAnswers.length > 0) {
          setAnswers(savedAnswers);
          setCurrentIndex(savedIndex);
          setShowGate(false);
          sessionStorage.removeItem(`quiz-progress-${quiz.slug}`);
        }
      } catch { /* ignore */ }
    }
  }, [isAuthenticated, quiz.slug]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setShowGate(true);
    } else if (status === 'authenticated') {
      setShowGate(false);
    }
  }, [status]);

  // Guard: no questions available (must be after all hooks)
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-secondary text-[14px]">Loading quiz questions…</p>
        </div>
      </div>
    );
  }

  const handleSelect = (idx) => {
    if (animating || showGate) return;
    setSelected(idx);
  };

  const handleNext = useCallback(() => {
    if (selected === null || animating || showGate) return;

    const option = currentQ.options[selected];
    const newAnswers = [
      ...answers,
      { questionId: currentQ.id, optionIndex: selected, score: option.score },
    ];

    const nextIndex = currentIndex + 1;
    const nextIsLocked = nextIndex >= firstLockedIndex && !isAuthenticated;

    setAnimating(true);
    setAnswers(newAnswers);

    setTimeout(() => {
      if (isLastQuestion) {
        saveResults(newAnswers);
        setCompleted(true);
      } else {
        setCurrentIndex(nextIndex);
        setSelected(null);
        if (nextIsLocked) {
          sessionStorage.setItem(
            `quiz-progress-${quiz.slug}`,
            JSON.stringify({ savedIndex: nextIndex, savedAnswers: newAnswers })
          );
          setShowGate(true);
        }
      }
      setAnimating(false);
    }, 300);
  }, [selected, animating, showGate, currentQ, answers, currentIndex, firstLockedIndex, isAuthenticated, isLastQuestion, quiz.slug]);

  const handleBack = useCallback(() => {
    if (currentIndex === 0 || animating) return;
    setShowGate(false);
    setAnimating(true);
    setTimeout(() => {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const prevAnswer = answers[prevIdx];
      setSelected(prevAnswer ? prevAnswer.optionIndex : null);
      setAnswers(prev => prev.slice(0, -1));
      setAnimating(false);
    }, 250);
  }, [currentIndex, animating, answers]);

  function saveResults(finalAnswers) {
    const totalScore = computeScore(finalAnswers);
    const result = {
      slug: quiz.slug,
      title: quiz.title,
      score: totalScore,
      answers: finalAnswers,
      completedAt: new Date().toISOString(),
    };
    try {
      const existing = JSON.parse(localStorage.getItem('quiz-results') || '[]');
      const filtered = existing.filter(r => r.slug !== quiz.slug);
      localStorage.setItem('quiz-results', JSON.stringify([result, ...filtered]));
    } catch { /* ignore */ }
  }

  function computeScore(finalAnswers) {
    return finalAnswers.reduce((sum, a) => {
      const s = a.score;
      return sum + (typeof s === 'object' ? Math.max(...Object.values(s)) : (s || 0));
    }, 0);
  }

  const handleLoginRedirect = () => {
    const callbackUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
    router.push(`/login?callbackUrl=${callbackUrl}`);
  };

  // ─── COMPLETED SCREEN ────────────────────────────────────────────────────────
  if (completed) {
    const totalScore = computeScore(answers);
    const maxPossible = questions.length * 3;
    return (
      <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center px-4 py-24">
        <div className="w-full max-w-lg bg-white rounded-[28px] overflow-hidden border border-slate-200/60 shadow-lg">
          <div className="h-1.5 w-full bg-[#0f7c85]" />
          <div className="px-8 py-10 text-center">
            <div className="text-[52px] mb-4">🎉</div>
            <h2 className="font-heading font-extrabold text-[26px] text-primary tracking-tight mb-2">Quiz Complete!</h2>
            <p className="text-secondary text-[14px] mb-8">{quiz.title}</p>
            <div className="text-[48px] font-extrabold text-[#0f7c85] mb-8">
              {totalScore} <span className="text-[20px] text-slate-400">/{maxPossible}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/quizzes/dashboard" className="flex-1 py-3 rounded-full font-bold text-[13.5px] text-white text-center no-underline bg-[#0f7c85] hover:bg-[#0c6b73] transition-colors">
                View Dashboard
              </Link>
              <Link href="/quizzes" className="flex-1 py-3 rounded-full font-bold text-[13.5px] text-center no-underline border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                More Quizzes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light pt-24 pb-20 px-4">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-accent text-[11px] font-extrabold uppercase tracking-[3px] mb-2 block">
            {quiz.category} Quiz
          </span>
          <h1 className="text-primary font-heading font-extrabold text-2xl md:text-3xl tracking-tight mb-2">
            {quiz.title}
          </h1>
          <p className="text-secondary text-[14px]">Test your knowledge and gain valuable insights</p>
        </div>

        {/* ── INTERACTIVE SPLIT QUIZ CARD ────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mb-16">
          {showGate ? (
            /* Locked Gate Screen */
            <div className="col-span-2 relative bg-white border border-slate-200/60 rounded-[24px] overflow-hidden p-8 md:p-12 text-center shadow-sm min-h-[380px] flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-[#0f7c85]/10 text-[#0f7c85]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-[2px] text-[#0f7c85] mb-2">
                Question {currentIndex + 1} is locked
              </span>
              <h3 className="font-heading font-extrabold text-[22px] text-primary mb-2">Sign in to continue</h3>
              <p className="text-secondary text-[13.5px] max-w-sm mb-6">
                Please log in to unlock all {questions.length} questions and save your score.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs justify-center">
                <button
                  onClick={handleLoginRedirect}
                  className="bg-[#0f7c85] hover:bg-[#0c6b73] text-white px-8 py-3 rounded-full font-bold text-[14px] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={handleBack}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-6 py-3 rounded-full font-bold text-[13px] transition-colors cursor-pointer"
                >
                  Go Back
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Left Column: Question Card */}
              <div
                className="bg-[#f3f4f6] rounded-[24px] p-6 flex flex-col justify-between border border-slate-200/50 shadow-sm transition-all duration-300"
                style={{
                  opacity: animating ? 0 : 1,
                  transform: animating ? 'translateX(-10px)' : 'translateX(0)',
                }}
              >
                <div>
                  <h4 className="text-[12px] font-extrabold text-slate-500 uppercase tracking-wider mb-8">
                    Question:
                  </h4>
                  <div className="bg-white rounded-[16px] p-6 border border-slate-200/40 shadow-sm">
                    <p className="font-heading font-bold text-[16px] md:text-[18px] text-primary leading-relaxed">
                      {currentQ.text}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>Question {currentIndex + 1} of {questions.length}</span>
                </div>
              </div>

              {/* Right Column: Options & Submit */}
              <div
                className="bg-white border border-slate-200/60 rounded-[24px] p-6 flex flex-col justify-between shadow-sm transition-all duration-300"
                style={{
                  opacity: animating ? 0 : 1,
                  transform: animating ? 'translateX(10px)' : 'translateX(0)',
                }}
              >
                {/* Options List */}
                <div className="flex flex-col gap-3">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selected === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        className="w-full text-left px-5 py-4 rounded-[16px] text-[13.5px] transition-all duration-150 border flex items-center gap-4.5 cursor-pointer bg-white"
                        style={{
                          borderColor: isSelected ? '#0f7c85' : '#e2e8f0',
                          boxShadow: isSelected ? '0 4px 12px rgba(15, 124, 133, 0.05)' : 'none',
                        }}
                      >
                        {/* Custom Radio check button */}
                        <div
                          className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-150"
                          style={{
                            borderColor: isSelected ? '#0f7c85' : '#cbd5e1',
                            borderWidth: isSelected ? '5px' : '1px',
                          }}
                        />
                        <span
                          className="font-medium"
                          style={{ color: isSelected ? '#1a1a2e' : '#4a4a5a' }}
                        >
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Submit row */}
                <div className="mt-8 flex items-center justify-between">
                  <button
                    onClick={handleBack}
                    disabled={currentIndex === 0}
                    className="text-[13px] font-bold text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={selected === null}
                    className="bg-[#0f7c85] hover:bg-[#0c6b73] disabled:opacity-50 text-white font-bold text-[13.5px] px-8 py-2.5 rounded-full transition-all cursor-pointer shadow-sm"
                  >
                    {isLastQuestion ? 'Finish Quiz' : 'Next'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── LOCKED / UNLOCKED SCOREBOARD AREA ─────────────────────────────── */}
        {!showGate && (
          !isAuthenticated ? (
            <div className="relative border-t border-slate-200/80 pt-16 mt-8">
              {/* Blurry dashboard background */}
              <div className="filter blur-md select-none pointer-events-none opacity-40">
                <h2 className="text-center font-heading font-extrabold text-[24px] mb-8 text-primary">Track Your Score</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { l: 'Correct Answers', v: '0/0', c: '#cbd5e1' },
                    { l: 'Daily Streak', v: '0 Days', c: '#cbd5e1' },
                    { l: 'Completion Rate', v: '0%', c: '#cbd5e1' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-[20px] p-6 border border-slate-200/60 text-center">
                      <span className="text-[24px] font-extrabold block text-slate-400 mb-1">{stat.v}</span>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider">{stat.l}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-white h-48 rounded-[24px] border border-slate-200/60 p-6 flex flex-col justify-end">
                  <div className="h-1 bg-slate-100 w-full rounded-full" />
                </div>
              </div>

              {/* Scoreboard title centered on top */}
              <div className="absolute top-8 left-0 right-0 text-center pointer-events-none z-10">
                <h2 className="font-heading font-extrabold text-[26px] text-slate-400/80">Track Your Score</h2>
              </div>

              {/* Centered Login Required Modal */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-sm">
                <div className="bg-white border border-slate-200/60 rounded-[24px] p-8 text-center shadow-lg">
                  {/* Green lock circle icon */}
                  <div className="w-12 h-12 rounded-full border border-[#0f7c85] flex items-center justify-center mx-auto mb-4 text-[#0f7c85]">
                    <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>

                  <h3 className="font-heading font-bold text-[18px] text-primary mb-1">Login Required</h3>
                  <p className="text-secondary text-[13px] leading-relaxed mb-6">
                    You need to log in to view this content and track your quiz score.
                  </p>

                  <button
                    onClick={handleLoginRedirect}
                    className="bg-[#0f7c85] hover:bg-[#0c6b73] text-white px-8 py-2.5 rounded-full font-bold text-[13.5px] transition-colors cursor-pointer w-full"
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Unlocked Scoreboard / Dashboard link */
            <div className="mt-14 max-w-4xl mx-auto">
              <div className="bg-[#0f7c85] text-white rounded-[24px] p-8 md:p-10 shadow-md relative overflow-hidden">
                <div className="absolute right-[-40px] bottom-[-40px] w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
                <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-[2px] text-white/70 mb-2">YOUR WELLNESS JOURNEY</span>
                  <h2 className="font-heading font-extrabold text-[24px] md:text-[28px] mb-3 leading-tight">
                    Track your health over time.
                  </h2>
                  <p className="text-white/85 text-[13.5px] leading-relaxed max-w-md mb-8">
                    Welcome back! You are signed in. View your past quiz scores, track your wellness progress, and see detailed reports in your private dashboard.
                  </p>

                  <div className="flex gap-10 mb-8 border-y border-white/10 py-4 w-full justify-center">
                    <div className="text-center">
                      <span className="text-[20px] font-extrabold block">5</span>
                      <span className="text-[10px] uppercase text-white/60 tracking-wider">Quizzes</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[20px] font-extrabold block">3</span>
                      <span className="text-[10px] uppercase text-white/60 tracking-wider">Free Qs</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[20px] font-extrabold block">∞</span>
                      <span className="text-[10px] uppercase text-white/60 tracking-wider">Insights</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link
                      href="/quizzes/dashboard"
                      className="bg-white text-[#0f7c85] hover:bg-slate-100 px-6 py-2.5 rounded-full font-bold text-[13.5px] no-underline transition-all shadow-sm"
                    >
                      My Dashboard
                    </Link>
                    <Link
                      href="/quizzes"
                      className="border border-white/20 hover:bg-white/10 text-white px-6 py-2.5 rounded-full font-bold text-[13.5px] no-underline transition-all"
                    >
                      All Quizzes
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
