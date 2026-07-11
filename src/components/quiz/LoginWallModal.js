'use client';

import { signIn } from 'next-auth/react';
import { useEffect } from 'react';

/**
 * LoginWallModal
 * Appears as a full-viewport overlay after the user exhausts their free questions.
 * Does NOT provide a dismiss/close option — forces the user to act.
 */
export default function LoginWallModal({ quizTitle, onAfterLogin }) {
  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSignIn = () => {
    // callbackUrl brings the user back to the quiz after login
    const callbackUrl = typeof window !== 'undefined' ? window.location.href : '/quizzes';
    window.location.href = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', background: 'rgba(15,16,30,0.72)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Login required to continue quiz"
    >
      {/* Decorative glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 60%, rgba(15,124,133,0.18) 0%, transparent 70%)',
        }}
      />

      <div
        className="relative w-full max-w-md mx-4 rounded-[28px] overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(145deg, #ffffff 0%, #f0fdfd 100%)', border: '1.5px solid rgba(15,124,133,0.15)' }}
      >
        {/* Top accent bar */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #0f7c85, #1fb9fb, #27ae60)' }} />

        <div className="px-8 py-10 flex flex-col items-center text-center">
          {/* Lock icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-5 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0f7c85, #0c646b)' }}
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v-2m0 0a2 2 0 110-4 2 2 0 010 4zm6-5V9a6 6 0 10-12 0v3M5 12h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="font-heading font-extrabold text-[24px] text-primary leading-tight tracking-tight mb-2">
            You're halfway there!
          </h2>

          <p className="text-secondary text-[14px] leading-relaxed mb-1 max-w-[300px]">
            Sign in to unlock the rest of the
          </p>
          <p className="font-heading font-bold text-[15px] mb-5" style={{ color: '#0f7c85' }}>
            "{quizTitle}"
          </p>

          {/* Benefits list */}
          <ul className="text-left space-y-2 mb-8 w-full max-w-[280px]">
            {[
              'Complete all 10 questions',
              'See your personalised score & insights',
              'Access your quiz history & dashboard',
              'Save results & track your progress',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2.5 text-[13px] text-secondary">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: '#e8f8f0' }}
                >
                  <svg className="w-3 h-3" style={{ color: '#27ae60' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>

          {/* CTA Buttons */}
          <button
            id="quiz-wall-signin-btn"
            onClick={handleSignIn}
            className="w-full py-3.5 rounded-full font-heading font-bold text-[14.5px] text-white mb-3 shadow-lg transition-all duration-300 hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #0f7c85, #0c646b)' }}
          >
            Sign In to Continue
          </button>

          <a
            id="quiz-wall-register-btn"
            href={`/login?tab=register&callbackUrl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '/quizzes')}`}
            className="w-full py-3.5 rounded-full font-heading font-bold text-[14.5px] text-center no-underline transition-all duration-300 hover:bg-slate-100 border border-slate-200 block"
            style={{ color: '#0f7c85' }}
          >
            Create Free Account
          </a>

          <p className="text-[11px] text-muted mt-4">
            Free forever · No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}
