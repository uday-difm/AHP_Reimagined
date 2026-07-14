'use client';

import { useState } from 'react';
import Button from '@/components/Button';

export default function Newsletter() {
  const [newsEmail, setNewsEmail] = useState('');

  const handleNewsSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you for subscribing with: ${newsEmail}`);
    setNewsEmail('');
  };

  return (
    <section id="contact" className="cta-section py-[80px] bg-white relative overflow-hidden">
      {/* Decorative Blur Flares */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-accent/5 top-[-15%] left-[-5%] pointer-events-none blur-3xl" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[#27ae60]/5 bottom-[-15%] right-[-5%] pointer-events-none blur-3xl" />

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center reveal-slide">

          <span className="text-accent text-xs font-bold uppercase tracking-[2.5px] block mb-4">STAY CONNECTED</span>
          <h2 className="cta-title font-heading font-extrabold text-3xl md:text-5xl text-primary tracking-[-1px] leading-[1.15] mb-4">
            Subscribe to our newsletter
          </h2>
          <p className="cta-subtitle text-base md:text-lg text-secondary leading-relaxed mb-10 max-w-xl mx-auto">
            Join 50,000+ wellness readers receiving expert medical guidelines directly in their inbox every week. Zero spam, unsubscribe at any time.
          </p>

          <form className="flex flex-col sm:flex-row gap-3 w-full max-w-[520px] mx-auto" onSubmit={handleNewsSubmit}>
            <input
              type="email"
              value={newsEmail}
              onChange={(e) => setNewsEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-grow bg-white border border-slate-200 rounded-full px-6 py-4 text-sm outline-none text-primary focus:border-accent focus:shadow-[0_0_0_4px_rgba(31,185,251,0.1)] transition-all shadow-sm"
            />
            <Button type="submit" variant="primary" className="whitespace-nowrap !py-4 !px-8">
              Subscribe
            </Button>
          </form>

          <p className="text-slate-400 text-xs mt-5 font-medium">
            No credit card required · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
