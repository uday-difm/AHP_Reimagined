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
    <section className="hero-section min-h-[100vh] flex items-center pt-24 pb-20 relative overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/background.png"
        alt="Hero Background"
        fill
        priority
        className="object-cover object-center z-[-1] absolute inset-0 opacity-100"
      />
      {/* Decorative gradient circle flare blur */}
      <div className="absolute w-[450px] h-[450px] md:w-[800px] md:h-[800px] rounded-full bg-gradient-to-tr from-accent/20 to-purple-500/15 top-[-60px] md:top-[-120px] right-[-120px] md:right-[-250px] pointer-events-none z-0 blur-xl" />

      <div className="container hero-container relative z-10 flex flex-col pt-4 md:pt-8">

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1.1fr_0.9fr] gap-8 lg:gap-10 items-start">

          {/* Left Column: Hero Text */}
          <div className="flex flex-col -mt-2 md:-mt-6">
            <div className="w-full text-left max-w-2xl md:-ml-2">
              <h1 className="text-primary font-heading font-extrabold text-[32px] md:text-[44px] lg:text-[56px] leading-tight tracking-[-1px] mb-6 uppercase">
                <strong>YOUR DAILY GUIDE TO HEALTH &amp; WELLNESS</strong>
              </h1>
              <p className="text-secondary text-[16px] md:text-[20px] leading-relaxed max-w-xl mb-8">
                Discover trusted health blogs, expert magazines, disease awareness,
                nutrition tips, mental wellness, and practical lifestyle guidance—
                everything you need to make informed decisions for a healthier life.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/blogs" className="bg-[#0f7c85] hover:bg-[#0c6b73] text-white px-8 py-3.5 rounded-full font-bold text-[15px] transition-colors shadow-md">
                  Explore Blogs
                </Link>
                <Link href="/publication" className="bg-white/80 hover:bg-white text-[#0f7c85] border border-[#0f7c85]/20 backdrop-blur-sm px-8 py-3.5 rounded-full font-bold text-[15px] transition-all shadow-sm">
                  Explore Magazines
                </Link>
              </div>
            </div>
          </div>

          {/* Middle Column: Trending Sidebar */}
          <div className="flex flex-col w-full lg:max-w-sm -mt-2 md:-mt-6">
            <div className="bg-white/60 border border-slate-200/50 rounded-[32px] p-6 md:p-8 shadow-sm backdrop-blur-xl">
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
          </div>

          {/* Right Column: Ad Space */}
          <div className="flex flex-col w-full lg:max-w-xs ml-auto -mt-2 md:-mt-6">
            <div className="bg-white/40 border border-slate-200/40 rounded-2xl p-4.5 shadow-sm backdrop-blur-md">
              <AdSlot zone="hero-sidebar-bottom" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
