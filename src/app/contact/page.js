'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackdropBlobs from '@/components/BackdropBlobs';
import ScrollReveal from '@/components/ScrollReveal';
import CustomCursor from '@/components/CustomCursor';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Support',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate contact submission
    console.log('Form submission data:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: 'General Support', message: '' });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-bg-light relative overflow-x-hidden">
      <CustomCursor />
      <ScrollReveal />
      <BackdropBlobs />
      <Header />

      {/* Main Content Area */}
      <main className="relative z-10 pt-[140px] pb-24">
        <div className="container max-w-7xl">
          
          {/* Header Intro */}
          <div className="text-center max-w-2xl mx-auto mb-16 reveal-slide">
            <span className="text-accent text-[11px] font-bold uppercase tracking-[2.5px] block mb-3">GET IN TOUCH</span>
            <h1 className="font-heading font-extrabold text-[36px] md:text-[54px] tracking-[-1.5px] leading-[1.1] text-primary uppercase mb-6">
              <strong>Contact Our Team</strong>
            </h1>
            <p className="text-secondary text-[16px] md:text-[18px] leading-relaxed">
              Have questions about our clinically reviewed articles, digital publications, or partnerships? Write to us, and our team will get back to you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-12 lg:gap-20 items-start">
            
            {/* Left Column: Info & Details */}
            <div className="flex flex-col gap-8 reveal-slide">
              <div className="bg-white/60 border border-slate-200/50 rounded-[32px] p-8 md:p-10 shadow-sm backdrop-blur-xl">
                <h3 className="font-heading font-bold text-[24px] text-primary tracking-[-0.5px] mb-6">Communication Channels</h3>
                <p className="text-secondary text-[14.5px] leading-relaxed mb-8">
                  We look forward to helping you with any queries. For general support, partnerships, or editorial board concerns, please reach out via the emails below.
                </p>

                <div className="flex flex-col gap-6">
                  {/* Email */}
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-primary font-heading font-bold text-[15px] mb-1">Email Inquiry</h4>
                      <a href="mailto:support@ahealthplace.com" className="text-accent text-[14px] font-medium hover:underline transition-all">
                        support@ahealthplace.com
                      </a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-[#27ae60]/10 flex items-center justify-center text-[#27ae60] shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-primary font-heading font-bold text-[15px] mb-1">Support Hours</h4>
                      <p className="text-secondary text-[14px] leading-relaxed">
                        Monday - Friday, 9:00 AM - 5:00 PM EST
                      </p>
                    </div>
                  </div>

                  {/* ISSN Info */}
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-primary font-heading font-bold text-[15px] mb-1">Publications</h4>
                      <p className="text-secondary text-[14px] leading-relaxed">
                        Registered ISSN Digital Health Publisher
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* Right Column: Form Container */}
            <div className="reveal-fade">
              <div className="bg-white border border-slate-200/60 rounded-[32px] p-8 md:p-10 shadow-[0_16px_40px_rgba(0,0,0,0.03)] backdrop-blur-xl">
                <span className="text-[#27ae60] text-[10px] font-bold tracking-[2.5px] uppercase block mb-2">FEEDBACK FORM</span>
                <h3 className="font-heading font-bold text-[24px] text-primary tracking-[-0.5px] mb-8">Send Us a Message</h3>

                {submitted ? (
                  <div className="py-12 text-center flex flex-col items-center gap-4 transition-all">
                    <div className="w-16 h-16 rounded-full bg-[#e8f8f0] flex items-center justify-center text-[#27ae60] mb-2 animate-bounce">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <h4 className="font-heading font-bold text-[20px] text-primary">Message Sent Successfully!</h4>
                    <p className="text-secondary text-[14px] max-w-xs leading-relaxed">
                      Thank you for contacting us. One of our wellness representatives will reach out to you shortly.
                    </p>
                  </div>
                ) : (
                  <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-secondary text-[12px] font-bold uppercase tracking-wider mb-2">Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-5 py-3.5 text-sm outline-none text-primary focus:border-accent focus:bg-white transition-all"
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
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-5 py-3.5 text-sm outline-none text-primary focus:border-accent focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-secondary text-[12px] font-bold uppercase tracking-wider mb-2">Subject</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-5 py-3.5 text-sm outline-none text-primary focus:border-accent focus:bg-white transition-all"
                      >
                        <option value="General Support">General Support</option>
                        <option value="Editorial Board Query">Editorial Inquiry</option>
                        <option value="Digital Magazine Support">Magazine Support</option>
                        <option value="Partnerships">Partnership Proposals</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-secondary text-[12px] font-bold uppercase tracking-wider mb-2">Message</label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Please write your detailed request here..."
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-5 py-3.5 text-sm outline-none text-primary focus:border-accent focus:bg-white transition-all resize-none"
                      />
                    </div>

                    {/* Medical Disclaimer */}
                    <div className="bg-[#e8f8f0] border border-[#27ae60]/10 rounded-[20px] p-4 flex gap-3 items-start">
                      <svg className="w-5 h-5 text-[#27ae60] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110.5 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.746 3.746 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0113.5 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                      </svg>
                      <p className="text-[12.5px] leading-relaxed text-[#1a5f35]">
                        <strong>Medical Disclaimer:</strong> Inquiries via this contact page do not constitute medical consultation or advice. For immediate health emergencies, please consult a physician.
                      </p>
                    </div>

                    <button type="submit" className="w-full bg-[#0f7c85] hover:bg-[#0c6b73] text-white py-4 rounded-xl font-bold text-[14px] transition-colors shadow-md mt-2 cursor-pointer">
                      Submit Message
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
