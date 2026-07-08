import Image from 'next/image';
import Link from 'next/link';

const timelineSlides = [
  {
    season: 'WINTER 2023',
    phase: 'Sleep',
    title: 'The Sleep Revolution',
    slug: 'the-sleep-revolution',
    desc: 'Diving into physical sleep quality, REM cycles, and how daily brain recovery shapes cognitive health.',
    img: '/images/mag_sleep.png',
  },
  {
    season: 'FALL 2023',
    phase: 'Nutrition',
    title: 'Holistic Nutrition',
    slug: 'holistic-nutrition',
    desc: 'Understanding gut-brain axis pathways, balanced meal preparations, and clean biophilic diets.',
    img: '/images/mag_nutrition.png',
  },
  {
    season: 'SUMMER 2023',
    phase: 'Strength',
    title: 'The Strength Within',
    slug: 'the-strength-within',
    desc: 'Certified clinical routines, posture alignment standards, and functional energy maintenance guides.',
    img: '/images/mag_strength.png',
  },
  {
    season: 'SPRING 2023',
    phase: 'Mental Health',
    title: 'Digital Detox',
    slug: 'digital-detox',
    desc: 'Setting boundaries with tech to eliminate micro-anxiety loops and restore daily cognitive clarity.',
    img: '/images/mag_detox.png',
  },
];

export default function TimelineMarquee() {
  return (
    <section id="timeline" className="timeline-section py-[100px] bg-bg-timeline rounded-t-[40px] relative overflow-hidden">
      <div className="container">
        <div className="section-title-center text-center max-w-[600px] mx-auto mb-16 reveal-slide">
          <span className="section-tag text-[11px] font-bold tracking-[2px] text-accent uppercase mb-3 block">DIGITAL PUBLICATIONS</span>
          <h2 className="section-title text-white-section font-heading font-extrabold text-[32px] md:text-[44px] text-primary tracking-[-1px]">Explore Our Latest Issues</h2>
        </div>

        {/* Infinite Marquee Container */}
        <div className="timeline-marquee-container relative w-full overflow-hidden mt-12 pb-8 reveal-scale">
          <div className="flex gap-8 w-max animate-marquee hover:[animation-play-state:paused] py-2">
            
            {/* First Set of Slides */}
            {timelineSlides.map((slide, i) => (
              <Link
                key={`first-${i}`}
                href={`/article/${slide.slug}`}
                className="timeline-slide flex-[0_0_380px] bg-white rounded-[24px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col gap-5 select-none no-underline hover:shadow-[0_16px_40px_rgba(31,185,251,0.06)] hover:scale-[1.01] transition-all duration-300"
              >
                <div className="slide-header flex justify-center items-center gap-3.5 border-b border-slate-200 pb-3">
                  <span className="slide-year font-heading font-extrabold text-[18px] text-primary whitespace-nowrap">{slide.season}</span>
                  <span className="slide-phase text-[10px] font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full uppercase">{slide.phase}</span>
                </div>
                <div className="slide-body flex flex-col items-center text-center gap-3">
                  <h4 className="slide-title font-heading font-bold text-[16px] text-primary text-center">{slide.title}</h4>
                  <p className="slide-desc text-[13px] text-secondary leading-relaxed text-center">{slide.desc}</p>
                  <div className="slide-image relative mt-2 h-[140px] w-full rounded-xl overflow-hidden">
                    <Image
                      src={slide.img}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      sizes="380px"
                    />
                  </div>
                </div>
              </Link>
            ))}

            {/* Second Set of Slides (Duplicated for seamless loop) */}
            {timelineSlides.map((slide, i) => (
              <Link
                key={`second-${i}`}
                href={`/article/${slide.slug}`}
                className="timeline-slide flex-[0_0_380px] bg-white rounded-[24px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col gap-5 select-none no-underline hover:shadow-[0_16px_40px_rgba(31,185,251,0.06)] hover:scale-[1.01] transition-all duration-300"
              >
                <div className="slide-header flex justify-center items-center gap-3.5 border-b border-slate-200 pb-3">
                  <span className="slide-year font-heading font-extrabold text-[18px] text-primary whitespace-nowrap">{slide.season}</span>
                  <span className="slide-phase text-[10px] font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full uppercase">{slide.phase}</span>
                </div>
                <div className="slide-body flex flex-col items-center text-center gap-3">
                  <h4 className="slide-title font-heading font-bold text-[16px] text-primary text-center">{slide.title}</h4>
                  <p className="slide-desc text-[13px] text-secondary leading-relaxed text-center">{slide.desc}</p>
                  <div className="slide-image relative mt-2 h-[140px] w-full rounded-xl overflow-hidden">
                    <Image
                      src={slide.img}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      sizes="380px"
                    />
                  </div>
                </div>
              </Link>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
}
