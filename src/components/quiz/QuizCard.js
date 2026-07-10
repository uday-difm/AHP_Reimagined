'use client';

import Link from 'next/link';

/**
 * QuizCard — displayed on the /quizzes listing page.
 */
export default function QuizCard({ quiz }) {
  const { slug, title, subtitle, category, categoryColor, categoryBg, icon,
    estimatedMinutes, questionCount, difficulty, description } = quiz;

  const difficultyColors = {
    Beginner: { bg: '#e8f8f0', text: '#27ae60' },
    Intermediate: { bg: '#fff8e8', text: '#f39c12' },
    Advanced: { bg: '#fdecea', text: '#e05248' },
  };
  const dc = difficultyColors[difficulty] || difficultyColors.Beginner;

  return (
    <Link
      href={`/quizzes/${slug}`}
      className="group block no-underline h-full"
    >
      <div
        className="h-full rounded-[24px] overflow-hidden border border-slate-200/60 bg-white flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1.5 group-hover:border-slate-300/60"
        style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}
      >
        {/* Card Header with gradient bg */}
        <div
          className="relative px-6 pt-6 pb-12 flex flex-col items-start"
          style={{ background: `linear-gradient(135deg, ${categoryBg} 0%, ${categoryBg}cc 100%)` }}
        >
          {/* Category badge */}
          <span
            className="text-[10px] font-extrabold uppercase tracking-[2px] px-3 py-1 rounded-full mb-4"
            style={{ background: categoryColor + '20', color: categoryColor }}
          >
            {category}
          </span>

          {/* Icon */}
          <div className="text-[48px] leading-none mb-3 select-none">{icon}</div>

          {/* Title */}
          <h3 className="font-heading font-extrabold text-[20px] text-primary leading-tight tracking-tight">
            {title}
          </h3>
          <p className="text-secondary text-[13px] mt-1 leading-snug">{subtitle}</p>
        </div>

        {/* Card Body */}
        <div className="px-6 py-5 flex flex-col flex-1">
          <p className="text-[13px] text-secondary leading-relaxed mb-5 flex-1">{description}</p>

          {/* Meta pills */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="flex items-center gap-1.5 text-[11.5px] text-secondary bg-slate-50 border border-slate-100 rounded-full px-3 py-1">
              <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
              </svg>
              {estimatedMinutes} min
            </span>
            <span className="flex items-center gap-1.5 text-[11.5px] text-secondary bg-slate-50 border border-slate-100 rounded-full px-3 py-1">
              <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {questionCount} questions
            </span>
            <span
              className="text-[11.5px] font-bold rounded-full px-3 py-1"
              style={{ background: dc.bg, color: dc.text }}
            >
              {difficulty}
            </span>
          </div>

          {/* CTA */}
          <div
            className="flex items-center justify-between w-full py-3 px-4 rounded-full font-heading font-bold text-[13px] text-white transition-all duration-300 group-hover:shadow-md"
            style={{ background: `linear-gradient(135deg, #0f7c85, #0c646b)` }}
          >
            <span>Start Quiz</span>
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
