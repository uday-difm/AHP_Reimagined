'use client';

import Link from 'next/link';

/**
 * QuizCard — matches the site's light, clean design system.
 * White card, teal accents, soft shadow, rounded corners.
 */
export default function QuizCard({ quiz }) {
  const difficultyColors = {
    Beginner: { bg: '#e8f8f0', text: '#27ae60' },
    Intermediate: { bg: '#fff8e8', text: '#f39c12' },
    Advanced: { bg: '#fdecea', text: '#e05248' },
  };
  const dc = difficultyColors[quiz.difficulty] || difficultyColors.Beginner;

  return (
    <Link href={`/quizzes/${quiz.slug}`} className="group block no-underline h-full">
      <div
        className="h-full bg-white rounded-[28px] overflow-hidden border border-slate-200/60 flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1.5 group-hover:border-slate-300/60"
        style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}
      >
        {/* Coloured top strip */}
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${quiz.categoryColor}, ${quiz.categoryColor}88)` }} />

        {/* Card header area */}
        <div
          className="relative px-7 pt-7 pb-14 flex flex-col items-start overflow-hidden"
          style={{ background: quiz.categoryBg }}
        >
          {/* Decorative blob */}
          <div
            className="absolute right-[-30px] bottom-[-40px] w-[140px] h-[140px] rounded-full pointer-events-none opacity-40"
            style={{ background: `radial-gradient(circle, ${quiz.categoryColor} 0%, transparent 70%)` }}
          />

          {/* Category tag */}
          <span
            className="text-[10px] font-extrabold uppercase tracking-[2.5px] px-3 py-1.5 rounded-full mb-5"
            style={{ background: quiz.categoryColor + '22', color: quiz.categoryColor }}
          >
            {quiz.category}
          </span>

          {/* Icon */}
          <span className="text-[52px] leading-none select-none transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1">
            {quiz.icon}
          </span>
        </div>

        {/* Card body */}
        <div className="px-7 py-6 flex flex-col flex-1">
          <h3 className="font-heading font-extrabold text-[19px] text-primary leading-tight tracking-tight mb-2">
            {quiz.title}
          </h3>
          <p className="text-secondary text-[13px] leading-relaxed flex-1 mb-5">
            {quiz.description}
          </p>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="flex items-center gap-1.5 text-[11px] text-secondary bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5">
              <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
              </svg>
              {quiz.estimatedMinutes} min
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-secondary bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5">
              <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {quiz.questionCount} questions
            </span>
            <span
              className="text-[11px] font-bold rounded-full px-3 py-1.5"
              style={{ background: dc.bg, color: dc.text }}
            >
              {quiz.difficulty}
            </span>
          </div>

          {/* CTA row */}
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] font-bold px-3 py-1.5 rounded-full"
              style={{ background: '#e8f4ff', color: '#1fb9fb' }}
            >
              🔓 2 Free Questions
            </span>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110"
              style={{ background: '#0f7c85' }}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
