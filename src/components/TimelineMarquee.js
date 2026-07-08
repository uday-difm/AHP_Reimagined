import Image from 'next/image';

const timelineSlides = [
  {
    year: '2024',
    phase: 'Board Setup',
    title: 'Board Integration & Science Check',
    desc: 'Establishing collaboration protocols with certified dietitians and clinical psychologists for verifying article content.',
    img: '/images/disease.png',
  },
  {
    year: '2025',
    phase: 'Digital Magazine',
    title: 'Launching the Digital Journal',
    desc: 'Releasing interactive health calculators, sleep diaries, and medically vetted nutritional guides on our website.',
    img: '/images/holistic.png',
  },
  {
    year: '2026',
    phase: 'Directories',
    title: 'Ayurvedic & Clinical Directories',
    desc: 'Providing certified practitioner mappings and insurance compatibility guidelines for holistic therapies.',
    img: '/images/ayurveda.png',
  },
  {
    year: '2027+',
    phase: 'Scale',
    title: 'AI Diagnostics Collaborations',
    desc: 'Leveraging machine learning checklists to help readers map family health plans to insurance benefits.',
    img: '/images/physical_health.png',
  },
];

export default function TimelineMarquee() {
  return (
    <section id="timeline" className="timeline-section py-[100px] bg-bg-timeline rounded-t-[40px] relative overflow-hidden">
      <div className="container">
        <div className="section-title-center text-center max-w-[600px] mx-auto mb-16 reveal-slide">
          <span className="section-tag text-[11px] font-bold tracking-[2px] text-accent uppercase mb-3 block">MILESTONES</span>
          <h2 className="section-title text-white-section font-heading font-extrabold text-[32px] md:text-[44px] text-primary tracking-[-1px]">Our medical advisory journey</h2>
        </div>

        {/* Infinite Marquee Container */}
        <div className="timeline-marquee-container relative w-full overflow-hidden mt-12 pb-8 reveal-scale">
          <div className="flex gap-8 w-max animate-marquee hover:[animation-play-state:paused] py-2">
            
            {/* First Set of Slides */}
            {timelineSlides.map((slide, i) => (
              <div
                key={`first-${i}`}
                className="timeline-slide flex-[0_0_380px] bg-white rounded-[24px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col gap-5 select-none"
              >
                <div className="slide-header flex justify-center items-center gap-3.5 border-b border-slate-200 pb-3">
                  <span className="slide-year font-heading font-extrabold text-[28px] text-primary">{slide.year}</span>
                  <span className="slide-phase text-[11px] font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full uppercase">{slide.phase}</span>
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
              </div>
            ))}

            {/* Second Set of Slides (Duplicated for seamless loop) */}
            {timelineSlides.map((slide, i) => (
              <div
                key={`second-${i}`}
                className="timeline-slide flex-[0_0_380px] bg-white rounded-[24px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col gap-5 select-none"
              >
                <div className="slide-header flex justify-center items-center gap-3.5 border-b border-slate-200 pb-3">
                  <span className="slide-year font-heading font-extrabold text-[28px] text-primary">{slide.year}</span>
                  <span className="slide-phase text-[11px] font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full uppercase">{slide.phase}</span>
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
              </div>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
}
