'use client';

import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { Loader2 } from 'lucide-react';

function LoginClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle URL tabs (e.g. /login?tab=register)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      const callbackUrl = searchParams.get('callbackUrl') || '/quizzes/dashboard';
      router.replace(callbackUrl);
    }
  }, [status, router, searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      return setError('Please enter both email and password.');
    }

    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password.');
        setLoading(false);
      } else {
        setSuccessMsg('Logged in successfully!');
        const callbackUrl = searchParams.get('callbackUrl') || '/quizzes/dashboard';
        router.replace(callbackUrl);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password || !name.trim() || !username.trim()) {
      return setError('All fields are required.');
    }

    setLoading(true);

    try {
      const regRes = await fetch('/api/quizess/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          name,
          username,
          email,
          password,
        }),
      });

      const regData = await regRes.json();

      if (!regRes.ok) {
        setLoading(false);
        return setError(regData.error || 'Registration failed');
      }

      setSuccessMsg('Registration successful! Logging you in...');

      // Auto login after registration
      const logRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (logRes?.error) {
        setError('Auto login failed. Please sign in manually.');
        setLoading(false);
      } else {
        const callbackUrl = searchParams.get('callbackUrl') || '/quizzes/dashboard';
        router.replace(callbackUrl);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred during registration.');
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#0f7c85] mx-auto mb-4" size={40} />
          <p className="text-slate-400 text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 pt-32 pb-20">
        <div className="w-full max-w-[440px] min-h-[530px] flex flex-col bg-white rounded-[32px] border border-slate-200/60 p-8 md:p-10 shadow-xl"
          style={{ boxShadow: '0 12px 36px rgba(0,0,0,0.03)' }}>
          
          {/* Header tabs */}
          <div className="flex border-b border-slate-100 mb-8">
            <button
              onClick={() => { setActiveTab('login'); setError(''); setSuccessMsg(''); }}
              className="flex-1 pb-4 text-[15px] font-heading font-extrabold transition-all border-b-2 cursor-pointer"
              style={{
                borderColor: activeTab === 'login' ? '#0f7c85' : 'transparent',
                color: activeTab === 'login' ? '#1e2a35' : '#cbd5e1',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(''); setSuccessMsg(''); }}
              className="flex-1 pb-4 text-[15px] font-heading font-extrabold transition-all border-b-2 cursor-pointer"
              style={{
                borderColor: activeTab === 'register' ? '#0f7c85' : 'transparent',
                color: activeTab === 'register' ? '#1e2a35' : '#cbd5e1',
              }}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-[13.5px] outline-none focus:border-[#0f7c85] focus:bg-white transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-[13.5px] outline-none focus:border-[#0f7c85] focus:bg-white transition-all duration-200"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 rounded-xl p-3 text-[12px] font-semibold border border-red-100">
                  ⚠️ {error}
                </div>
              )}

              {successMsg && (
                <div className="bg-green-50 text-[#00b050] rounded-xl p-3 text-[12px] font-semibold border border-green-100">
                  ✓ {successMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full font-heading font-bold text-[14px] text-white bg-[#0f7c85] hover:bg-[#0c6b73] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-[13.5px] outline-none focus:border-[#0f7c85] focus:bg-white transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-[13.5px] outline-none focus:border-[#0f7c85] focus:bg-white transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-[13.5px] outline-none focus:border-[#0f7c85] focus:bg-white transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-[13.5px] outline-none focus:border-[#0f7c85] focus:bg-white transition-all duration-200"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 rounded-xl p-3 text-[12px] font-semibold border border-red-100">
                  ⚠️ {error}
                </div>
              )}

              {successMsg && (
                <div className="bg-green-50 text-[#00b050] rounded-xl p-3 text-[12px] font-semibold border border-green-100">
                  ✓ {successMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full font-heading font-bold text-[14px] text-white bg-[#0f7c85] hover:bg-[#0c6b73] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          <p className="mt-auto pt-6 text-center text-[12px] text-slate-400">
            By signing in, you agree to our{' '}
            <Link href="/legal/terms" className="text-accent underline font-semibold">Terms</Link> and{' '}
            <Link href="/legal/privacy" className="text-accent underline font-semibold">Privacy Policy</Link>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <Loader2 className="animate-spin text-[#0f7c85]" size={32} />
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
