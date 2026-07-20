'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { Star, ArrowLeft, CheckCircle, HelpCircle, Mail } from 'lucide-react';

function proxyUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `/api/media/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export default function ServiceDetailView({ service }) {
  const [modalStep, setModalStep] = useState('details'); // details | form | success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [email, setEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [timeline, setTimeline] = useState('Immediate (Next Upcoming Digital/Web Issue Layout)');
  const [story, setStory] = useState('');

  const img = service.featuredImage?.secureUrl || service.featuredImage?.url || '/images/mag_sleep.png';
  const price = service.price || 'Inquire for pricing';
  
  // Format includes and faqs
  let includes = [];
  let faqs = [];
  if (Array.isArray(service.includes) && service.includes.length > 0) {
    includes = service.includes;
    faqs = Array.isArray(service.faqs) ? service.faqs : [];
  } else if (Array.isArray(service.faqs)) {
    // If no includes array, parse from faqs if they are objects, else just use as strings
    const firstFaq = service.faqs[0];
    if (firstFaq && (typeof firstFaq === 'string' || firstFaq.question === undefined)) {
        includes = service.faqs.map(f => f.question || f.q || String(f));
    } else {
        faqs = service.faqs;
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/services/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          professionalTitle,
          email,
          websiteUrl,
          phone,
          location,
          mediaPackage: `${service.title} (${price})`,
          timeline,
          story,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setModalStep('success');
      } else {
        setErrorMsg(data.error || 'Failed to submit media request. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('A system error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex flex-col justify-between">
      <Header />

      <main className="w-full flex-grow pt-[140px] pb-20">
        <section className="container max-w-4xl mx-auto">
          <div className="bg-white rounded-[32px] shadow-sm p-6 md:p-10 border border-slate-100/50">
            
            {modalStep === 'details' && (
              <div className="flex flex-col gap-8 animate-fade-in">
                {/* Header Image */}
                <div className="relative w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden shadow-sm border border-slate-100/50">
                  <Image
                    src={proxyUrl(img)}
                    alt={service.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                  {service.category && (
                    <span className="absolute top-6 left-6 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[1px] bg-[#0f4c4e] text-white shadow-md">
                      {service.category}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <h1 className="font-heading font-extrabold text-[32px] md:text-[42px] text-primary tracking-tight leading-tight">
                    {service.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Package Price:</span>
                    <span className="text-[18px] font-extrabold text-[#0f4c4e]">{price}</span>
                  </div>
                </div>

                <div className="text-[15px] md:text-[16px] text-secondary leading-relaxed bg-[#f8fafc] border border-slate-100 p-6 md:p-8 rounded-3xl" dangerouslySetInnerHTML={{ __html: service.description }} />

                {/* What's Included */}
                {includes.length > 0 && (
                  <div className="bg-slate-50/50 border border-slate-200/40 p-6 md:p-8 rounded-3xl flex flex-col gap-4">
                    <span className="text-xs font-extrabold text-[#0f4c4e] uppercase tracking-wider flex items-center gap-2">
                      <Star size={14} className="text-accent" /> What's Included in this Package:
                    </span>
                    <ul className="list-none flex flex-col gap-3 pl-0 my-0">
                      {includes.map((inc, index) => (
                        <li key={index} className="text-[14px] md:text-[15px] text-secondary leading-relaxed flex gap-3 items-start">
                          <span className="text-accent-green shrink-0 mt-1 font-bold">✓</span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* FAQs */}
                {faqs.length > 0 && (
                  <div className="border border-slate-200/40 p-6 md:p-8 rounded-3xl flex flex-col gap-4 mt-4">
                    <span className="text-xs font-extrabold text-[#0f4c4e] uppercase tracking-wider flex items-center gap-2 mb-2">
                      <HelpCircle size={14} className="text-accent" /> Frequently Asked Questions
                    </span>
                    <div className="flex flex-col gap-4">
                      {faqs.map((faq, i) => (
                        <div key={i} className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                          <h4 className="font-heading font-bold text-[15px] text-primary mb-2">{faq.question}</h4>
                          <p className="text-[14px] text-secondary leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => setModalStep('form')}
                  variant="primary"
                  className="!bg-[#0f4c4e] hover:!bg-[#093031] !text-sm !py-4 md:!py-5 mt-4 mb-4 shadow-md select-none w-full"
                >
                  {service.ctaButtonText || 'Inquire Now'}
                </Button>
              </div>
            )}

            {modalStep === 'form' && (
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-8 animate-fade-in">
                <button
                  type="button"
                  onClick={() => setModalStep('details')}
                  className="flex items-center gap-2 text-secondary hover:text-accent font-bold text-xs uppercase tracking-wider w-max cursor-pointer mb-2"
                >
                  <ArrowLeft size={14} /> Back to Details
                </button>

                <div>
                  <h2 className="font-heading font-extrabold text-[28px] md:text-[32px] text-primary tracking-tight mb-3">
                    Submit Your Request
                  </h2>
                  <p className="text-[14px] md:text-[15px] text-secondary leading-relaxed">
                    Provide your details below to initiate our review process for <strong>{service.title}</strong>.
                  </p>
                </div>

                {errorMsg && (
                  <div className="bg-red-50 text-red-600 border border-red-100 text-sm px-5 py-4 rounded-xl">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="border border-slate-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-accent text-primary placeholder-slate-400 font-medium"
                    />
                  </div>

                  {/* Professional Title */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Professional Title / Role *</label>
                    <input
                      type="text"
                      required
                      value={professionalTitle}
                      onChange={(e) => setProfessionalTitle(e.target.value)}
                      className="border border-slate-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-accent text-primary placeholder-slate-400 font-medium"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border border-slate-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-accent text-primary placeholder-slate-400 font-medium"
                    />
                  </div>

                  {/* Website */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Website URL *</label>
                    <input
                      type="url"
                      required
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="border border-slate-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-accent text-primary placeholder-slate-400 font-medium"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="border border-slate-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-accent text-primary placeholder-slate-400 font-medium"
                    />
                  </div>

                  {/* Location */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location *</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="border border-slate-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-accent text-primary placeholder-slate-400 font-medium"
                    />
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Desired Timeline *</label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="border border-slate-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-accent text-primary bg-white font-medium"
                  >
                    <option value="Immediate (Next Upcoming Digital/Web Issue Layout)">Immediate (Next Upcoming Digital/Web Issue Layout)</option>
                    <option value="Within the next 30–60 Days">Within the next 30–60 Days</option>
                    <option value="Q3 / Q4 Strategic Launch Window">Q3 / Q4 Strategic Launch Window</option>
                    <option value="Just exploring availability options">Just exploring availability options</option>
                  </select>
                </div>

                {/* Story */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Story or Mission *</label>
                  <textarea
                    required
                    rows={5}
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    className="border border-slate-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-accent text-primary placeholder-slate-400 font-medium resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="primary"
                  className="!bg-[#0f4c4e] hover:!bg-[#093031] !text-sm !py-4 md:!py-5 mt-4 w-full shadow-sm"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                </Button>
              </form>
            )}

            {modalStep === 'success' && (
              <div className="flex flex-col items-center text-center p-8 animate-fade-in">
                <div className="w-20 h-20 bg-[#e8f8f0] text-accent-green rounded-full flex items-center justify-center mb-8 shadow-sm">
                  <CheckCircle size={40} />
                </div>
                <h2 className="font-heading font-extrabold text-[28px] md:text-[32px] text-primary tracking-tight mb-4">
                  Submission Successful
                </h2>
                <p className="text-[15px] md:text-[16px] text-secondary leading-relaxed max-w-lg mb-10">
                  Thank you, Your media request for <strong>{service.title}</strong> has been securely submitted into our system.
                </p>
                
                <div className="w-full bg-[#f8fafc] border border-slate-100 p-6 rounded-2xl text-[14px] text-secondary flex items-center justify-center gap-4 max-w-lg">
                  <Mail className="text-[#0f4c4e] w-6 h-6 shrink-0" />
                  <span>
                    Have questions? Contact us at <a href="mailto:info@ahealthplace.com" className="font-bold text-primary underline">info@ahealthplace.com</a>.
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
