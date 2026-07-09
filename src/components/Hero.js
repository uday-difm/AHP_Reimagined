import Image from 'next/image';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

const trendingArticles = [
  {
    slug: 'ayurvedic-secrets-for-better-digestion',
    category: 'Ayurveda',
    title: 'Ayurvedic Secrets for Better Digestion',
    img: '/images/ayurveda.png',
  },
  {
    slug: 'how-ai-is-changing-healthcare',
    category: 'Modern Health',
    title: 'How AI is Changing Healthcare',
    img: '/images/disease.png',
  },
  {
    slug: 'breathwork-vs-meditation-for-anxiety',
    category: 'Holistic',
    title: 'Breathwork vs. Meditation for Anxiety',
    img: '/images/holistic.png',
  },
  {
    slug: 'exercise-for-better-mental-health',
    category: 'Mental Health',
    title: 'Exercise for Better Mental Health',
    img: '/images/hero_exercise.png',
  },
];

export default function Hero() {
  return (
    <section className="hero-section pt-8 pb-20 relative overflow-hidden">
      {/* Decorative gradient circle flare blur */}
      <div className="absolute w-[450px] h-[450px] md:w-[800px] md:h-[800px] rounded-full bg-gradient-to-tr from-accent/20 to-purple-500/15 top-[-60px] md:top-[-120px] right-[-120px] md:right-[-250px] pointer-events-none z-0 blur-xl" />

      <div className="container hero-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Featured Article */}
          <div className="flex flex-col reveal-slide">
            <div className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.03)] border border-slate-200/40 mb-6">
              <Image
                src="/images/holistic.png"
                alt="Holistic yoga wellness concept illustration"
                fill
                priority
                className="object-cover transition-transform duration-500 hover:scale-102"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            </div>
            <span className="text-accent text-[11px] font-bold uppercase tracking-[2px] mb-2.5 block">Featured Guide</span>
            <h1 className="text-primary font-heading font-extrabold text-[32px] md:text-[44px] leading-tight tracking-[-1.5px] mb-3">
              Building wellness into your Life
            </h1>
            <p className="text-secondary text-[14.5px] leading-relaxed max-w-2xl">
              Discover practical techniques to integrate mindfulness into your busy schedule, reducing stress and improving overall well-being.
            </p>
          </div>

          {/* Right Column: Trending Sidebar & Ad */}
          <div className="flex flex-col gap-6 w-full reveal-fade">
            <div className="bg-white/60 border border-slate-200/50 rounded-[32px] p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-2.5 text-primary font-heading font-extrabold text-[16px] md:text-[18px] mb-8 tracking-tight">
                <svg className="w-5.5 h-5.5 text-accent-green" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
                Trending
              </div>

              <div className="flex flex-col gap-6">
                {trendingArticles.map((art, i) => (
                  <div key={i} className="flex gap-4.5 items-center group">
                    <Link href={`/blogs/${art.slug}`} className="relative w-[100px] h-[75px] rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-100/50">
                      <Image
                        src={art.img}
                        alt={art.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-104"
                        sizes="100px"
                      />
                    </Link>
                    <div className="flex flex-col gap-1">
                      <span className="text-accent font-bold text-[10px] uppercase tracking-wider">{art.category}</span>
                      <Link href={`/blogs/${art.slug}`} className="text-primary font-heading font-bold text-[13.5px] md:text-[14.5px] leading-snug group-hover:text-accent transition-colors no-underline">
                        {art.title}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sidebar Ad Slot */}
            <div className="bg-white/40 border border-slate-200/40 rounded-2xl p-4.5 shadow-sm">
              <AdSlot zone="hero-sidebar-bottom" />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
