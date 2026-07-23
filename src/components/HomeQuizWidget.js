'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { quizzes, FREE_QUESTION_LIMIT } from '@/data/quizzes';
import QuizIcon from '@/components/quiz/QuizIcon';
import AdSlot from '@/components/AdSlot';
import QuizFeedbackModal from '@/components/quiz/QuizFeedbackModal';

/**
 * HomeQuizWidget
 * Redesigned to look EXACTLY like the main quiz page (Image 2 style).
 * Features:
 *  - Centered split layout (no left sidebar/selector).
 *  - Left side shows Question card (grey bg, white text container).
 *  - Right side shows Options (radio circles, green Next button).
 *  - Gating: After Q3 (FREE_QUESTION_LIMIT), shows the inline gate card.
 *  - Locked Tracker Section: A blurred "Track Your Score" segment below the quiz with a "Login Required" card overlay.
 */

// We preview the featured General Wellness Quiz on the home page
const FEATURED_QUIZ_INDEX = 0;

export default function HomeQuizWidget() {
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [started, setStarted] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [dbQuestions, setDbQuestions] = useState(null);
  const [dynamicQuiz, setDynamicQuiz] = useState(null);
  const [localResults, setLocalResults] = useState([]);
  const [typesCount, setTypesCount] = useState(0);
  const [feedback, setFeedback] = useState({
    isOpen: false,
    isCorrect: false,
    correctOption: null,
    explanation: '',
  });

  // Load results from backend API + localStorage fallback on mount and when completed state changes
  useEffect(() => {
    async function fetchUserResults() {
      let merged = [];
      try {
        const stored = JSON.parse(localStorage.getItem('quiz-results') || '[]');
        if (Array.isArray(stored)) merged = [...stored];
      } catch {
        merged = [];
      }

      if (isAuthenticated) {
        try {
          const res = await fetch('/api/quizess/user-results');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.results) && data.results.length > 0) {
              const backendResults = data.results;
              backendResults.forEach((br) => {
                const exists = merged.some(
                  (mr) => (mr.id && String(mr.id) === String(br.id)) || (mr.slug && mr.slug === br.slug)
                );
                if (!exists) {
                  merged.push(br);
                }
              });
            }
          }
        } catch (err) {
          console.error("Failed to load user quiz results:", err);
        }
      }

      setLocalResults(merged);
    }

    fetchUserResults();
  }, [completed, isAuthenticated]);

  const quiz = dynamicQuiz || quizzes[FEATURED_QUIZ_INDEX];

  useEffect(() => {
    fetch('/api/quizess/quiz?category=home-page')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (data && data.length > 0) {
          const formatted = data.map((q) => ({
            id: q._id,
            category: q.category || 'general-wellness',
            text: q.question,
            options: q.options.map((opt, idx) => ({
              label: opt,
              score: idx === q.correctAnswer ? 3 : 0,
            })),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || "",
          }));
          setDbQuestions(formatted);

          // Fetch active quiz types to match the category details
          const firstCat = formatted[0].category;
          fetch('/api/quizzes/types')
            .then((res) => (res.ok ? res.json() : []))
            .then((types) => {
              setTypesCount(types.length);
              const matched = types.find((t) => t.slug === firstCat);
              if (matched) {
                setDynamicQuiz({
                  slug: matched.slug,
                  title: matched.title,
                  description: matched.description || matched.subtitle || "",
                  icon: matched.icon || "📋",
                });
              }
            })
            .catch(() => { });
        } else {
          setDbQuestions([]);
        }
      })
      .catch((err) => {
        console.error("Error loading db quizzes:", err);
        setDbQuestions([]);
      });
  }, []);

  // Restore progress from sessionStorage after returning from login
  useEffect(() => {
    if (quiz?.slug && isAuthenticated) {
      const saved = sessionStorage.getItem(`quiz-progress-${quiz.slug}`);
      if (saved) {
        try {
          const { savedIndex, savedAnswers } = JSON.parse(saved);
          if (savedAnswers && savedAnswers.length > 0) {
            setAnswers(savedAnswers);
            setCurrentIndex(savedIndex);
            setShowGate(false);
            sessionStorage.removeItem(`quiz-progress-${quiz.slug}`);
          }
        } catch { /* ignore */ }
      }
    }
  }, [isAuthenticated, quiz?.slug]);

  const questions = dbQuestions || [];
  const currentQ = questions[currentIndex] || null;
  const isLastQuestion = questions.length > 0 && currentIndex === questions.length - 1;

  const handleSelect = (optIdx) => {
    if (animating || showGate) return;
    setSelected(optIdx);
  };

  const handleNext = useCallback(() => {
    if (!currentQ || selected === null || animating || showGate) return;

    const option = currentQ.options[selected];
    const isCorrect = option.score > 0 || (currentQ.correctAnswer !== undefined && selected === currentQ.correctAnswer);
    const correctOpt = currentQ.options[currentQ.correctAnswer ?? 0] || currentQ.options.find(o => o.score > 0) || currentQ.options[0];

    setFeedback({
      isOpen: true,
      isCorrect,
      correctOption: correctOpt,
      explanation: currentQ.explanation || '',
    });
  }, [selected, animating, showGate, currentQ]);

  const handleFeedbackContinue = useCallback(() => {
    setFeedback(prev => ({ ...prev, isOpen: false }));

    const option = currentQ.options[selected];
    const newAnswers = [...answers, { questionId: currentQ.id, optionIndex: selected, score: option.score }];
    setAnswers(newAnswers);

    const nextIndex = currentIndex + 1;
    const nextIsLocked = nextIndex >= FREE_QUESTION_LIMIT && !isAuthenticated;

    setAnimating(true);
    setTimeout(() => {
      if (nextIsLocked) {
        sessionStorage.setItem(
          `quiz-progress-${quiz.slug}`,
          JSON.stringify({ savedIndex: nextIndex, savedAnswers: newAnswers })
        );
        setShowGate(true);
      } else if (isLastQuestion) {
        setCompleted(true);
        const totalScore = newAnswers.reduce((sum, a) => sum + (a.score || 0), 0);
        const resultRecord = {
          slug: quiz.slug,
          title: quiz.title,
          score: totalScore,
          maxScore: questions.length * 3,
          completedAt: new Date().toISOString(),
          answers: newAnswers,
        };

        try {
          const stored = JSON.parse(localStorage.getItem('quiz-results') || '[]');
          const updated = [resultRecord, ...stored.filter((r) => r.slug !== quiz.slug)];
          localStorage.setItem('quiz-results', JSON.stringify(updated));
          setLocalResults(updated);
        } catch { /* ignore */ }

        if (isAuthenticated) {
          fetch('/api/quizess/user-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slug: quiz.slug,
              title: quiz.title,
              score: totalScore,
              maxScore: questions.length * 3,
            }),
          }).catch(() => { });
        }
      } else {
        setCurrentIndex(nextIndex);
        setSelected(null);
      }
      setAnimating(false);
    }, 300);
  }, [selected, currentQ, answers, currentIndex, isAuthenticated, isLastQuestion, quiz.slug, questions.length, quiz.title]);

  const handleBack = () => {
    if (currentIndex === 0) { setStarted(false); return; }
    setShowGate(false);
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => prev - 1);
      const prevAnswer = answers[currentIndex - 1];
      setSelected(prevAnswer ? prevAnswer.optionIndex : null);
      setAnswers(prev => prev.slice(0, -1));
      setAnimating(false);
    }, 250);
  };

  const handleLoginRedirect = () => {
    const callbackUrl = encodeURIComponent('/');
    router.push(`/login?callbackUrl=${callbackUrl}`);
  };

  const calculateStreak = (results) => {
    if (!results || results.length === 0) return 0;
    const dates = results
      .map(r => {
        try {
          return new Date(r.completedAt).toISOString().split('T')[0];
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
    if (uniqueDates.length === 0) return 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) return 0;

    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const d1 = new Date(uniqueDates[i]);
      const d2 = new Date(uniqueDates[i + 1]);
      const diffTime = Math.abs(d1 - d2);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
      } else if (diffDays > 1) {
        break;
      }
    }
    return streak;
  };

  const getCompletedStats = (results) => {
    let totalCorrect = 0;
    let totalQuestions = 0;
    results.forEach(r => {
      if (r.answers && Array.isArray(r.answers) && r.answers.length > 0) {
        totalCorrect += r.answers.filter(a => a.score > 0 || a.isCorrect).length;
        totalQuestions += r.answers.length;
      } else {
        const correctCount = r.score !== undefined ? Number(r.score) : (r.correct !== undefined ? Number(r.correct) : 0);
        const qCount = r.maxScore !== undefined ? Math.max(1, Number(r.maxScore)) : 10;
        totalCorrect += correctCount;
        totalQuestions += qCount;
      }
    });
    return { totalCorrect, totalQuestions };
  };

  if (dbQuestions === null || dbQuestions.length === 0) return null;

  return (
    <section className="pt-20 pb-10 px-4 bg-[#f8fafc] border-t border-slate-200/40">
      <div className="container max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-accent text-xs font-extrabold uppercase tracking-[3px] mb-2 block">
            FEATURED WELLNESS QUIZ
          </span>
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-primary tracking-tight">
            {quiz.title}
          </h2>
          {quiz.description && (
            <p className="text-secondary text-sm md:text-base mt-2 max-w-xl mx-auto">
              {quiz.description}
            </p>
          )}
        </div>

        {/* Quiz Box (Split Layout) */}
        <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.04)] overflow-hidden max-w-4xl mx-auto">

          {/* Inline Gate Card */}
          {showGate ? (
            <div className="p-8 md:p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-[#0f7c85]/10 text-[#0f7c85] flex items-center justify-center mx-auto mb-5 font-bold text-xl">
                🔒
              </div>
              <h3 className="font-heading font-extrabold text-xl text-primary tracking-tight mb-3">
                {quiz.title}
              </h3>
              <p className="text-secondary text-sm leading-relaxed max-w-md mx-auto mb-8">
                {quiz.description}
              </p>
              <button
                onClick={() => setStarted(true)}
                className="bg-[#0f7c85] hover:bg-[#0c6b73] text-white px-8 py-3.5 rounded-full font-bold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              >
                Start Quiz
              </button>
            </div>
          ) : completed ? (
            /* Completed Screen */
            <div className="p-8 md:p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 text-2xl font-bold">
                ✓
              </div>
              <h3 className="font-heading font-extrabold text-2xl text-primary mb-2">
                Quiz Completed!
              </h3>
              <p className="text-secondary text-sm max-w-md mx-auto mb-6">
                Great job completing the {quiz.title}. Your responses have been saved.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/quizzes/dashboard"
                  className="bg-[#0f7c85] hover:bg-[#0c6b73] text-white px-6 py-3 rounded-full font-bold text-sm no-underline transition-colors"
                >
                  View My Dashboard
                </Link>
                <Link
                  href="/quizzes"
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-full font-bold text-sm no-underline transition-colors"
                >
                  More Quizzes
                </Link>
              </div>
            </div>
          ) : (
            /* Active Quiz Question Screen */
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">

              {/* Left Column: Question */}
              <div className="p-8 md:p-10 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-8">
                    Question:
                  </h4>
                  <div className="bg-white rounded-[16px] p-6 border border-slate-200/40 shadow-sm">
                    <p className="font-heading font-bold text-base md:text-lg text-primary leading-relaxed">
                      {currentQ.text}
                    </p>
                  </div>

                  <h3 className="font-heading font-extrabold text-xl md:text-2xl text-slate-900 leading-snug">
                    {currentQ?.text}
                  </h3>
                </div>

                <div className="mt-8">
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
                    <span>PROGRESS</span>
                    <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0f7c85] transition-all duration-300 rounded-full"
                      style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Options & Action */}
              <div className="p-8 md:p-10 flex flex-col justify-between">
                <div className="space-y-3">
                  {currentQ?.options?.map((opt, idx) => {
                    const isSel = selected === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${isSel
                            ? 'border-[#0f7c85] bg-[#0f7c85]/5 shadow-sm text-slate-900 font-bold'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-medium'
                          }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-150"
                          style={{
                            borderColor: isSelected ? '#0f7c85' : '#cbd5e1',
                            borderWidth: isSelected ? '5px' : '1px',
                          }}
                        />
                        <span className="font-medium" style={{ color: isSelected ? '#1a1a2e' : '#4a4a5a' }}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Footer Buttons */}
                <div className="mt-8 flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleBack}
                    disabled={currentIndex === 0}
                    className="text-sm font-bold text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    Go Back
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={selected === null}
                    className="bg-[#0f7c85] hover:bg-[#0c6b73] disabled:opacity-50 text-white font-bold text-[13.5px] px-8 py-2.5 rounded-full transition-all cursor-pointer shadow-sm"
                  >
                    Next Question →
                  </button>
                </div>
              </div>

              {/* Right Column: Ad Card */}
              <div className="flex w-full">
                <AdSlot zone="homepage-events-bottom" layout="blogCard" className="h-full w-full" />
              </div>

            </div>
          )}

          {/* GATED LOCK VIEW */}
          {showGate && (
            <div className="relative bg-white border border-slate-200/60 rounded-[24px] overflow-hidden p-8 md:p-12 text-center shadow-sm min-h-[380px] flex flex-col items-center justify-center max-w-2xl mx-auto">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-[#0f7c85]/10 text-[#0f7c85]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <span className="text-xs font-extrabold uppercase tracking-[2px] text-[#0f7c85] mb-2">
                Question {currentIndex + 1} is locked
              </span>
              <h3 className="font-heading font-extrabold text-xl text-primary mb-2">Sign in to continue</h3>
              <p className="text-secondary text-[13.5px] max-w-sm mb-6">
                Please log in to unlock all {quiz.questionCount} questions and save your score.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs justify-center">
                <button
                  onClick={handleLoginRedirect}
                  className="bg-[#0f7c85] hover:bg-[#0c6b73] text-white px-8 py-3 rounded-full font-bold text-sm transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={handleBack}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-6 py-3 rounded-full font-bold text-sm transition-colors cursor-pointer"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ── LOCKED / UNLOCKED SCOREBOARD AREA ─────────────────── */}
        {!showGate && (
          !isAuthenticated ? (
            <div className="relative border-t border-slate-200/80 pt-16 mt-14 max-w-4xl mx-auto">
              {/* Blurry scoreboard */}
              <div className="filter blur-md select-none pointer-events-none opacity-40">
                <h2 className="section-heading text-center font-extrabold mb-8 text-primary">Track Your Score</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { l: 'Correct Answers', v: '0/0' },
                    { l: 'Daily Streak', v: '0 Days' },
                    { l: 'Completion Rate', v: '0%' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-[20px] p-6 border border-slate-200/60 text-center">
                      <span className="text-xl font-bold block text-slate-400 mb-1">{stat.v}</span>
                      <span className="text-xs text-slate-400 uppercase tracking-wider">{stat.l}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-white h-32 rounded-[24px] border border-slate-200/60" />
              </div>

              {/* Centered Lock Overlay */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-sm">
                <div className="bg-white border border-slate-200/60 rounded-[24px] p-8 text-center shadow-lg">
                  <div className="w-12 h-12 rounded-full border border-[#0f7c85] flex items-center justify-center mx-auto mb-4 text-[#0f7c85]">
                    <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                  <h3 className="card-title font-bold text-primary mb-1">Login Required</h3>
                  <p className="small-notes text-secondary mb-6">
                    You need to log in to view this content and track your quiz score.
                  </p>
                  <button
                    onClick={handleLoginRedirect}
                    className="bg-[#0f7c85] hover:bg-[#0c6b73] text-white px-8 py-2.5 rounded-full text-sm md:text-base transition-colors cursor-pointer w-full"
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Unlocked Scoreboard Stats */
            <div className="mt-14 max-w-4xl mx-auto">
              <h2 className="section-heading text-center font-extrabold mb-8 text-primary">Track Your Score</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  {
                    l: 'Correct Answers',
                    v: (() => {
                      const { totalCorrect, totalQuestions } = getCompletedStats(localResults);
                      const activeCorrect = answers.filter(a => a.score > 0).length;
                      const activeTotal = answers.length;
                      const finalCorrect = totalCorrect + activeCorrect;
                      const finalTotal = totalQuestions + activeTotal;
                      return finalTotal > 0 ? `${finalCorrect}/${finalTotal}` : '0/0';
                    })()
                  },
                  {
                    l: 'Daily Streak',
                    v: (() => {
                      const streak = calculateStreak(localResults);
                      return `${streak} Day${streak !== 1 ? 's' : ''}`;
                    })()
                  },
                  {
                    l: 'Completion Rate',
                    v: (() => {
                      const total = typesCount || quizzes.length || 1;
                      const rate = Math.min(100, Math.round((localResults.length / total) * 100));
                      return `${rate}%`;
                    })()
                  },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-[20px] p-6 border border-slate-200/60 text-center shadow-sm">
                    <span className="text-xl font-bold block text-[#0f7c85] mb-1">{stat.v}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{stat.l}</span>
                  </div>
                ))}
              </div>

              {/* Dashboard shortcut card */}
              <div className="bg-white rounded-[24px] border border-slate-200/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div className="text-left">
                    <h4 className="font-heading font-bold text-sm text-primary">Wellness Dashboard active</h4>
                    <p className="text-secondary text-xs">Your scores and personalized profiles are stored in your dashboard.</p>
                  </div>
                </div>
                <Link href="/quizzes/dashboard" className="bg-[#0f7c85] hover:bg-[#0c6b73] text-white px-5 py-2.5 rounded-full text-sm md:text-base no-underline transition-all">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )
        )}

      </div>

      <QuizFeedbackModal
        isOpen={feedback.isOpen}
        isCorrect={feedback.isCorrect}
        correctOption={feedback.correctOption}
        explanation={feedback.explanation}
        onContinue={handleFeedbackContinue}
      />
    </section>
  );
}
