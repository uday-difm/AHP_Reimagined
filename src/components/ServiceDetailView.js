'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Link from 'next/link';
import { Star, ArrowLeft, CheckCircle, HelpCircle, Mail, CreditCard, ShieldCheck } from 'lucide-react';

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
  const [isStripeLoading, setIsStripeLoading] = useState(false);
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

  // Check URL query params for Stripe payment callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('payment') === 'success') {
        setModalStep('success');
      }
    }
  }, []);
  
  // Format includes and faqs
  let includes = [];
  let faqs = [];
  if (Array.isArray(service.includes) && service.includes.length > 0) {
    includes = service.includes;
    faqs = Array.isArray(service.faqs) ? service.faqs : [];
  } else if (Array.isArray(service.faqs)) {
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

  const handleStripeCheckout = async (e) => {
    e.preventDefault();
    if (!fullName || !email) {
      setErrorMsg('Full Name and Email Address are required for Stripe payment.');
      return;
    }

    setIsStripeLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.slug || service.id,
          serviceTitle: service.title,
          price: price,
          fullName,
          professionalTitle,
          email,
          websiteUrl,
          phone,
          location,
          timeline,
          story,
          cancelUrl: window.location.href,
          successUrl: `${window.location.origin}/services/${service.slug || service.id}?payment=success`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setErrorMsg(data.error || 'Failed to initiate Stripe payment.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('System error initiating Stripe payment.');
    } finally {
      setIsStripeLoading(false);
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
                {/* Back Link */}
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 text-slate-500 hover:text-accent font-bold text-xs uppercase tracking-wider transition-colors w-max"
                >
                  <ArrowLeft size={14} /> Back to All Packages
                </Link>

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
                  <h1 className="main-heading text-primary tracking-tight">
                    {service.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Package Price:</span>
                    <span className="text-[18px] font-extrabold text-[#0f4c4e]">{price}</span>
                  </div>
                </div>

                <div className="description text-secondary bg-[#f8fafc] border border-slate-100 p-6 md:p-8 rounded-3xl" dangerouslySetInnerHTML={{ __html: service.description }} />

                {/* What's Included */}
                {includes.length > 0 && (
                  <div className="bg-slate-50/50 border border-slate-200/40 p-6 md:p-8 rounded-3xl flex flex-col gap-4">
                    <span className="text-xs font-extrabold text-[#0f4c4e] uppercase tracking-wider flex items-center gap-2">
                      <Star size={14} className="text-accent" /> What's Included in this Package:
                    </span>
                    <ul className="list-none flex flex-col gap-3 pl-0 my-0">
                      {includes.map((inc, index) => (
                        <li key={index} className="description text-secondary flex gap-3 items-start">
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
                          <h4 className="text-base font-bold text-primary mb-2">{faq.question}</h4>
                          <p className="text-sm text-secondary bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 mt-4 mb-4">
                  <Button
                    onClick={() => setModalStep('form')}
                    variant="primary"
                    className="!bg-[#0f4c4e] hover:!bg-[#093031] !text-sm !py-4 md:!py-5 shadow-md select-none flex-1 inline-flex justify-center items-center gap-2"
                  >
                    <CreditCard size={18} /> {service.ctaButtonText || 'Book & Pay Online'}
                  </Button>
                </div>
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
                  <h2 className="section-heading text-primary tracking-tight mb-3">
                    Reserve {service.title}
                  </h2>
                  <p className="description text-secondary">
                    Enter your contact details below to proceed with online payment or submit an editorial inquiry.
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

                <div className="flex flex-col gap-3 mt-4">
                  {/* Primary Stripe Button */}
                  <button
                    type="button"
                    onClick={handleStripeCheckout}
                    disabled={isStripeLoading || isSubmitting}
                    className="w-full bg-[#0f4c4e] hover:bg-[#093031] text-white font-bold text-sm py-4 rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    <CreditCard size={18} />
                    {isStripeLoading ? 'Redirecting to Stripe...' : `Pay & Book with Stripe (${price})`}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-slate-400 text-[11px] font-semibold">
                    <ShieldCheck size={14} className="text-accent" /> Encrypted & Secured by Stripe Payments
                  </div>

                  {/* Secondary Inquiry Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || isStripeLoading}
                    variant="outline"
                    className="!text-xs !py-3 w-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Inquiry Only (Without Online Payment)'}
                  </Button>
                </div>
              </form>
            )}

            {modalStep === 'success' && (
              <div className="flex flex-col items-center text-center p-8 animate-fade-in">
                <div className="w-20 h-20 bg-[#e8f8f0] text-accent-green rounded-full flex items-center justify-center mb-8 shadow-sm">
                  <CheckCircle size={40} />
                </div>
                <h2 className="section-heading text-primary tracking-tight mb-4">
                  Payment / Inquiry Successful
                </h2>
                <p className="description text-secondary max-w-lg mb-10">
                  Thank you! Your request and payment details for <strong>{service.title}</strong> have been securely recorded. Our PR & Editorial team will contact you shortly.
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
