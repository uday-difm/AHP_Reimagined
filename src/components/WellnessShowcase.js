import Link from 'next/link';

// Quiz small cards — row 1 right column (light bg)
const quizQuickCards = [
  {
    tag: 'Daily Quiz',
    icon: '🌅',
    desc: 'A fresh 5-question wellness check, updated every day.',
    link: '/quizzes/sleep-quality',
  },
  {
    tag: 'Stress Check',
    icon: '🧠',
    desc: 'Measure your mental load and unlock targeted breathing guides.',
    link: '/quizzes/stress-burnout',
  },
  {
    tag: 'Nutrition IQ',
    icon: '🥗',
    desc: 'Rate your diet quality and get personalised food insights.',
    link: '/quizzes/nutrition-gut',
  },
];

// Quiz small cards — row 2 left column (teal bg)
const quizDeepCards = [
  {
    tag: 'Sleep Quality',
    icon: '🌙',
    desc: 'Assess your REM cycles, sleep hygiene, and overnight recovery.',
    link: '/quizzes/sleep-quality',
  },
  {
    tag: 'Dosha Discovery',
    icon: '🌿',
    desc: 'Uncover your Ayurvedic mind-body constitution in 10 questions.',
    link: '/quizzes/dosha-body-type',
  },
  {
    tag: 'My Dashboard',
    icon: '📊',
    desc: 'View all your past quiz scores, insights, and progress reports.',
    link: '/quizzes/dashboard',
  },
];

export default function WellnessShowcase() {
  return (
    <section id="about" className="values-section py-[100px] bg-slate-50/50 rounded-b-[40px]">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-grid grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-[60px] mb-16 items-end">
          <div className="reveal-slide">
            <h2 className="section-title-large font-heading font-bold text-[32px] md:text-[54px] leading-[1.15] text-primary tracking-[-1px]">
              Know your body,<br />one quiz at a time.
            </h2>
          </div>
          <div className="reveal-fade">
            <p className="section-subtitle-text text-[16px] text-secondary leading-[1.7]">
              Our clinically informed quizzes help you understand your health from the inside out — covering sleep, stress, nutrition, and Ayurvedic wellness. Start free, go deeper with a{' '}
              <Link href="/login" className="text-accent font-semibold hover:underline transition-colors">
                free account
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Modular Grid Layout */}
        <div className="flex flex-col gap-8">

          {/* Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Large Card: Daily Quiz Hero */}
            <div className="lg:col-span-2 rounded-[32px] p-8 md:p-10 flex flex-col justify-between items-center text-center relative overflow-hidden h-[420px] md:h-[460px] reveal-slide"
              style={{ background: 'linear-gradient(140deg, #dceeed 0%, #c8e8e7 100%)', border: '1px solid rgba(15,124,133,0.15)' }}>

              {/* Decorative blob */}
              <div className="absolute top-[-60px] right-[-60px] w-[220px] h-[220px] rounded-full opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #0f7c85 0%, transparent 70%)' }} />

              <div className="flex flex-col items-center max-w-md z-10">
                <span className="text-[#0f7c85] font-extrabold text-[11px] uppercase tracking-[2.5px] mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0f7c85] animate-pulse inline-block" />
                  Daily Wellness Quiz
                </span>
                <h3 className="text-primary font-heading font-extrabold text-[26px] md:text-[34px] leading-tight tracking-tight mb-4">
                  Test yourself today.
                </h3>
                <p className="text-[#4a4a5a] text-[13.5px] md:text-[14.5px] leading-relaxed mb-6">
                  Take a quick 5-minute assessment and discover actionable insights about your sleep, stress, nutrition, or Ayurvedic body type — all backed by clinical research.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/quizzes" className="bg-[#0f7c85] hover:bg-[#0c646b] text-white font-bold text-[12.5px] py-3 px-6 rounded-full transition-all duration-300 no-underline shadow-sm">
                    Browse All Quizzes
                  </Link>
                  <Link href="/quizzes/sleep-quality" className="bg-white hover:bg-slate-50 text-[#0f7c85] font-bold text-[12.5px] py-3 px-6 rounded-full transition-all duration-300 no-underline shadow-sm border border-[#0f7c85]/20">
                    Start Now →
                  </Link>
                </div>
              </div>

              {/* Decorative floating score ring */}
              <div className="absolute bottom-[-70px] w-[180px] h-[180px] z-0 opacity-30 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#0f7c85" strokeWidth="8" strokeDasharray="140 124" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#27ae60" strokeWidth="8" strokeDasharray="80 184" strokeLinecap="round" strokeDashoffset="-140" />
                </svg>
              </div>
              {/* Free preview badge */}
              <div className="absolute bottom-6 right-8 text-[10px] font-extrabold px-3 py-1 rounded-full z-10"
                style={{ background: '#0f7c8520', color: '#0f7c85' }}>
                🔓 First 2 Qs free
              </div>
            </div>

            {/* Right Column: 3 Quick Quiz Cards */}
            <div className="flex flex-col gap-4 reveal-slide">
              {quizQuickCards.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.link}
                  className="bg-[#eaf1f0] hover:bg-[#e0e9e8] rounded-[24px] p-5 flex items-center justify-between gap-4 border border-slate-100 hover:shadow-md transition-all duration-300 group no-underline text-left flex-grow"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-[22px] shrink-0">{item.icon}</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[#0f7c85] font-extrabold text-[10px] uppercase tracking-wider">{item.tag}</span>
                      <p className="text-primary font-heading font-bold text-[13px] leading-snug">{item.desc}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 border border-slate-100/50 group-hover:scale-105 transition-transform">
                    <svg className="w-4 h-4 text-[#0f7c85]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: 3 Deep Dive Cards (teal bg) */}
            <div className="flex flex-col gap-4 order-2 lg:order-1 reveal-slide">
              {quizDeepCards.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.link}
                  className="bg-[#3f9a9e] hover:bg-[#368b8e] rounded-[24px] p-5 flex items-center justify-between gap-4 hover:shadow-md transition-all duration-300 group no-underline text-left flex-grow"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-[22px] shrink-0">{item.icon}</span>
                    <div className="flex flex-col gap-0.5 text-white">
                      <span className="text-white/80 font-extrabold text-[10px] uppercase tracking-wider">{item.tag}</span>
                      <p className="font-heading font-bold text-[13px] leading-snug">{item.desc}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-4 h-4 text-[#3f9a9e]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>

            {/* Large Card: Quiz Dashboard CTA */}
            <div
              className="lg:col-span-2 rounded-[32px] p-8 md:p-10 flex flex-col justify-between items-center text-center relative overflow-hidden h-[420px] md:h-[460px] order-1 lg:order-2 reveal-slide"
              style={{ background: 'linear-gradient(140deg, #1c7b80 0%, #155f64 100%)' }}
            >
              {/* Decorative blobs */}
              <div className="absolute top-[-40px] left-[-40px] w-[200px] h-[200px] rounded-full opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }} />
              <div className="absolute bottom-[-60px] right-[-30px] w-[240px] h-[240px] rounded-full opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #27ae60 0%, transparent 70%)' }} />

              <div className="flex flex-col items-center max-w-md z-10 text-white">
                <span className="text-white/80 font-extrabold text-[11px] uppercase tracking-[2.5px] mb-3">
                  Your Wellness Journey
                </span>
                <h3 className="font-heading font-extrabold text-[26px] md:text-[34px] leading-tight tracking-tight mb-4 text-white">
                  Track your health over time.
                </h3>
                <p className="text-white/90 text-[13.5px] md:text-[14.5px] leading-relaxed mb-4">
                  Sign in to unlock full quiz access, save your results, view personalised insights, and track your wellness journey with your private dashboard.
                </p>

                {/* Mini stat row */}
                <div className="flex gap-6 mb-6">
                  {[{ v: '4', l: 'Quizzes' }, { v: '2', l: 'Free Qs' }, { v: '∞', l: 'Insights' }].map((s, i) => (
                    <div key={i} className="text-center">
                      <div className="font-heading font-extrabold text-[22px] text-white">{s.v}</div>
                      <div className="text-[10px] text-white/60 uppercase tracking-wider">{s.l}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/quizzes/dashboard" className="bg-white text-[#1c7b80] hover:bg-slate-100 font-bold text-[12.5px] py-3 px-6 rounded-full transition-all duration-300 no-underline shadow-sm">
                    My Dashboard
                  </Link>
                  <Link href="/quizzes" className="border border-white/40 hover:border-white/80 text-white font-bold text-[12.5px] py-3 px-6 rounded-full transition-all duration-300 no-underline">
                    All Quizzes
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
