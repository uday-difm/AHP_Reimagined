import React from 'react';

const marqueeItems = [
  'MIND & SOUL',
  'PHYSICAL VITALITY',
  'MEDICALLY VETTED',
  'HOLISTIC AYURVEDA',
  'SCIENCE-BACKED GUIDES',
  'SLEEP OPTIMIZATION',
  'STRESS RESILIENCE',
  'NUTRIENT-DENSE DIETS',
  'INTEGRATIVE HEALTH',
];

export default function Marquee() {
  const repeatedItems = [...marqueeItems, ...marqueeItems];

  return (
    <div className="fixed top-0 left-0 right-0 w-full overflow-hidden whitespace-nowrap bg-[#0f7c85] py-2 border-b border-white/5 select-none z-[9001] shadow-sm">
      <div className="inline-block animate-marquee whitespace-nowrap">
        {repeatedItems.map((item, idx) => (
          <span key={idx} className="inline-flex items-center mx-6 font-heading  text-base md:text-lg tracking-[2px] text-white/95">
            <span className="w-2.5 h-2.5 bg-[#8fe9ec] rounded-full mr-4" />
            {item}

          </span>
        ))}
      </div>
      <div className="inline-block animate-marquee whitespace-nowrap" aria-hidden="true">
        {repeatedItems.map((item, idx) => (
          <span key={`clone-${idx}`} className="inline-flex items-center mx-6 font-heading  text-base md:text-lg tracking-[2px] text-white/95">
            <span className="w-2.5 h-2.5 bg-[#8fe9ec] rounded-full mr-4" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
