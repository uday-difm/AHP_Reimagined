'use client';

import { useState } from 'react';
import Button from '@/components/Button';

export default function Newsletter() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [newsEmail, setNewsEmail] = useState('');

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you ${formData.name}, your message has been sent to A Health Place!`);
    setFormData({ name: '', email: '', message: '' });
  };

  const handleNewsSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you for subscribing with: ${newsEmail}`);
    setNewsEmail('');
  };

  return (
    <section id="contact" className="cta-section py-[100px] bg-slate-50/50 rounded-[40px] relative overflow-hidden">
      {/* Decorative Blur Flares */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-accent/5 top-[-10%] left-[-5%] pointer-events-none blur-3xl" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-[#27ae60]/5 bottom-[-10%] right-[-5%] pointer-events-none blur-3xl" />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Newsletter & Info */}
          <div className="flex flex-col gap-6 reveal-slide">
            <span className="text-accent text-[11px] font-bold uppercase tracking-[2.5px] block">STAY CONNECTED</span>
            <h2 className="cta-title font-heading font-extrabold text-[36px] md:text-[50px] text-primary tracking-[-1.5px] leading-[1.1] mb-2">
              Subscribe to our newsletter
            </h2>
            <p className="cta-subtitle text-[15px] text-secondary leading-relaxed mb-6">
              Join 50,000+ wellness readers receiving expert medical guidelines directly in their inbox every week. Zero spam, unsubscribe at any time.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-3 w-full max-w-[480px]" onSubmit={handleNewsSubmit}>
              <input
                type="email"
                value={newsEmail}
                onChange={(e) => setNewsEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-grow bg-white border border-slate-200 rounded-full px-6 py-3.5 text-sm outline-none text-primary focus:border-accent focus:shadow-[0_0_0_4px_rgba(31,185,251,0.1)] transition-all"
              />
              <Button type="submit" variant="primary" className="whitespace-nowrap">
                Subscribe
              </Button>
            </form>
          </div>

          {/* Right Column: Contact Form inside a Glassmorphic Card */}
          <div className="reveal-fade">
            <div className="bg-white border border-slate-200/60 rounded-[32px] p-8 md:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.03)] backdrop-blur-xl">
              <span className="text-[#27ae60] text-[10px] font-bold tracking-[2.5px] uppercase block mb-2">GET IN TOUCH</span>
              <h3 className="font-heading font-bold text-[24px] text-primary tracking-[-0.5px] mb-6">Write to Us</h3>
              
              <form className="flex flex-col gap-5" onSubmit={handleContactSubmit}>
                <div>
                  <label className="block text-secondary text-[12px] font-bold uppercase tracking-wider mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-5 py-3 text-sm outline-none text-primary focus:border-accent focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-secondary text-[12px] font-bold uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Your email address"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-5 py-3 text-sm outline-none text-primary focus:border-accent focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-secondary text-[12px] font-bold uppercase tracking-wider mb-2">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we help you?"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-5 py-3 text-sm outline-none text-primary focus:border-accent focus:bg-white transition-all resize-none"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full !rounded-xl !py-4 mt-2">
                  Send Message
                </Button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
