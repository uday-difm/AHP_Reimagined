'use client';

/**
 * ProgressBar — animated bar showing quiz completion progress.
 * @param {number} current  - 1-based current question index
 * @param {number} total    - total number of questions
 * @param {string} color    - hex color for the filled bar
 */
export default function ProgressBar({ current, total, color = '#0f7c85' }) {
  const pct = Math.min(100, Math.round((current / total) * 100));

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-muted">
          Question {current} of {total}
        </span>
        <span className="text-[11px] font-bold" style={{ color }}>
          {pct}% complete
        </span>
      </div>

      {/* Track */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        {/* Fill */}
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}bb)` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-500"
            style={{
              width: i < current ? '8px' : '6px',
              height: i < current ? '8px' : '6px',
              background: i < current ? color : '#e2e8f0',
              marginTop: i < current ? '-1px' : '0',
            }}
          />
        ))}
      </div>
    </div>
  );
}
