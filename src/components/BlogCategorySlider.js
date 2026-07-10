'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
  {
    title: 'Nutrition & Diet',
    tag: 'FUEL & ENERGY',
    desc: 'Learn about meal prep, balanced diets, clean biophilic eating, and clinical nutrition guidelines.',
    img: '/images/mag_nutrition.png',
    link: '/blogs?filter=Nutrition',
    badgeClass: 'bg-[var(--color-badge-yellow-bg)] text-[var(--color-badge-yellow-text)]',
  },
  {
    title: 'Fitness & Training',
    tag: 'STRENGTH & MOTION',
    desc: 'Discover exercise routines, posture corrections, energy maintenance, and active training protocols.',
    img: '/images/mag_strength.png',
    link: '/blogs?filter=Fitness',
    badgeClass: 'bg-[var(--color-badge-red-bg)] text-[var(--color-badge-red-text)]',
  },
  {
    title: 'Alternative Care',
    tag: 'NATURAL REMEDIES',
    desc: 'Explore alternative therapies, biophilic setups, and herbal supplement vetting protocols.',
    img: '/images/holistic.png',
    link: '/blogs?filter=Alternative',
    badgeClass: 'bg-[var(--color-badge-green-bg)] text-[var(--color-badge-green-text)]',
  },
  {
    title: 'Digital Wellness',
    tag: 'MINDFUL FOCUS',
    desc: 'Insights on reducing screen fatigue, setting tech boundaries, and restoring daily focus.',
    img: '/images/mag_detox.png',
    link: '/blogs?filter=Mental%20Health',
    badgeClass: 'bg-[var(--color-badge-purple-bg)] text-[var(--color-badge-purple-text)]',
  },
];

export default function BlogCategorySlider() {
  return (
    <section id="timeline" className="timeline-section py-[100px] bg-bg-timeline rounded-t-[40px] relative overflow-hidden">
      <div className="container relative px-6 md:px-8">
        {/* Section Title */}
        <div className="section-title-center text-center max-w-[600px] mx-auto mb-16 reveal-slide">
          <span className="section-tag text-[11px] font-bold tracking-[2px] text-accent uppercase mb-3 block">EXPLORE CATEGORIES</span>
          <h2 className="section-title font-heading font-extrabold text-[32px] md:text-[44px] text-primary tracking-[-1px]">Types of Blogs</h2>
          <p className="text-secondary/80 mt-3 text-[14px]">Browse our articles by topic to find medically verified guides and insights.</p>
        </div>

        {/* Swiper Slider Wrapper */}
        <div className="reveal-scale relative px-2 md:px-0">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            loop={true}
            speed={500}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{ clickable: true, el: '.swiper-timeline-pagination' }}
            navigation={{
              nextEl: '.swiper-timeline-next',
              prevEl: '.swiper-timeline-prev',
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 4,
              },
            }}
            className="timeline-swiper !pb-14"
          >
            {categories.map((cat, i) => (
              <SwiperSlide key={i} className="h-auto flex">
                <Link
                  href={cat.link}
                  className="group bg-white rounded-[24px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100/50 flex flex-col justify-between hover:shadow-[0_16px_40px_rgba(31,185,251,0.08)] hover:scale-[1.02] transition-all duration-300 h-full w-full no-underline"
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
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Slider Controls (bullets + navigation arrow buttons) */}
          <div className="flex justify-between items-center mt-6 px-4">
            {/* Custom Pagination Bullets */}
            <div className="swiper-timeline-pagination flex gap-2 !w-auto"></div>

            {/* Custom Navigation Arrows */}
            <div className="flex gap-3">
              <button className="swiper-timeline-prev w-12 h-12 rounded-full border border-slate-200/60 bg-white/90 text-primary hover:border-accent hover:text-accent flex items-center justify-center transition-all duration-300 active:scale-95 shadow-sm cursor-pointer z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
              <button className="swiper-timeline-next w-12 h-12 rounded-full border border-slate-200/60 bg-white/90 text-primary hover:border-accent hover:text-accent flex items-center justify-center transition-all duration-300 active:scale-95 shadow-sm cursor-pointer z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
