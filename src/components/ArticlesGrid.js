'use client';

import { useRef } from 'react';
import Image from 'next/image';

const articles = [
  {
    id: 1,
    category: 'Nutrition',
    badgeClass: 'bg-[var(--color-badge-green-bg)] text-[var(--color-badge-green-text)]',
    title: '5 Essential Foods for Optimal Gut Health',
    desc: 'Learn which fermented foods and prebiotics can transform your digestive system and boost immunity.',
    img: '/images/ayurveda.png',
  },
  {
    id: 2,
    category: 'Insurance',
    badgeClass: 'bg-[var(--color-badge-red-bg)] text-[var(--color-badge-red-text)]',
    title: "Navigating Medicare: A Beginner's Guide",
    desc: 'Demystifying Parts A, B, C, and D so you can make informed decisions about your health coverage.',
    img: '/images/disease.png',
  },
  {
    id: 3,
    category: 'Holistic',
    badgeClass: 'bg-[var(--color-badge-green-bg)] text-[var(--color-badge-green-text)]',
    title: '10-Minute Evening Yoga Routine for Sleep',
    desc: 'Unwind your body and quiet your mind with these gentle stretches before bedtime.',
    img: '/images/holistic.png',
  },
  {
    id: 4,
    category: 'Mental Health',
    badgeClass: 'bg-[var(--color-badge-blue-bg)] text-[var(--color-badge-blue-text)]',
    title: 'How Exercise Reduces Daily Stress',
    desc: 'Science-backed strategies showing how regular movement rewires the brain for resilience and calm.',
    img: '/images/hero_exercise.png',
  },
  {
    id: 5,
    category: 'Physical Health',
    badgeClass: 'bg-[var(--color-badge-yellow-bg)] text-[var(--color-badge-yellow-text)]',
    title: 'Impact of Inactivity on Physical Health',
    desc: "Research links sedentary lifestyles to chronic conditions — here's what you can do immediately.",
    img: '/images/physical_health.png',
  },
  {
    id: 6,
    category: 'Life Stages',
    badgeClass: 'bg-[var(--color-badge-purple-bg)] text-[var(--color-badge-purple-text)]',
    title: 'When Is the Right Time for Hospice Care?',
    desc: 'Compassionate guidance on recognizing the signs and having difficult but important family conversations.',
    img: '/images/hero_hospice.png',
  },
];

export default function ArticlesGrid() {
  const cardRefs = useRef([]);

  const handleMouseMove = (e, index) => {
    const card = cardRefs.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    const px = (x / width) - 0.5;
    const py = (y / height) - 0.5;

    const maxTilt = 12;
    const tiltX = -py * maxTilt;
    const tiltY = px * maxTilt;

    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
  };

  const handleMouseLeave = (index) => {
    const card = cardRefs.current[index];
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
  };

  return (
    <section id="articles" className="projects-section py-[100px] bg-white rounded-t-[40px] shadow-[0_-20px_40px_rgba(0,0,0,0.01)]">
      <div className="container">
        <div className="section-title-center text-center max-w-[600px] mx-auto mb-16 reveal-slide">
          <span className="section-tag text-[11px] font-bold tracking-[2px] text-accent uppercase mb-3 block">EXPERT-BACKED GUIDES</span>
          <h2 className="section-title font-heading font-extrabold text-[32px] md:text-[44px] text-primary tracking-[-1px]">Latest Articles</h2>
        </div>

        <div className="projects-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((art, i) => (
            <div
              key={art.id}
              ref={el => cardRefs.current[i] = el}
              onMouseMove={(e) => handleMouseMove(e, i)}
              onMouseLeave={() => handleMouseLeave(i)}
              style={{ '--order': i + 1 }}
              className="project-card tilt-card bg-bg-light rounded-[20px] overflow-hidden border border-slate-200 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer flex flex-col h-full [transform-style:preserve-3d] [perspective:1000px] hover:border-accent/30 hover:shadow-[0_16px_40px_rgba(31,185,251,0.05)] reveal-slide"
            >
              <div className="project-img-wrapper relative w-full h-[220px] overflow-hidden [transform:translateZ(20px)]">
                <Image
                  src={art.img}
                  alt={art.title}
                  fill
                  className="project-img object-cover transition-transform duration-500 hover:scale-106"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <span className={`project-badge absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.5px] ${art.badgeClass}`}>
                  {art.category}
                </span>
              </div>
              <div className="project-content p-6 flex flex-col gap-2.5 flex-grow [transform:translateZ(10px)]">
                <h3 className="project-name font-heading font-bold text-[17px] text-primary leading-snug group-hover:text-accent transition-colors">
                  {art.title}
                </h3>
                <p className="project-desc text-[13px] text-secondary leading-relaxed">
                  {art.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
