import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
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
      <Header />

      <main className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0fdfd 0%, #f8fafc 60%)' }}>
        {/* Hero */}
        <section className="pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-5xl text-center">
            {/* Badge */}
            <span
              className="inline-block text-[11px] font-extrabold uppercase tracking-[2.5px] px-4 py-1.5 rounded-full mb-6"
              style={{ background: '#e8f8f0', color: '#27ae60' }}
            >
              ✦ Free Wellness Assessments
            </span>

            <h1 className="font-heading font-extrabold text-[40px] md:text-[58px] leading-[1.1] tracking-tight text-primary mb-5">
              Know your body,{' '}
              <span style={{ color: '#0f7c85' }}>inside out.</span>
            </h1>

            <p className="text-secondary text-[16px] md:text-[18px] leading-relaxed max-w-2xl mx-auto mb-8">
              Evidence-based quizzes crafted with our clinical advisors. Get personalised health insights in under 10 minutes — completely free to start.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {[
                { value: '4', label: 'Quizzes available' },
                { value: '2', label: 'Free questions' },
                { value: '100%', label: 'Clinically informed' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="font-heading font-extrabold text-[28px]" style={{ color: '#0f7c85' }}>
                    {stat.value}
                  </div>
                  <div className="text-[12px] text-muted uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quiz grid */}
        <section className="pb-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 reveal-slide">
              {quizzes.map((quiz) => (
                <QuizCard key={quiz.slug} quiz={quiz} />
              ))}
            </div>

            {/* Free tier notice */}
            <div
              className="mt-10 rounded-[20px] p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left"
              style={{ background: 'linear-gradient(135deg, #e8f4ff, #f0fdfd)', border: '1px solid #1fb9fb30' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-[20px]"
                style={{ background: '#1fb9fb15' }}
              >
                🔓
              </div>
              <div className="flex-1">
                <p className="font-heading font-bold text-[15px] text-primary mb-0.5">
                  First 2 questions are always free
                </p>
                <p className="text-[13px] text-secondary">
                  Sign in with your free account to unlock full quiz access, save your results, and track your wellness journey over time.
                </p>
              </div>
              <Link
                href="/login"
                className="shrink-0 px-5 py-2.5 rounded-full font-bold text-[13px] text-white no-underline transition-all duration-300 hover:opacity-90"
                style={{ background: '#0f7c85' }}
              >
                Sign In Free
              </Link>
            </div>

            {/* Dashboard link for logged-in users */}
            <div className="mt-6 text-center">
              <Link
                href="/quizzes/dashboard"
                className="inline-flex items-center gap-2 text-[13px] font-bold no-underline transition-all duration-200 hover:opacity-70"
                style={{ color: '#0f7c85' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h8" />
                </svg>
                View my quiz dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
