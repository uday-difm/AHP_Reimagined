import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import BackdropBlobs from '@/components/BackdropBlobs';
import QuizCard from '@/components/quiz/QuizCard';
import { quizzes } from '@/data/quizzes';
import Link from 'next/link';

export const metadata = {
  title: 'Wellness Quizzes — A Health Place',
  description: 'Take evidence-based wellness quizzes covering sleep, stress, nutrition, and Ayurvedic body type. Get personalised health insights.',
};

export default function QuizzesPage() {
  return (
    <>
      <ScrollReveal />
      <BackdropBlobs />
      <Header />

      <main className="min-h-screen bg-bg-light relative">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="pt-[140px] pb-10 rounded-b-[40px] border-b border-slate-200/20 text-center relative overflow-hidden"
          style={{ background: '#f0f6f3/60', backgroundColor: 'rgb(240,246,243,0.6)' }}>

          <div className="container max-w-4xl">
            <span className="text-accent text-[11px] font-bold uppercase tracking-[2px] mb-3 block reveal-slide">
              WELLNESS ASSESSMENTS
            </span>

            <h1 className="text-primary font-heading font-extrabold text-4xl md:text-5xl tracking-[-1.5px] leading-tight mb-4 reveal-slide">
              Know your body,{' '}
              <span style={{ color: '#0f7c85' }}>inside out.</span>
            </h1>

            <p className="text-secondary text-[15px] max-w-xl mx-auto mb-8 reveal-slide">
              Evidence-based quizzes crafted with our clinical advisors. Get personalised health insights in under 10 minutes — completely free to start.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-8 reveal-fade">
              {[
                { value: '4', label: 'Quizzes Available' },
                { value: '2', label: 'Free Questions' },
                { value: '100%', label: 'Clinically Informed' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-heading font-extrabold text-[28px]" style={{ color: '#0f7c85' }}>{s.value}</div>
                  <div className="text-[11px] text-muted uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-3 reveal-slide">
              <Link
                href={`/quizzes/${quizzes[0].slug}`}
                className="bg-[#0f7c85] hover:bg-[#0c6b73] text-white px-8 py-3.5 rounded-full font-bold text-[15px] transition-colors shadow-md no-underline"
              >
                Start a Quiz
              </Link>
              <Link
                href="/quizzes/dashboard"
                className="bg-white/80 hover:bg-white text-[#0f7c85] border border-[#0f7c85]/20 backdrop-blur-sm px-8 py-3.5 rounded-full font-bold text-[15px] transition-all shadow-sm no-underline"
              >
                My Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* ── QUIZ GRID ─────────────────────────────────────────────────────── */}
        <section className="py-16 px-4">
          <div className="container max-w-6xl mx-auto">

            {/* Section label row */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="text-accent text-[11px] font-bold uppercase tracking-[2px]">All Quizzes</span>
                <div className="h-px w-12 bg-accent/30" />
              </div>
              <Link
                href="/quizzes/dashboard"
                className="flex items-center gap-1.5 text-[13px] font-bold no-underline text-secondary hover:text-accent transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h8" />
                </svg>
                My Results
              </Link>
            </div>

            {/* 2×2 responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 reveal-slide">
              {quizzes.map((quiz) => (
                <QuizCard key={quiz.slug} quiz={quiz} />
              ))}
            </div>

            {/* ── FREE TIER NOTICE ────────────────────────────────────────── */}
            <div
              className="mt-10 rounded-[24px] p-6 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left border border-slate-200/60 bg-white"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-[22px]"
                style={{ background: '#e8f4ff' }}
              >
                🔓
              </div>
              <div className="flex-1">
                <p className="font-heading font-bold text-[15px] text-primary mb-1">
                  First 2 questions are always free
                </p>
                <p className="text-[13px] text-secondary">
                  Create a free account to unlock all questions, save your results, and track your wellness journey over time.
                </p>
              </div>
              <Link
                href="/login"
                className="shrink-0 bg-[#0f7c85] hover:bg-[#0c6b73] text-white px-6 py-3 rounded-full font-bold text-[13px] no-underline transition-colors shadow-sm"
              >
                Sign In Free
              </Link>
            </div>

            {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
            <div className="mt-16">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-accent text-[11px] font-bold uppercase tracking-[2px]">How It Works</span>
                <div className="h-px flex-1 max-w-[60px] bg-accent/30" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    step: '01',
                    title: 'Pick a quiz',
                    desc: 'Choose from Sleep, Stress, Nutrition, or Dosha assessments — all clinically informed.',
                    icon: '🎯',
                    color: '#1fb9fb',
                    bg: '#e8f4ff',
                  },
                  {
                    step: '02',
                    title: 'Answer freely',
                    desc: 'First 2 questions are always free. No account needed — just honest answers.',
                    icon: '✍️',
                    color: '#27ae60',
                    bg: '#e8f8f0',
                  },
                  {
                    step: '03',
                    title: 'Unlock insights',
                    desc: 'Sign in to complete the quiz, get your score, and save personalised health insights.',
                    icon: '🔓',
                    color: '#0f7c85',
                    bg: '#e8f4f4',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-[24px] p-6 border border-slate-200/60 relative overflow-hidden"
                    style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}
                  >
                    {/* Ghost step number */}
                    <div
                      className="absolute top-3 right-5 font-heading font-extrabold text-[56px] leading-none pointer-events-none select-none"
                      style={{ color: item.color + '10' }}
                    >
                      {item.step}
                    </div>

                    {/* Icon circle */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-[22px] mb-4"
                      style={{ background: item.bg }}
                    >
                      {item.icon}
                    </div>

                    <h4 className="font-heading font-extrabold text-[16px] text-primary mb-2">{item.title}</h4>
                    <p className="text-[13px] text-secondary leading-relaxed">{item.desc}</p>

                    <div className="mt-4 w-8 h-0.5 rounded-full" style={{ background: item.color }} />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
