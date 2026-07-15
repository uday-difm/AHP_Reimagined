import Image from 'next/image';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import Button from '@/components/Button';

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
    <section className="hero-section min-h-screen w-full flex items-start md:items-center py-5 relative overflow-hidden z-0">
      {/* Background Image */}
      {/* Mobile Background Image */}
      <Image
        src="/images/MobileVIEWbackground.png"
        alt="Hero Background Mobile"
        fill
        priority
        className="block md:hidden object-cover object-center z-[-1] opacity-100"
      />
      {/* Desktop Background Image */}
      <Image
        src="/images/background.png"
        alt="Hero Background Desktop"
        fill
        priority
        className="hidden md:block object-cover object-center z-[-1] opacity-100"
      />
      {/* Decorative gradient circle flare blur */}
      <div className="absolute w-[450px] h-[450px] md:w-[800px] md:h-[800px] rounded-full bg-gradient-to-tr from-accent/20 to-purple-500/15 top-[-60px] md:top-[-120px] right-[-120px] md:right-[-250px] pointer-events-none z-0 blur-xl" />

      <div className="container hero-container relative z-10 flex flex-col pt-36 md:pt-40 px-4 md:px-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">

          {/* Left Column: All Content */}
          <div className="flex flex-col gap-8 md:gap-12">

            {/* Hero Text */}
            <div className="w-full text-left md:-ml-2">
              <div className="flex items-center gap-2 text-[#5a8b43] font-medium text-sm md:text-base mb-4">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.25.24 2.45.67 3.56l-1.38 1.38 1.41 1.41 1.38-1.38C5.19 20.8 7.42 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2zm0 18c-2.03 0-3.92-.78-5.34-2.06l6.4-6.4 1.41 1.41-6.4 6.4C9.55 19.8 10.74 20 12 20c4.41 0 8-3.59 8-8s-3.59-8-8-8-8 3.59-8 8c0 1.37.34 2.65.94 3.76l6.3-6.3 1.41 1.41-6.3 6.3c1.78 2.06 4.46 3.19 7.31 3.19z" />
                  <path d="M17.2 3.8a10.9 10.9 0 0 0-7.3-1.6A11.1 11.1 0 0 0 4 8.7a11.1 11.1 0 0 0-1.8 7.1l-1.5 1.5 1.4 1.4 1.5-1.5a11 11 0 0 0 7.2-1.7 11.1 11.1 0 0 0 6.5-6.5 11 11 0 0 0 0-7V3.8zM15 9c-.8 2.3-2.3 4.2-4.2 5.5l-4-4c1.3-1.8 3.2-3.3 5.5-4.1 2.3-.8 4.7-.6 6.5.6-1.1 1.7-2.6 2.8-3.8 2z" />
                </svg>
                Your Health, Our Priority
              </div>
              <h1 className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-[-1.5px] mb-6 capitalize">
                <span className="text-[#1e2a35] block">Your Daily Guide To</span>
                <span className="text-[#0f7c85] block">Health &amp; Wellness</span>
              </h1>
              <p className="text-secondary text-base md:text-xl leading-relaxed max-w-xl mb-8">
                Discover trusted health blogs, expert magazines, disease awareness,
                nutrition tips, mental wellness, and practical lifestyle guidance
                everything you need to make informed decisions for a healthier life.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Button href="/blogs" variant="primary">
                  Explore Blogs
                </Button>
                <Button href="/publication" variant="glass">
                  Explore Magazines
                </Button>
              </div>
            </div>
          </div>

          {/* Middle Column: Trending Sidebar */}
          {/* <div className="flex flex-col w-full lg:max-w-sm -mt-2 md:-mt-6">
            <div className="bg-white/60 border border-slate-200/50 rounded-[32px] p-6 md:p-8 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-2.5 text-primary font-heading font-extrabold text-base md:text-lg mb-8 tracking-tight">
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
                      <span className="text-accent font-bold text-xs uppercase tracking-wider">{art.category}</span>
                      <Link href={`/blogs/${art.slug}`} className="text-primary font-heading font-bold text-[13.5px] md:text-[14.5px] leading-snug group-hover:text-accent transition-colors no-underline">
                        {art.title}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div> */}
        </div>

      </div>
    </section>
  );
}
