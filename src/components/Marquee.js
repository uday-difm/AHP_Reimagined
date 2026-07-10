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
    <div className="relative w-full overflow-hidden whitespace-nowrap bg-[#0f4c4e] py-2 border-y border-white/5 select-none mt-20 mb-6 shadow-sm z-10">
      <div className="inline-block animate-marquee whitespace-nowrap">
        {repeatedItems.map((item, idx) => (
          <span key={idx} className="inline-flex items-center mx-6 font-heading  text-[15px] md:text-[18px] tracking-[2px] text-white/95">
            <span className="w-2.5 h-2.5 bg-[#8fe9ec] rounded-full mr-4" />
            {item}
          </span>
        ))}
      </div>
      <div className="inline-block animate-marquee whitespace-nowrap" aria-hidden="true">
        {repeatedItems.map((item, idx) => (
          <span key={`clone-${idx}`} className="inline-flex items-center mx-6 font-heading  text-[15px] md:text-[18px] tracking-[2px] text-white/95">
            <span className="w-2.5 h-2.5 bg-[#8fe9ec] rounded-full mr-4" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
