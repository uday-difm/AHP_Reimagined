'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, ArrowRight, Lightbulb } from 'lucide-react';

/**
 * QuizFeedbackModal
 * Interactive popup modal for quiz feedback when an answer is submitted.
 * Shows celebratory confetti and green card for correct answers,
 * or red warning card with correct answer reveal and explanation for incorrect answers.
 */
export default function QuizFeedbackModal({
  isOpen,
  isCorrect,
  correctOption,
  explanation,
  onContinue,
}) {
  useEffect(() => {
    if (isOpen && isCorrect) {
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#0f7c85', '#3b82f6', '#f59e0b', '#ec4899'],
        });
      } catch {
        /* fallback */
      }
    }
  }, [isOpen, isCorrect]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl border ${
            isCorrect ? 'border-emerald-200' : 'border-rose-200'
          }`}
        >
          {/* Top Icon Badge */}
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 400 }}
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : (
                <XCircle className="w-10 h-10" />
              )}
            </motion.div>
          </div>

          {/* Heading */}
          <h3
            className={`font-heading font-extrabold text-2xl mb-2 ${
              isCorrect ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {isCorrect ? 'Correct! 🎉' : 'Incorrect 💡'}
          </h3>

          {/* Subtitle / Selected answer summary */}
          <div className="text-slate-600 text-sm mb-4">
            {isCorrect ? (
              <span>Great job! You picked the right answer.</span>
            ) : (
              <span>
                Correct answer:{' '}
                <strong className="text-slate-900 font-bold block mt-1">
                  {correctOption?.label || 'See details'}
                </strong>
              </span>
            )}
          </div>

          {/* Explanation Box if provided */}
          {explanation ? (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 text-left text-xs leading-relaxed text-slate-700">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Explanation:</span>
              </div>
              <p className="m-0 text-slate-600">{explanation}</p>
            </div>
          ) : (
            <div className="mb-6" />
          )}

          {/* Action Button */}
          <button
            onClick={onContinue}
            className={`w-full py-3.5 px-6 rounded-full font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
              isCorrect
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                : 'bg-[#0f7c85] hover:bg-[#0c6b73] shadow-[#0f7c85]/20'
            }`}
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
