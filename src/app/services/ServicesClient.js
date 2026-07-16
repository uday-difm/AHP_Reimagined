'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdSlot from '@/components/AdSlot';
import Button from '@/components/Button';
import { Search, ChevronRight, HelpCircle, Star, X, CheckCircle, Mail, ArrowLeft, ShieldAlert } from 'lucide-react';

// Proxy external URLs through the Next.js server to avoid CORS / hostname issues
function proxyUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `/api/media/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

const STANDARD_PACKAGES = [
  {
    id: 's1',
    title: 'Front Cover Feature Package',
    dropdownVal: 'Front Cover Feature Package ($599)',
    description: "Own the Cover. Own the Credibility. There's a difference between being featured in a health publication and being the face of one. This is that difference. Your Front Cover Feature Package puts you on the digital cover of A Health Place — the ultimate visibility asset for practitioners, founders, and health brands who are ready to be seen as the authority they already are.",
    includes: [
      'Main digital front cover portrait/image featuring the client or brand.',
      'Your choice of a deep-dive biographical article OR an exclusive, full-length Q&A interview layout.',
      'Premium Boost: Pinned as a highlighted feature at the top of our website homepage for 30 Days.',
      'Deliverables: High-resolution digital cover asset for your personal marketing + a free copy of the digital issue.',
      'Licensed "As Seen On A Health Place" digital badge for your website.',
      '2 dedicated social media features: post and story.'
    ],
    price: '$599',
    ctaButtonText: 'Secure Cover Spot',
    category: 'Premium Editorial',
    badge: 'Most Popular',
    img: '/images/mag_sleep.png',
  },
  {
    id: 's2',
    title: 'Back Cover Feature Package',
    dropdownVal: 'Back Cover Feature Package ($399)',
    description: "A Statement Placement. The back cover is the last thing a reader sees — which makes it one of the most memorable placements in the entire issue. Whether you want a bold full-page brand statement or a polished executive profile, this package gives you premium real estate without the cover-story price tag.",
    includes: [
      'Premium digital back cover full-page placement (perfect for brand ads or a signature closing profile).',
      'Your choice of a standalone brand article OR an executive interview feature.',
      'Premium Boost: Pinned as a highlighted feature on our website homepage for 14 Days.',
      'Deliverables: High-resolution digital back cover asset + a free copy of the digital issue.',
      'Licensed "As Seen On" digital badge + 1 social media mention.'
    ],
    price: '$399',
    ctaButtonText: 'Reserve Back Cover',
    category: 'Premium Editorial',
    img: '/images/mag_strength.png',
  },
  {
    id: 's3',
    title: 'Article Feature',
    dropdownVal: 'Article Feature ($179)',
    description: "Tell Your Story, Professionally Written and Permanently Published. Whether it's your practice, your health journey, or your product's origin story — some things are better told than summarized. Our Standalone PR Article turns your story into a fully formatted, professionally published feature that lives permanently on the web.",
    includes: [
      'A fully formatted narrative article spotlighting yourself, your practice, your health journey, or your product brand.',
      'Published on both the website feed and inside the digital magazine issue.',
      'Deliverables: Free copy of the digital issue + permanent live web URL.'
    ],
    price: '$179',
    ctaButtonText: 'Order Article',
    category: 'Standard Editorial',
    badge: 'Best Seller',
    img: '/images/mag_nutrition.png',
  },
  {
    id: 's4',
    title: 'Interview Feature',
    dropdownVal: 'Interview Feature ($249)',
    description: "Your Insight, In Your Own Words. Not every story needs a narrative arc — sometimes the most compelling content is simply you, answering the questions your patients and peers actually want asked. Our Standalone Q&A gives your expertise a polished, professional stage.",
    includes: [
      'A curated, high-impact conversational transcript highlighting your health insights and clinical philosophy.',
      'Includes headshots and custom layout formatting.',
      'Published on both the website and in the digital magazine issue.',
      'Also included: Free copy of the digital issue + permanent live web URL + "As Seen In" digital badge.'
    ],
    price: '$249',
    ctaButtonText: 'Schedule Q&A Interview',
    category: 'Standard Editorial',
    img: '/images/service_interview_mockup.png', // Premium editorial interview Q&A layout image
  },
  {
    id: 's5',
    title: 'Magazine Advertisement',
    dropdownVal: 'Magazine Advertisement Space Full Page ($199)',
    description: "Get Seen Where Your Audience Is Already Reading. Place your brand directly inside our editorial content — visually distinct, professionally positioned, and seen by a health-conscious readership already primed to engage.",
    includes: [
      'Double-Page Spread (DPS) Ad — A massive, side-by-side two-page visual takeover ($249).',
      'Full-Page Ad — A standard single full-page standalone advertisement graphic ($199).',
      'Half / Quarter Page Ad — A smaller visual banner sharing space with our articles ($99).'
    ],
    price: '$99 - $249',
    ctaButtonText: 'Book Ad Space',
    category: 'Display Ads',
    img: '/images/mag_mindfulness.png',
  },
  {
    id: 's6',
    title: 'Website Feature',
    dropdownVal: 'Website Feature / Guest Post ($99)',
    description: "A Web-First Way to Get Discovered. For brands who want a lighter-touch entry into our editorial ecosystem, the Website Feature delivers a fully written article and real backlink value — without the full-package investment.",
    includes: [
      '1 pre-written informational article published strictly on the website content feed.',
      'Contains 1 or 2 permanent links back to the client\'s site.',
      'Note: This is a web-only article. It does not include homepage pinning or placement inside the digital magazine issue.'
    ],
    price: '$99',
    ctaButtonText: 'Order Web Post',
    category: 'Web SEO Placement',
    img: '/images/mag_phone.png',
  },
  {
    id: 's7',
    title: 'Media & Event Partnerships',
    dropdownVal: 'Media & Event Partnership Inquiry',
    description: "Let's Build Something Custom. Got an event, a launch, or a campaign that doesn't fit neatly into a standard package? We partner on joint branding, banner exchanges, ticketing promotions, and dedicated event-previews.",
    includes: [
      'Joint branding, banner exchanges, ticketing promotions, or dedicated event-preview features.',
      'Available on an open trade/barter or custom budget basis.'
    ],
    price: 'From $499',
    ctaButtonText: 'Inquire Partnering',
    category: 'Custom Brand Trades',
    img: '/images/service_partnership_mockup.png', // Premium event and partnership graphic
  },
];

const HIDDEN_PACKAGES = [
  {
    id: 'h1',
    title: 'Featured Partner Placement',
    dropdownVal: 'Featured Partner Placement ($299)',
    description: "Get Ranked. Get Recognized. Position your practice or brand inside one of our curated \"Featured Partners\" roundups — a high-visibility, sponsored placement designed to put you in front of readers actively looking for trusted names in health.",
    includes: [
      'Inclusion in 1 upcoming "Featured Partners" roundup/directory page (clearly labeled Sponsored/Featured Partner).',
      'Client bio (up to 150 words) and headshot.',
      '1 permanent contextual link.',
      'Social distribution: 1 Instagram/Facebook feed post + 2 Stories.',
      '30 days as a highlighted website feature.'
    ],
    price: '$299',
    ctaButtonText: 'Book Partner Slot',
    category: 'Confidential Placements',
    img: '/images/service_partner_roundup_mockup.png', // Certified directory listing mockup
  },
  {
    id: 'h2',
    title: 'Annual PR Partnership Retainer',
    dropdownVal: 'Annual PR Partnership Retainer ($1499)',
    description: "Stop Chasing Press. Have It On Retainer. One-off features get you a moment. A retainer gets you a presence — consistent visibility, built into your marketing calendar all year long, without renegotiating every quarter.",
    includes: [
      '1 Front Cover feature + 1 additional standalone piece during the year.',
      'Web features: monthly short feature article (12/year total).',
      'Social placement per feature: 1 feed post + 2 Stories + 1 Reel at time of each publish (annualized: 12 feed posts, 24 Stories, 12 Reels).',
      'Full badge rights web + print use.',
      'Priority access to Media & Event Partnerships.',
      'Homepage pinning included on the cover feature (30 days).',
      'All Year Round website placement.'
    ],
    price: 'From $1499 / Year',
    ctaButtonText: 'Inquire Retainer',
    category: 'Confidential Retainers',
    img: '/images/service_pr_retainer_mockup.png', // Premium corporate dark-teal retainer folder
  },
];

export default function ServicesClient({ initialServices = [], showConfidential = false }) {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  // Map DB services → frontend card format
  const dbPackages = initialServices.map((s) => ({
    id: s.id,
    title: s.title || '',
    dropdownVal: s.price ? `${s.title} (${s.price})` : s.title,
    description: s.description || '',
    includes: Array.isArray(s.includes) && s.includes.length > 0
      ? s.includes
      : Array.isArray(s.faqs) ? s.faqs.map(f => f.question || f.q || String(f)) : [],
    price: s.price || '',
    ctaButtonText: s.ctaButtonText || 'Know More',
    ctaButtonLink: s.ctaButtonLink || '',
    category: s.category || 'Service',
    badge: s.badge || null,
    img: (s.featuredImage?.secureUrl || s.featuredImage?.url) || '/images/mag_sleep.png',
    visible: s.visible !== false,
  })).filter(s => s.visible);

  // Use DB services if available, otherwise fall back to static packages
  const baseList = dbPackages.length > 0 ? dbPackages : STANDARD_PACKAGES;

  // Check showConfidential prop or query parameters
  const showSecret = showConfidential || searchParams.get('secret') === 'true' || searchParams.get('show') === 'confidential';
  const packagesList = showSecret
    ? (dbPackages.length > 0 ? dbPackages : [...STANDARD_PACKAGES, ...HIDDEN_PACKAGES])
    : baseList;

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState('details'); // 'details' | 'form' | 'success'
  const [selectedService, setSelectedService] = useState(packagesList[0] || STANDARD_PACKAGES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [email, setEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [mediaPackage, setMediaPackage] = useState('Front Cover Feature Package ($599)');
  const [timeline, setTimeline] = useState('Immediate (Next Upcoming Digital/Web Issue Layout)');
  const [story, setStory] = useState('');

  const filteredServices = packagesList.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openDetailsModal = (service) => {
    setSelectedService(service);
    setMediaPackage(service.dropdownVal);
    setErrorMsg('');
    setModalStep('details');
    setIsModalOpen(true);
  };

  const handleDropdownChange = (val) => {
    setMediaPackage(val);
    const matched = packagesList.find(p => p.dropdownVal === val);
    if (matched) {
      setSelectedService(matched);
    }
  };

  const getSelectedPackageIncludes = () => {
    return selectedService.includes || null;
  };

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
          mediaPackage,
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

  const faqs = [
    {
      q: 'How do I place an order for a package?',
      a: 'Clicking "Know More" on any package loads a summary layout panel. Click the billing request action inside the details view to open our secure 9-field booking descriptor form.'
    },
    {
      q: 'Are custom bundles available?',
      a: 'Absolutely. We offer custom billing configurations if you want to mix cover packages, advertisement banner spaces, and recurring SEO website articles. You can request custom configurations in the brand description field.'
    },
    {
      q: 'Is my partnership detail kept confidential?',
      a: 'Yes, our media roundups and partner directories can be labeled as "Sponsored" or left unlabelled depending on your policy guidelines. We prioritize client confidentiality.'
    }
  ];

  const currentIncludes = getSelectedPackageIncludes();

  return (
    <div className="min-h-screen bg-bg-light flex flex-col justify-between">
      <Header />

      <main className="w-full flex-grow pt-[140px] pb-20">

        {/* Header Banner */}
        <section className="container mb-10">
          <div className="bg-[#f0f6f3]/60 border border-slate-200/40 rounded-[32px] p-8 md:p-12 relative overflow-hidden flex flex-col gap-6 md:flex-row md:items-center justify-between">
            <div className="max-w-[600px] relative z-10 flex flex-col gap-3">
              <span className="text-accent font-extrabold text-[11px] uppercase tracking-[2.5px] block">AHP MEDIA DIRECTORY</span>
              <h1 className="font-heading font-extrabold text-[32px] md:text-[46px] leading-tight text-primary tracking-tight">
                Media & PR Partnership Packages
              </h1>
              <p className="text-secondary text-[14px] md:text-[15px] leading-relaxed">
                Unlock professional authority and reach our health-conscious audience. Explore our cover features, standalone articles, display ads, and custom partnerships.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:max-w-[320px] shrink-0 z-10">
              <input
                type="text"
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-5 py-3.5 bg-white border border-slate-200 rounded-full text-[13px] text-primary placeholder-slate-400 focus:outline-none focus:border-accent focus:shadow-[0_8px_24px_rgba(79,192,195,0.08)] transition-all duration-300 font-medium"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>

            <div className="absolute w-[200px] h-[200px] rounded-full bg-accent/10 blur-2xl top-[-50px] right-[-50px] pointer-events-none" />
          </div>
        </section>


        {/* Ad Space */}
        <section className="container mb-12">
          <AdSlot zone="services-top" />
        </section>

        {/* Services List Grid */}
        <section className="container mb-20">
          {filteredServices.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200/50 rounded-[32px] shadow-sm">
              <p className="text-slate-400 font-medium">No packages found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => {
                return (
                  <div
                    key={service.id}
                    className="bg-white rounded-[24px] overflow-hidden flex flex-col justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(15,76,78,0.08)] group border border-slate-200/60 hover:border-[#0f4c4e]/30"
                  >
                    <div>
                      {/* Cover image & category */}
                      <div className="relative w-full h-[180px] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={proxyUrl(service.img)}
                          alt={service.title}
                          className="object-cover transition-transform duration-500 group-hover:scale-105 w-full h-full"
                        />
                        <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[8.5px] font-bold uppercase tracking-[1px] bg-[#f0f6f3] text-[#0f4c4e]">
                          {service.category}
                        </span>

                        {/* Best Seller / Most Popular visual badge on the top right */}
                        {service.badge && (
                          <span className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-[1px] bg-accent text-primary shadow-sm animate-pulse">
                            {service.badge}
                          </span>
                        )}
                      </div>

                      {/* Content block */}
                      <div className="p-6 flex flex-col gap-3">
                        <h3 className="font-heading font-extrabold text-[17px] text-primary leading-snug group-hover:text-accent transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-[12.5px] text-secondary leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Pricing Row */}
                    <div className="px-6 pb-6 pt-2">
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="flex flex-col">
                          <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Package Price</span>
                          <span className="text-[14px] font-extrabold text-[#0f4c4e]">{service.price}</span>
                        </div>
                        <Button
                          onClick={() => openDetailsModal(service)}
                          variant="primary"
                          className="!bg-primary hover:!bg-accent hover:!text-white !text-xs !py-2.5 !px-5 inline-flex items-center gap-1 select-none shadow-sm"
                        >
                          Know More <ChevronRight size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* FAQs */}
        <section className="container">
          <div className="max-w-[800px] mx-auto bg-white border border-slate-200/60 rounded-[32px] p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-8 border-b border-slate-100 pb-4">
              <HelpCircle className="text-accent w-5.5 h-5.5" />
              <h2 className="font-heading font-extrabold text-[18px] text-primary tracking-tight">Partnership Questions & FAQs</h2>
            </div>

            <div className="flex flex-col gap-4">
              {faqs.map((faq, i) => {
                const isOpen = activeFaq === i;
                return (
                  <div key={i} className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between text-left py-2 font-heading font-bold text-[14.5px] text-primary hover:text-accent transition-colors"
                    >
                      <span>{faq.q}</span>
                      <span className={`text-[18px] text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>+</span>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[200px] mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <p className="text-[13px] text-secondary leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">{faq.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* Booking Form & Details Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#1a1a2e]/60 backdrop-blur-md flex items-center justify-center z-[99999] p-4 select-none animate-fade-in">
          <div className="bg-white rounded-[32px] shadow-[0_24px_60px_rgba(0,0,0,0.15)] w-full max-w-[720px] max-h-[90vh] overflow-y-auto flex flex-col p-6 md:p-8 relative border border-slate-100">

            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 bg-slate-100 hover:bg-slate-200 text-secondary hover:text-primary w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer z-10"
              aria-label="Close form"
            >
              <X size={16} />
            </button>

            {/* STEP 1: Details View (shows package image, description, and list) */}
            {modalStep === 'details' && (
              <div className="flex flex-col gap-6 animate-slide-up">

                {/* Header Image */}
                <div className="relative w-full h-[240px] md:h-[280px] rounded-2xl overflow-hidden shadow-sm border border-slate-100/50 mt-4">
                  <Image
                    src={selectedService.img}
                    alt={selectedService.title}
                    fill
                    className="object-cover"
                    sizes="720px"
                  />
                  <span className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[1px] bg-[#0f4c4e] text-white shadow-md">
                    {selectedService.category}
                  </span>
                  {selectedService.badge && (
                    <span className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-[1px] bg-accent text-primary shadow-md">
                      {selectedService.badge}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="font-heading font-extrabold text-[24px] text-primary tracking-tight leading-tight">
                    {selectedService.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Package Price:</span>
                    <span className="text-[15px] font-extrabold text-[#0f4c4e]">{selectedService.price}</span>
                  </div>
                </div>

                <p className="text-[13px] text-secondary leading-relaxed bg-[#f8fafc] border border-slate-100 p-5 rounded-2xl">
                  {selectedService.description}
                </p>

                {/* What's Included list */}
                {selectedService.includes && (
                  <div className="bg-slate-50/50 border border-slate-200/40 p-5 rounded-2xl flex flex-col gap-2.5">
                    <span className="text-[10px] font-extrabold text-[#0f4c4e] uppercase tracking-wider flex items-center gap-1.5">
                      <Star size={11} className="text-accent" /> What's Included in this Package:
                    </span>
                    <ul className="list-none flex flex-col gap-2 pl-0 my-0">
                      {selectedService.includes.map((inc, index) => (
                        <li key={index} className="text-[12.5px] text-secondary leading-normal flex gap-2 items-start">
                          <span className="text-accent-green shrink-0 mt-0.5 font-bold">✓</span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Step Action Button */}
                <Button
                  onClick={() => setModalStep('form')}
                  variant="primary"
                  className="!bg-[#0f4c4e] hover:!bg-[#093031] !text-xs !py-3.5 mt-2 mb-8 shrink-0 shadow-md select-none w-full"
                >
                  {selectedService.ctaButtonText}
                </Button>
              </div>
            )}

            {/* STEP 2: Booking Form View */}
            {modalStep === 'form' && (
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-6 animate-slide-up">

                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => setModalStep('details')}
                  className="flex items-center gap-1.5 text-secondary hover:text-accent font-bold text-[11px] uppercase tracking-wider w-max cursor-pointer mb-2"
                >
                  <ArrowLeft size={12} /> Back to Details
                </button>

                <div>
                  <h2 className="font-heading font-extrabold text-[22px] text-primary tracking-tight mb-2">
                    Submit Your Media Request
                  </h2>
                  <p className="text-[12.5px] text-secondary leading-relaxed">
                    Provide your brand credentials and narrative details to initiate our editorial review board review process.
                  </p>
                </div>

                {errorMsg && (
                  <div className="bg-red-50 text-red-600 border border-red-100 text-xs px-4 py-3 rounded-xl">
                    {errorMsg}
                  </div>
                )}

                {/* Dynamic mini-summary of package in form */}
                {selectedService.includes && (
                  <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl flex flex-col gap-2">
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Star size={10} className="text-accent" /> Selected: {selectedService.title} ({selectedService.price})
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="border border-slate-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-accent text-primary placeholder-slate-400 font-medium"
                      placeholder="Jane Doe"
                    />
                  </div>

                  {/* Professional Title */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Professional Title / Role *</label>
                    <input
                      type="text"
                      required
                      value={professionalTitle}
                      onChange={(e) => setProfessionalTitle(e.target.value)}
                      className="border border-slate-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-accent text-primary placeholder-slate-400 font-medium"
                      placeholder="Chief Medical Officer"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border border-slate-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-accent text-primary placeholder-slate-400 font-medium"
                      placeholder="jane@practice.com"
                    />
                  </div>

                  {/* Website URL */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Company / Practice Website URL *</label>
                    <input
                      type="url"
                      required
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="border border-slate-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-accent text-primary placeholder-slate-400 font-medium"
                      placeholder="https://mybrand.com"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="border border-slate-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-accent text-primary placeholder-slate-400 font-medium"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  {/* State and Country */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">State and Country *</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="border border-slate-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-accent text-primary placeholder-slate-400 font-medium"
                      placeholder="California, USA"
                    />
                  </div>
                </div>

                {/* Select Requested Package */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Select Your Requested Media Package *</label>
                  <select
                    value={mediaPackage}
                    onChange={(e) => handleDropdownChange(e.target.value)}
                    className="border border-slate-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-accent text-primary bg-white font-medium"
                  >
                    {packagesList.map((pkg) => (
                      <option key={pkg.id} value={pkg.dropdownVal}>
                        {pkg.dropdownVal}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Desired Timeline */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Desired Publication & Launch Timeline *</label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="border border-slate-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-accent text-primary bg-white font-medium"
                  >
                    <option value="Immediate (Next Upcoming Digital/Web Issue Layout)">Immediate (Next Upcoming Digital/Web Issue Layout)</option>
                    <option value="Within the next 30–60 Days">Within the next 30–60 Days</option>
                    <option value="Q3 / Q4 Strategic Launch Window">Q3 / Q4 Strategic Launch Window</option>
                    <option value="Just exploring availability options">Just exploring availability options</option>
                  </select>
                </div>

                {/* Story description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tell Us About Your Story or Brand Mission *</label>
                  <textarea
                    required
                    rows={4}
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    className="border border-slate-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-accent text-primary placeholder-slate-400 font-medium resize-none"
                    placeholder="Briefly describe your clinical practice, wellness product, or personal health journey..."
                  />
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="primary"
                  className="!bg-[#0f4c4e] hover:!bg-[#093031] !text-xs !py-4 mb-8 shrink-0 shadow-sm select-none w-full"
                >
                  {isSubmitting ? 'Securing Submission Details...' : 'Submit Media Package Inquiry'}
                </Button>
              </form>
            )}

            {/* STEP 3: Success Screen View */}
            {modalStep === 'success' && (
              <div className="flex flex-col items-center text-center p-4 animate-slide-up">
                <div className="w-16 h-16 bg-[#e8f8f0] text-accent-green rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <CheckCircle size={32} />
                </div>

                <h2 className="font-heading font-extrabold text-[24px] text-primary tracking-tight mb-2">
                  Submission Successful
                </h2>
                <p className="text-[13px] text-secondary leading-relaxed max-w-md mb-8">
                  Thank you, Your media request has been securely submitted into our system.
                </p>

                {/* Horizontal divider */}
                <div className="w-full h-px bg-slate-100 mb-8" />

                {/* Steps */}
                <div className="flex flex-col gap-5 w-full text-left max-w-md mb-8">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">NEXT STEPS:</span>

                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0 text-primary font-bold text-xs">1</div>
                    <p className="text-[12.5px] text-secondary leading-normal mt-1.5">Our editorial review panel will evaluate your digital assets and website credentials.</p>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0 text-primary font-bold text-xs">2</div>
                    <p className="text-[12.5px] text-secondary leading-normal mt-1.5">We will check available slot counts for your requested issue timeline.</p>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0 text-primary font-bold text-xs">3</div>
                    <p className="text-[12.5px] text-secondary leading-normal mt-1.5">An account executive from our PR division will contact you via email with an official availability report and confirmation of next steps.</p>
                  </div>
                </div>

                {/* Footer info box */}
                <div className="w-full bg-[#f8fafc] border border-slate-100 p-5 rounded-2xl text-[12.5px] text-secondary leading-relaxed flex items-center gap-3.5 max-w-md">
                  <Mail className="text-[#0f4c4e] w-5 h-5 shrink-0" />
                  <span>
                    Have an urgent media deadline? Contact our backend desk at <a href="mailto:info@ahealthplace.com" className="font-bold text-primary underline">info@ahealthplace.com</a>.
                  </span>
                </div>

                {/* Finish/Close button */}
                <Button
                  onClick={() => setIsModalOpen(false)}
                  variant="primary"
                  className="!bg-[#0f4c4e] hover:!bg-[#093031] !text-xs !py-3 !px-8 mt-8 mb-8 shrink-0 shadow-sm select-none"
                >
                  Close Window
                </Button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
