'use client';

import Image from 'next/image';
import Link from 'next/link';

const categories = [
  {
    title: 'Physical Health',
    tag: 'BODY VITALITY',
    desc: 'Guides on sleep quality, cardiovascular health, physical fitness, and daily preventative routines.',
    img: '/images/hero_exercise.png',
    link: '/blogs?filter=Physical%20Health',
    badgeClass: 'bg-[var(--color-badge-blue-bg)] text-[var(--color-badge-blue-text)]',
  },
  {
    title: 'Mental Health',
    tag: 'COGNITIVE CALM',
    desc: 'Insights into stress resilience, anxiety reduction, mindful practices, and neurological health.',
    img: '/images/holistic.png',
    link: '/blogs?filter=Mental%20Health',
    badgeClass: 'bg-[var(--color-badge-purple-bg)] text-[var(--color-badge-purple-text)]',
  },
  {
    title: 'Holistic Ayurveda',
    tag: 'ANCIENT WISDOM',
    desc: 'Integrating natural remedies, agni balancing, herbal vetting, and dosha-specific lifestyle guidelines.',
    img: '/images/ayurveda.png',
    link: '/blogs?filter=Holistic%20Ayurveda',
    badgeClass: 'bg-[var(--color-badge-green-bg)] text-[var(--color-badge-green-text)]',
  },
  {
    title: 'Insurance Mappings',
    tag: 'HEALTH POLICY',
    desc: 'Demystifying clinical documentation, wellness code mappings, and policy claim options.',
    img: '/images/disease.png',
    link: '/blogs?filter=Insurance%20Mappings',
    badgeClass: 'bg-[var(--color-badge-yellow-bg)] text-[var(--color-badge-yellow-text)]',
  },
];

export default function TimelineMarquee() {
  return (
    <section id="timeline" className="timeline-section py-[100px] bg-bg-timeline rounded-t-[40px] relative overflow-hidden">
      <div className="container relative px-6 md:px-8">
        <div className="section-title-center text-center max-w-[600px] mx-auto mb-16 reveal-slide">
          <span className="section-tag text-[11px] font-bold tracking-[2px] text-accent uppercase mb-3 block">EXPLORE CATEGORIES</span>
          <h2 className="section-title font-heading font-extrabold text-[32px] md:text-[44px] text-primary tracking-[-1px]">Types of Blogs</h2>
          <p className="text-secondary/80 mt-3 text-[14px]">Browse our articles by topic to find medically verified guides and insights.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 reveal-scale">
          {categories.map((cat, i) => (
            <Link
              key={i}
              href={cat.link}
              className="group bg-white rounded-[24px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100/50 flex flex-col justify-between hover:shadow-[0_16px_40px_rgba(31,185,251,0.08)] hover:scale-[1.02] transition-all duration-300 h-full no-underline"
            >
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className={`text-[9.5px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${cat.badgeClass}`}>{cat.tag}</span>
                </div>
                <h4 className="font-heading font-bold text-[17px] text-primary group-hover:text-accent transition-colors mt-2">{cat.title}</h4>
                <p className="text-[12.5px] text-secondary leading-relaxed mt-1">{cat.desc}</p>
              </div>
              
              <div className="relative mt-6 h-[120px] w-full rounded-xl overflow-hidden shadow-sm">
                <Image
                  src={cat.img}
                  alt={cat.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
