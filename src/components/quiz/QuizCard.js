'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

/**
 * QuizCard — Earth by Humans style.
 * Card structure:
 *  - Image section on top with hover zoom effect.
 *  - Category and reading time overlays.
 *  - Padding container for Title, Description, and detailed stats.
 *  - Clean bottom bar with a custom "Start Quiz" CTA button.
 */
export default function QuizCard({ quiz }) {
  const [hovered, setHovered] = useState(false);

  const difficultyColors = {
    Beginner: { bg: '#e8f8f0', text: '#27ae60' },
    Intermediate: { bg: '#fff8e8', text: '#f39c12' },
    Advanced: { bg: '#fdecea', text: '#e05248' },
  }[quiz.difficulty] || { bg: '#e8f8f0', text: '#27ae60' };

  return (
    <Link
      href={`/quizzes/${quiz.slug}`}
      className="group block no-underline h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="h-full bg-white rounded-[24px] overflow-hidden border border-slate-200/50 flex flex-col transition-all duration-500"
        style={{
          boxShadow: hovered
            ? '0 20px 35px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.03)'
            : '0 10px 25px rgba(0, 0, 0, 0.03), 0 2px 6px rgba(0, 0, 0, 0.01)',
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        }}
      >
        {/* Top Image Section */}
        <div className="relative h-[220px] w-full overflow-hidden bg-slate-100">
          <Image
            src={quiz.img}
            alt={quiz.title}
            fill
            className="object-cover transition-transform duration-700 ease-out"
            style={{
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
            }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* Ambient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />

          {/* Overlay elements */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            <span
              className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md backdrop-blur-md border border-white/20"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#1a1a2e',
              }}
            >
              {quiz.category}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 z-10 text-white flex items-center gap-1.5 text-[11px] font-medium">
            <span>{quiz.icon}</span>
            <span className="opacity-95">{quiz.estimatedMinutes} Mins Read</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 flex flex-col flex-1">
          {/* Title */}
          <h3
            className="font-heading font-extrabold text-[19px] text-[#1a2a35] leading-snug tracking-tight mb-3 transition-colors duration-300 group-hover:text-[#0f7c85]"
          >
            {quiz.title}
          </h3>

          {/* Description */}
          <p className="text-secondary text-[13.5px] leading-relaxed mb-6 flex-1">
            {quiz.description}
          </p>

          {/* Card footer details */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: difficultyColors.bg,
                  color: difficultyColors.text,
                }}
              >
                {quiz.difficulty}
              </span>
              <span className="text-[11px] text-muted-foreground text-slate-400 font-medium">
                {quiz.questionCount} Questions
              </span>
            </div>

            {/* Play Button CTA */}
            <div className="flex items-center gap-1 text-[#0f7c85] font-extrabold text-[12.5px] uppercase tracking-wider transition-all duration-300">
              <span className="group-hover:mr-1 transition-all">Play Quiz</span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  backgroundColor: hovered ? '#0f7c85' : '#f0fdfd',
                  color: hovered ? '#fff' : '#0f7c85',
                }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
