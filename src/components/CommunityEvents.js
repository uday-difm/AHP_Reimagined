import Image from 'next/image';
import Button from '@/components/Button';

export default function CommunityEvents() {
  return (
    <section id="events" className="community-section pt-16 pb-[100px] bg-bg-light rounded-t-[40px]">
      <div className="container">
        <div className="community-grid grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-12 md:gap-20 items-center">
          <div className="community-info flex flex-col items-start gap-5 reveal-slide">
            <span className="section-tag text-xs font-bold tracking-[2px] text-accent uppercase mb-1 block">COMMUNITY CONNECTION</span>
            <h2 className="section-title font-heading font-extrabold text-3xl md:text-5xl text-primary tracking-[-1px] leading-[1.15] mb-4">Our Community & Events</h2>
            <p className="community-text text-base md:text-lg leading-relaxed text-secondary">
              We hold regular group nature walks, online yoga classes, and stress management seminars hosted by clinical professionals to keep you connected.
            </p>
            <a href="/publication" className="btn-text text-sm font-bold text-primary no-underline inline-flex items-center gap-2 hover:translate-x-1 transition-all duration-300">
              View publication archives <span className="arrow transition-transform duration-300">→</span>
            </a>
          </div>

          <div className="community-featured reveal-scale">
            <div className="featured-card bg-white rounded-[24px] overflow-hidden shadow-[0_20px_48px_rgba(0,0,0,0.03)] border border-slate-200 group">
              <div className="featured-img-wrapper relative h-[260px] overflow-hidden">
                <Image
                  src="/images/hero_exercise.png"
                  alt="A pathway under trees during autumn walk"
                  fill
                  className="featured-img object-cover transition-transform duration-[600ms] group-hover:scale-104"
                  sizes="(max-width: 900px) 100vw, 50vw"
                />
                <div className="featured-badge absolute top-5 left-5 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.5px]">JULY 2026</div>
              </div>
              <div className="featured-content p-8 flex flex-col gap-3">
                <span className="featured-tag text-xs font-bold text-accent uppercase tracking-wider">Mindfulness Walk</span>
                <h3 className="featured-title font-heading font-bold text-lg md:text-xl text-primary leading-[1.3]">Restorative Walk: Managing Stress in Nature</h3>
                <p className="featured-desc text-sm text-secondary leading-relaxed">Join lead eco-therapists and clinical wellness advisors for a morning sensory walk through regional reservation paths.</p>
                <div className="featured-footer flex items-center justify-between mt-3 pt-5 border-t border-slate-200">
                  <span className="featured-meta text-xs font-semibold text-muted">9:00 AM — 11:30 AM</span>
                  <Button href="/info?tab=support" variant="primary" className="!text-xs !py-2 !px-4 !font-semibold">Reserve Spot</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
