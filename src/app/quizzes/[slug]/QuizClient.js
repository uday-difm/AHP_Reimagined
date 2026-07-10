'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoginWallModal from '@/components/quiz/LoginWallModal';
import ProgressBar from '@/components/quiz/ProgressBar';
import { FREE_QUESTION_LIMIT } from '@/data/quizzes';

/**
 * QuizClient — the interactive quiz engine.
 * Gate logic:
 *  - Questions 1…FREE_QUESTION_LIMIT: always accessible
 *  - After answering the last free question and clicking Next → LoginWallModal appears if not signed in
 *  - Signed-in users play all questions uninterrupted
 */
export default function QuizClient({ quiz }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === 'authenticated';

  const [currentIndex, setCurrentIndex] = useState(0);       // 0-based
  const [answers, setAnswers] = useState([]);                 // { questionId, optionIndex, score }
  const [selected, setSelected] = useState(null);            // option index for current q
  const [showWall, setShowWall] = useState(false);
  const [animating, setAnimating] = useState(false);         // slide animation flag
  const [slideDir, setSlideDir] = useState('right');         // 'right' | 'left'
  const [completed, setCompleted] = useState(false);

  const questions = quiz.questions;
  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isOnLastFreeQuestion = currentIndex === FREE_QUESTION_LIMIT - 1; // 0-based index of Q2

  // On mount: restore progress from sessionStorage if user just returned from login
  useEffect(() => {
    const saved = sessionStorage.getItem(`quiz-progress-${quiz.slug}`);
    if (saved && isAuthenticated) {
      try {
        const { savedIndex, savedAnswers } = JSON.parse(saved);
        if (savedAnswers.length > 0) {
          setAnswers(savedAnswers);
          setCurrentIndex(savedIndex);
          sessionStorage.removeItem(`quiz-progress-${quiz.slug}`);
        }
      } catch { /* ignore */ }
    }
  }, [isAuthenticated, quiz.slug]);

  const handleSelect = (optionIndex) => {
    if (animating) return;
    setSelected(optionIndex);
  };

  const handleNext = useCallback(() => {
    if (selected === null || animating) return;

    const option = currentQ.options[selected];
    const newAnswers = [
      ...answers,
      { questionId: currentQ.id, optionIndex: selected, score: option.score },
    ];

    // Check if gate should fire: user answered the last free question and is NOT authenticated
    const justFinishedLastFreeQ = isOnLastFreeQuestion && !isAuthenticated;

    if (justFinishedLastFreeQ) {
      // Save progress to sessionStorage so we can restore after login
      sessionStorage.setItem(
        `quiz-progress-${quiz.slug}`,
        JSON.stringify({ savedIndex: currentIndex + 1, savedAnswers: newAnswers })
      );
      setAnswers(newAnswers);
      setShowWall(true);
      return;
    }

    // Animate transition
    setSlideDir('right');
    setAnimating(true);
    setAnswers(newAnswers);

    setTimeout(() => {
      if (isLastQuestion) {
        // Save final results
        saveResults(newAnswers);
        setCompleted(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelected(null);
      }
      setAnimating(false);
    }, 350);
  }, [selected, animating, currentQ, answers, isOnLastFreeQuestion, isAuthenticated,
    isLastQuestion, currentIndex, quiz.slug]);

  const handleBack = useCallback(() => {
    if (currentIndex === 0 || animating) return;
    setSlideDir('left');
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => prev - 1);
      // Restore previously selected answer
      const prevAnswer = answers[currentIndex - 1];
      setSelected(prevAnswer ? prevAnswer.optionIndex : null);
      setAnswers((prev) => prev.slice(0, -1));
      setAnimating(false);
    }, 350);
  }, [currentIndex, animating, answers]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
      if (e.key === 'ArrowLeft') handleBack();
      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        if (idx < currentQ.options.length) handleSelect(idx);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNext, handleBack, currentQ]);

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
      const filtered = existing.filter((r) => r.slug !== quiz.slug);
      localStorage.setItem('quiz-results', JSON.stringify([result, ...filtered]));
    } catch { /* ignore */ }
  }

  function computeScore(finalAnswers) {
    return finalAnswers.reduce((sum, a) => {
      const s = a.score;
      return sum + (typeof s === 'object' ? Math.max(...Object.values(s)) : (s || 0));
    }, 0);
  }

  function getScoreLabel(score) {
    if (!quiz.scoring) return null;
    // Standard scoring
    if (quiz.scoring[0]?.min !== undefined) {
      return quiz.scoring.find((s) => score >= s.min && score <= s.max) || quiz.scoring[quiz.scoring.length - 1];
    }
    // Dosha quiz
    return null;
  }

  // ─── Completed Screen ───────────────────────────────────────────────────────
  if (completed) {
    const totalScore = computeScore(answers);
    const scoreResult = getScoreLabel(totalScore);
    const maxPossible = questions.length * 3;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-24"
        style={{ background: 'linear-gradient(180deg, #f0fdfd 0%, #f8fafc 100%)' }}>
        <div className="w-full max-w-xl bg-white rounded-[28px] shadow-xl overflow-hidden"
          style={{ border: '1.5px solid rgba(15,124,133,0.12)' }}>
          <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #0f7c85, #1fb9fb, #27ae60)' }} />
          <div className="px-8 py-10 text-center">
            {/* Trophy */}
            <div className="text-[52px] mb-4 select-none">🎉</div>
            <h2 className="font-heading font-extrabold text-[26px] text-primary tracking-tight mb-2">
              Quiz Complete!
            </h2>
            <p className="text-secondary text-[14px] mb-8">{quiz.title}</p>

            {/* Score ring */}
            <div className="relative w-28 h-28 mx-auto mb-6">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke={scoreResult?.color || '#0f7c85'}
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - totalScore / maxPossible)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1) 0.3s' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-heading font-extrabold text-[22px]" style={{ color: scoreResult?.color || '#0f7c85' }}>
                  {totalScore}
                </span>
                <span className="text-[10px] text-muted">/{maxPossible}</span>
              </div>
            </div>

            {scoreResult && (
              <>
                <div
                  className="inline-block text-[13px] font-bold px-4 py-1.5 rounded-full mb-4"
                  style={{ background: scoreResult.color + '18', color: scoreResult.color }}
                >
                  {scoreResult.label}
                </div>
                <p className="text-[14px] text-secondary leading-relaxed mb-8 max-w-sm mx-auto">
                  {scoreResult.insight}
                </p>
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/quizzes/dashboard"
                className="flex-1 py-3 rounded-full font-bold text-[13.5px] text-white text-center no-underline transition-all duration-300 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #0f7c85, #0c646b)' }}
              >
                View Dashboard
              </Link>
              <Link
                href="/quizzes"
                className="flex-1 py-3 rounded-full font-bold text-[13.5px] text-center no-underline border border-slate-200 transition-all duration-300 hover:bg-slate-50"
                style={{ color: '#0f7c85' }}
              >
                More Quizzes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Quiz Engine ─────────────────────────────────────────────────────────────
  return (
    <>
      {showWall && <LoginWallModal quizTitle={quiz.title} />}

      <div
        className="min-h-screen flex flex-col"
        style={{ background: 'linear-gradient(180deg, #f0fdfd 0%, #f8fafc 100%)' }}
      >
        {/* Top bar */}
        <div className="pt-24 pb-4 px-4">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <Link href="/quizzes" className="flex items-center gap-1.5 text-[12px] text-muted no-underline hover:text-primary transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                All Quizzes
              </Link>

              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{ background: quiz.categoryBg, color: quiz.categoryColor }}
                >
                  {quiz.category}
                </span>
                {/* Free badge */}
                {currentIndex < FREE_QUESTION_LIMIT && !isAuthenticated && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: '#fff8e8', color: '#f39c12' }}>
                    Free Preview
                  </span>
                )}
              </div>
            </div>

            <h1 className="font-heading font-extrabold text-[22px] text-primary tracking-tight mb-4">
              {quiz.title}
            </h1>

            <ProgressBar
              current={currentIndex + 1}
              total={questions.length}
              color={quiz.categoryColor}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="flex-1 flex items-start justify-center px-4 py-8">
          <div
            className="w-full max-w-xl bg-white rounded-[28px] overflow-hidden shadow-xl"
            style={{
              border: '1.5px solid rgba(15,124,133,0.10)',
              opacity: animating ? 0 : 1,
              transform: animating
                ? `translateX(${slideDir === 'right' ? '-24px' : '24px'})`
                : 'translateX(0)',
              transition: 'opacity 0.35s ease, transform 0.35s ease',
            }}
          >
            <div className="h-1" style={{ background: `linear-gradient(90deg, ${quiz.categoryColor}, ${quiz.categoryColor}55)` }} />

            <div className="px-7 pt-8 pb-6">
              {/* Question number */}
              <div className="text-[11px] font-extrabold uppercase tracking-[2px] mb-3" style={{ color: quiz.categoryColor }}>
                Question {currentIndex + 1}
              </div>

              {/* Question text */}
              <h2 className="font-heading font-bold text-[20px] md:text-[22px] text-primary leading-snug tracking-tight mb-7">
                {currentQ.text}
              </h2>

              {/* Options */}
              <div className="flex flex-col gap-3 mb-8">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selected === idx;
                  return (
                    <button
                      key={idx}
                      id={`quiz-option-${idx}`}
                      onClick={() => handleSelect(idx)}
                      className="w-full text-left px-5 py-4 rounded-[16px] font-medium text-[14px] transition-all duration-200 border cursor-pointer"
                      style={{
                        background: isSelected ? (quiz.categoryColor + '12') : '#f8fafc',
                        borderColor: isSelected ? quiz.categoryColor : '#e2e8f0',
                        color: isSelected ? '#1a1a2e' : '#4a4a5a',
                        boxShadow: isSelected ? `0 0 0 2px ${quiz.categoryColor}40` : 'none',
                        transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Option letter circle */}
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 transition-all duration-200"
                          style={{
                            background: isSelected ? quiz.categoryColor : '#e2e8f0',
                            color: isSelected ? '#ffffff' : '#4a4a5a',
                          }}
                        >
                          {['A', 'B', 'C', 'D'][idx]}
                        </span>
                        {opt.label}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBack}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 text-[13px] font-bold text-muted transition-all duration-200 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <button
                  id="quiz-next-btn"
                  onClick={handleNext}
                  disabled={selected === null}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-full font-heading font-bold text-[13.5px] text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${quiz.categoryColor}, ${quiz.categoryColor}cc)` }}
                >
                  {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Free preview hint */}
        {!isAuthenticated && currentIndex < FREE_QUESTION_LIMIT && (
          <div className="pb-10 px-4 text-center">
            <p className="text-[12px] text-muted">
              🔓 {FREE_QUESTION_LIMIT - currentIndex - 1 > 0
                ? `${FREE_QUESTION_LIMIT - currentIndex - 1} free question${FREE_QUESTION_LIMIT - currentIndex - 1 > 1 ? 's' : ''} remaining`
                : 'This is your last free question'} —{' '}
              <Link href="/login" className="font-bold no-underline" style={{ color: '#0f7c85' }}>
                Sign in
              </Link>{' '}
              to unlock all {questions.length}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
