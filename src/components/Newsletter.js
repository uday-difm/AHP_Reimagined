'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import RecaptchaWidget from '@/components/RecaptchaWidget';

export default function Newsletter() {
  const [newsEmail, setNewsEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    const token = typeof window !== 'undefined' && window.grecaptcha ? window.grecaptcha.getResponse() : null;
    if (typeof window !== 'undefined' && document.querySelector('meta[name="recaptcha-site-key"]') && !token) {
      setStatus({ type: 'error', message: 'Please complete the reCAPTCHA verification.' });
      return;
    }
    setLoading(true);
    setStatus(null);

    const siteId = process.env.NEXT_PUBLIC_SITE_ID || "AHP";

    try {
      const res = await fetch(`/api/newsletter/subscribe?siteId=${siteId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newsEmail,
          metadata: { source: "homepage-newsletter" }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to subscribe.");
      }

      setStatus({ type: "success", message: "Thank you! You have successfully subscribed to our newsletter." });
      setNewsEmail('');
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="cta-section py-[80px] bg-white relative overflow-hidden">
      {/* Decorative Blur Flares */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-accent/5 top-[-15%] left-[-5%] pointer-events-none blur-3xl" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[#27ae60]/5 bottom-[-15%] right-[-5%] pointer-events-none blur-3xl" />

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center reveal-slide">

          <span className="text-accent text-xs font-bold uppercase tracking-[2.5px] block mb-4">STAY CONNECTED</span>
          <h2 className="cta-title font-bold text-primary mb-4">
            Subscribe to our newsletter
          </h2>
          <p className="cta-subtitle description text-secondary mb-10 max-w-xl mx-auto">
            Join 50,000+ wellness readers receiving expert medical guidelines directly in their inbox every week. Zero spam, unsubscribe at any time.
          </p>

          <form className="flex flex-col gap-4 w-full max-w-[520px] mx-auto" onSubmit={handleNewsSubmit}>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <input
                type="email"
                value={newsEmail}
                disabled={loading}
                onChange={(e) => setNewsEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-grow bg-white border border-slate-200 rounded-full px-6 py-4 text-base placeholder:text-sm outline-none text-primary focus:border-accent focus:shadow-[0_0_0_4px_rgba(31,185,251,0.1)] transition-all shadow-sm disabled:opacity-60"
              />
              <Button type="submit" variant="primary" disabled={loading} className="whitespace-nowrap !py-4 !px-8 text-sm md:text-base">
                {loading ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>
            <RecaptchaWidget />
          </form>

          {status && (
            <div className={`mt-6 p-4 rounded-xl text-sm font-semibold max-w-[520px] mx-auto border transition-all ${
              status.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {status.message}
            </div>
          )}

          <p className="small-notes text-slate-400 mt-5 font-medium">
            No credit card required · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
