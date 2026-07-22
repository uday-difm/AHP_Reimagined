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

  // Load results from localStorage on mount and when completed state changes
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('quiz-results') || '[]');
      setLocalResults(stored);
    } catch {
      setLocalResults([]);
    }
  }, [completed]);

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
            .catch(() => {});
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
        // Save progress to restore after login
        try {
          sessionStorage.setItem(
            `quiz-progress-${quiz.slug}`,
            JSON.stringify({ savedIndex: nextIndex, savedAnswers: newAnswers })
          );
        } catch { /* ignore */ }
        setShowGate(true);
      } else if (isLastQuestion) {
        // Save results to localStorage
        const totalScore = newAnswers.reduce((sum, a) => sum + (a.score || 0), 0);
        const result = {
          slug: quiz.slug,
          title: quiz.title,
          score: totalScore,
          answers: newAnswers,
          completedAt: new Date().toISOString(),
        };
        try {
          const existing = JSON.parse(localStorage.getItem('quiz-results') || '[]');
          const filtered = existing.filter(r => r.slug !== quiz.slug);
          localStorage.setItem('quiz-results', JSON.stringify([result, ...filtered]));
        } catch { /* ignore */ }
        setCompleted(true);
      } else {
        setCurrentIndex(nextIndex);
        setSelected(null);
      }
      setAnimating(false);
    }, 300);
  }, [selected, currentQ, answers, currentIndex, isAuthenticated, isLastQuestion, quiz.slug]);

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
      const d2 = new Date(uniqueDates[i+1]);
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
      const qCount = r.answers ? r.answers.length : 0;
      const cCount = r.answers ? r.answers.filter(a => a.score > 1).length : 0;
      totalCorrect += cCount;
      totalQuestions += qCount;
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
            QUICK WELLNESS CHECK
          </span>
          <h2 className="font-heading font-extrabold text-3xl md:text-5xl text-primary tracking-[-1px] leading-[1.15] mb-4">
            Try a quiz, right here.
          </h2>
          <p className="text-secondary text-base md:text-lg leading-relaxed">Test your knowledge and gain valuable insights</p>
        </div>

        {/* ── CENTRAL SPLIT QUIZ CARD (Image 2 style) ────────────────────── */}
        <div className="max-w-6xl mx-auto">

          {/* NOT STARTED */}
          {!started && !showGate && (
            <div
              className="bg-white rounded-[24px] overflow-hidden border border-slate-200/60 p-8 md:p-12 text-center shadow-sm max-w-2xl mx-auto"
            >
              <div className="w-16 h-16 rounded-full bg-[#0f7c85]/10 text-[#0f7c85] flex items-center justify-center mx-auto mb-6">
                <QuizIcon name={quiz.icon} className="w-8 h-8" />
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
          )}

          {/* ACTIVE QUESTION */}
          {started && !showGate && !completed && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

              {/* Left Column: Question Card */}
              <div
                className="bg-[#f3f4f6] rounded-[24px] p-6 flex flex-col justify-between border border-slate-200/50 shadow-sm transition-all duration-300"
                style={{
                  opacity: animating ? 0 : 1,
                  transform: animating ? 'translateX(-10px)' : 'translateX(0)',
                }}
              >
                <div>
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-8">
                    Question:
                  </h4>
                  <div className="bg-white rounded-[16px] p-6 border border-slate-200/40 shadow-sm">
                    <p className="font-heading font-bold text-base md:text-lg text-primary leading-relaxed">
                      {currentQ.text}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>Question {currentIndex + 1} of {questions.length}</span>
                </div>
              </div>

              {/* Middle Column: Options & Next */}
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

                {/* Submit actions */}
                <div className="mt-8 flex items-center justify-between">
                  <button
                    onClick={handleBack}
                    disabled={currentIndex === 0}
                    className="text-sm font-bold text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={selected === null}
                    className="bg-[#0f7c85] hover:bg-[#0c6b73] disabled:opacity-50 text-white font-bold text-[13.5px] px-8 py-2.5 rounded-full transition-all cursor-pointer shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Right Column: Ad Card */}
              <div className="flex w-full">
                <AdSlot zone="homepage-events-bottom" layout="blogCard" className="h-full w-full" />
              </div>

            </div>
          )}

          {/* COMPLETED SCREEN */}
          {completed && (
            <div className="bg-white border border-slate-200/60 rounded-[24px] overflow-hidden p-8 md:p-12 text-center shadow-sm max-w-2xl mx-auto">
              <div className="text-[52px] mb-4">🎉</div>
              <h3 className="font-heading font-extrabold text-xl text-primary mb-2">Quiz Complete!</h3>
              <p className="text-secondary text-sm mb-6">{quiz.title}</p>
              <div className="text-[48px] font-extrabold text-[#0f7c85] mb-8">
                {answers.reduce((sum, a) => sum + (a.score || 0), 0)} <span className="text-[20px] text-slate-400">/{questions.length * 3}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <Link href="/quizzes/dashboard" className="bg-[#0f7c85] hover:bg-[#0c6b73] text-white px-8 py-3 rounded-full font-bold text-sm no-underline text-center transition-colors">
                  View Dashboard
                </Link>
                <Link href="/quizzes" className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-8 py-3 rounded-full font-bold text-sm no-underline text-center transition-colors">
                  More Quizzes
                </Link>
              </div>
            </div>
          )}

          {/* GATED LOCK VIEW */}
          {showGate && !completed && (
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
                Please log in to unlock all {questions.length} questions and save your score.
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

        {/* ── LOCKED / UNLOCKED SCOREBOARD AREA (Image 2 style) ─────────────────── */}
        {!showGate && (
          !isAuthenticated ? (
            <div className="relative border-t border-slate-200/80 pt-16 mt-14 max-w-4xl mx-auto">
              {/* Blurry scoreboard */}
              <div className="filter blur-md select-none pointer-events-none opacity-40">
                <h2 className="text-center font-heading font-extrabold text-2xl mb-8 text-primary">Track Your Score</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { l: 'Correct Answers', v: '0/0' },
                    { l: 'Daily Streak', v: '0 Days' },
                    { l: 'Completion Rate', v: '0%' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-[20px] p-6 border border-slate-200/60 text-center">
                      <span className="text-2xl font-extrabold block text-slate-400 mb-1">{stat.v}</span>
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
                  <h3 className="font-heading font-bold text-lg text-primary mb-1">Login Required</h3>
                  <p className="text-secondary text-sm leading-relaxed mb-6">
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
            /* Unlocked Scoreboard Stats */
            <div className="mt-14 max-w-4xl mx-auto">
              <h2 className="text-center font-heading font-extrabold text-2xl mb-8 text-primary">Track Your Score</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  {
                    l: 'Correct Answers',
                    v: answers.length > 0
                      ? `${answers.filter(a => a.score > 1).length}/${answers.length}`
                      : (() => {
                          const { totalCorrect, totalQuestions } = getCompletedStats(localResults);
                          return totalQuestions > 0 ? `${totalCorrect}/${totalQuestions}` : '0/0';
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
                    <span className="text-2xl font-extrabold block text-[#0f7c85] mb-1">{stat.v}</span>
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
                <Link href="/quizzes/dashboard" className="bg-[#0f7c85] hover:bg-[#0c6b73] text-white px-5 py-2.5 rounded-full font-bold text-sm no-underline transition-all">
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
