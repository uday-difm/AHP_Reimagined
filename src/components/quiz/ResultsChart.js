'use client';

import { useEffect, useRef } from 'react';

/**
 * ResultsChart — inline SVG bar chart showing per-question score breakdown.
 * Uses no external library; pure SVG for zero bundle overhead.
 * @param {Array} bars - [{ label: string, score: number, maxScore: number, color: string }]
 * @param {string} accentColor - main accent color
 */
export default function ResultsChart({ bars = [], accentColor = '#0f7c85' }) {
  const svgRef = useRef(null);

  // Animate bars on mount
  useEffect(() => {
    if (!svgRef.current) return;
    const rects = svgRef.current.querySelectorAll('[data-bar]');
    rects.forEach((rect, i) => {
      const targetWidth = rect.getAttribute('data-target-width');
      rect.style.width = '0px';
      setTimeout(() => {
        rect.style.transition = `width 0.6s cubic-bezier(0.34,1.56,0.64,1) ${i * 80}ms`;
        rect.style.width = targetWidth + 'px';
      }, 100);
    });
  }, [bars]);

  if (!bars.length) return null;

  const BAR_HEIGHT = 28;
  const LABEL_WIDTH = 90;
  const CHART_WIDTH = 280;
  const ROW_GAP = 16;
  const svgHeight = bars.length * (BAR_HEIGHT + ROW_GAP);
  const maxPct = Math.max(...bars.map((b) => (b.score / b.maxScore)));

  return (
    <div className="w-full overflow-x-auto">
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${LABEL_WIDTH + CHART_WIDTH + 60} ${svgHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Score breakdown chart"
      >
        {bars.map((bar, i) => {
          const y = i * (BAR_HEIGHT + ROW_GAP);
          const pct = bar.maxScore > 0 ? bar.score / bar.maxScore : 0;
          const barWidth = Math.round(pct * CHART_WIDTH);
          const scoreLabel = `${bar.score}/${bar.maxScore}`;

          return (
            <g key={i}>
              {/* Category label */}
              <text
                x={LABEL_WIDTH - 8}
                y={y + BAR_HEIGHT / 2 + 4}
                textAnchor="end"
                fontSize="11"
                fill="#4a4a5a"
                fontFamily="Inter, sans-serif"
              >
                {bar.label}
              </text>

              {/* Track */}
              <rect
                x={LABEL_WIDTH}
                y={y}
                width={CHART_WIDTH}
                height={BAR_HEIGHT}
                rx={BAR_HEIGHT / 2}
                fill="#f1f5f9"
              />

              {/* Filled bar (animated via ref) */}
              <foreignObject x={LABEL_WIDTH} y={y} width={CHART_WIDTH} height={BAR_HEIGHT}>
                <div
                  data-bar
                  data-target-width={barWidth}
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    width: 0,
                    height: BAR_HEIGHT,
                    borderRadius: BAR_HEIGHT / 2,
                    background: `linear-gradient(90deg, ${bar.color || accentColor}, ${(bar.color || accentColor)}aa)`,
                  }}
                />
              </foreignObject>

              {/* Score label */}
              <text
                x={LABEL_WIDTH + CHART_WIDTH + 8}
                y={y + BAR_HEIGHT / 2 + 4}
                fontSize="11"
                fontWeight="700"
                fill={bar.color || accentColor}
                fontFamily="Inter, sans-serif"
              >
                {scoreLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
