'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import ScrollReveal from '@/components/ScrollReveal';
import BackdropBlobs from '@/components/BackdropBlobs';
import Button from '@/components/Button';
import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  HelpCircle,
  ShieldAlert,
  Search,
  ChevronRight,
  Mail,
  Phone,
  CheckCircle,
  FileText
} from 'lucide-react';

const mockArticles = [
  {
    id: 'mock-1',
    category: 'Holistic Ayurveda',
    title: 'Ayurvedic Secrets for Better Digestion (Demo Data)',
    desc: 'Discover ancient dietary guidelines for optimizing digestive health and maintaining balance.',
    img: '/images/ayurveda.png',
  },
  {
    id: 'mock-2',
    category: 'Physical Health',
    title: 'How Inactivity Impacts Physical Health (Demo Data)',
    desc: 'Research linking modern sedentary lifestyles to cardiovascular risks and joint stiffness.',
    img: '/images/physical_health.png',
  },
  {
    id: 'mock-3',
    category: 'Mental Health',
    title: 'Exercise for Better Mental Health (Demo Data)',
    desc: 'Science-backed evidence showing how regular movement rewires the brain for resilience.',
    img: '/images/hero_exercise.png',
  },
  {
    id: 'mock-4',
    category: 'Holistic Ayurveda',
    title: 'Breathwork vs. Meditation for Anxiety (Demo Data)',
    desc: 'Find out which mindfulness practices work best for quieting your specific anxiety loops.',
    img: '/images/holistic.png',
  },
  {
    id: 'mock-5',
    category: 'Insurance Mappings',
    title: 'Navigating Wellness and Insurance Coverage (Demo Data)',
    desc: 'A comprehensive guide on mapping preventive care, therapy, and alternative treatments to standard insurance plans.',
    img: '/images/hero_sleep.png',
  },
  {
    id: 'mock-6',
    category: 'Physical Health',
    title: 'Understanding Sleep Cycle Optimization (Demo Data)',
    desc: 'How aligning with your circadian rhythm improves physical recovery and endocrine balance.',
    img: '/images/mag_sleep.png',
  }
];

const boardMembers = [
  {
    name: 'Dr. Evelyn Martinez, MD',
    role: 'Chief Medical Editor & Board Chair',
    specialty: 'Integrative Medicine & Cardiology',
    bio: 'Dr. Martinez is a board-certified cardiologist with over 15 years of experience in combining traditional pharmacology with holistic lifestyle therapies.',
    avatar: 'EM'
  },
  {
    name: 'Dr. Sarah Patel, PhD',
    role: 'Mental Health Advisor',
    specialty: 'Clinical Psychology & Neuroscience',
    bio: 'Dr. Patel researches stress resilience, prefrontal cortex function, and somatic therapies. She ensures all mental health resources are clinically validated.',
    avatar: 'SP'
  },
  {
    name: 'Acharya Vasant Sharma, BAMS',
    role: 'Ayurvedic Science Advisor',
    specialty: 'Panchakarma & Herbal Formulations',
    bio: 'With a degree in Ayurvedic Medicine and Surgery, Acharya Sharma provides vetting for traditional remedies and gut health alignments.',
    avatar: 'VS'
  }
];

export default function InfoHubClient({ initialLegalPages = [] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Active tab state: 'support' | 'legal'
  const [activeTab, setActiveTab] = useState('support');

  // Support form state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formValues, setFormValues] = useState({ name: '', email: '', subject: '', message: '' });

  // Legal document state
  const [activeLegalDoc, setActiveLegalDoc] = useState('privacy');

  // Load tabs/filters from URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    const doc = searchParams.get('doc');

    if (tab && tab !== 'categories' && tab !== 'board') {
      setActiveTab(tab);
    } else {
      setActiveTab('support');
    }
    if (doc) {
      setActiveLegalDoc(doc);
    }
  }, [searchParams]);

  // Resolve legal pages from DB or fall back to static text
  const dbPrivacy = initialLegalPages.find(p => p.type?.toLowerCase().includes('privacy'));
  const dbTerms = initialLegalPages.find(p => p.type?.toLowerCase().includes('term'));
  const dbDisclaimer = initialLegalPages.find(p => p.type?.toLowerCase().includes('disclaimer') || p.type?.toLowerCase().includes('medical'));
  const dbCookies = initialLegalPages.find(p => p.type?.toLowerCase().includes('cookie') || p.type?.toLowerCase() === 'cookies');
  const dbRefund = initialLegalPages.find(p => p.type?.toLowerCase().includes('refund'));

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    const params = new URLSearchParams();
    params.set('tab', tabName);
    router.push(`/info?${params.toString()}`, { scroll: false });
  };

  const handleLegalDocToggle = (docName) => {
    setActiveLegalDoc(docName);
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'legal');
    params.set('doc', docName);
    router.push(`/info?${params.toString()}`, { scroll: false });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formValues.name && formValues.email && formValues.message) {
      setFormSubmitted(true);
      setFormValues({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <div className="min-h-screen bg-bg-light relative ">
      <CustomCursor />
      <ScrollReveal />
      <BackdropBlobs />
      <Header />

      {/* Hero Header */}
      <section className="bg-[#f0f6f3]/60 pt-[140px] pb-16 rounded-b-[40px] border-b border-slate-200/20 text-center relative overflow-hidden">
        <div className="container max-w-4xl">
          <span className="text-accent text-[11px] font-bold uppercase tracking-[2px] mb-3 block reveal-slide">A HEALTH PLACE INFO HUB</span>
          <h1 className="text-primary font-heading font-extrabold text-4xl md:text-5xl tracking-[-1.5px] leading-tight mb-4 reveal-slide">
            How Can We Help You Today?
          </h1>
          <p className="text-secondary text-[15px] max-w-xl mx-auto mb-8 reveal-slide">
            Explore medically verified wellness guides, review our board standards, submit a support inquiry, or read our policy documentation.
          </p>

          {/* Info Hub Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 bg-white/80 p-2 rounded-2xl shadow-sm border border-slate-200/50 max-w-2xl mx-auto reveal-scale">
            <Button
              onClick={() => handleTabChange('support')}
              variant={activeTab === 'support' ? 'primary' : 'white'}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-[13px] !shadow-none border-none cursor-pointer"
            >
              <HelpCircle size={16} />
              Contact Support
            </Button>
            <Button
              onClick={() => handleTabChange('legal')}
              variant={activeTab === 'legal' ? 'primary' : 'white'}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-[13px] !shadow-none border-none cursor-pointer"
            >
              <ShieldAlert size={16} />
              Legal & Policies
            </Button>
          </div>
        </div>
      </section>

      {/* Main Tab Content */}
      <main className="container py-16 max-w-6xl min-h-[500px]">


        {/* Tab 3: Contact & Support */}
        {activeTab === 'support' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-10">
            {/* Contact Details */}
            <div className="space-y-8">
              <div>
                <h2 className="text-primary font-heading font-extrabold text-2xl tracking-[-0.5px] mb-3">Get in touch</h2>
                <p className="text-secondary text-[13px] leading-relaxed">
                  Have questions about an article, feedback on our content, or general technical support inquiries? Our team is here to assist.
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Email Address</span>
                    <a href="mailto:support@ahealthplace.com" className="text-xs text-primary font-bold hover:underline">support@ahealthplace.com</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Phone Line</span>
                    <span className="text-xs text-primary font-bold">+1 (800) 555-0199</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 shadow-sm">
              {formSubmitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-14 h-14 bg-accent-green/10 text-accent-green rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={30} />
                  </div>
                  <h3 className="font-heading font-extrabold text-lg text-primary">Message Sent Successfully!</h3>
                  <p className="text-slate-500 text-xs max-w-xs mx-auto">
                    Thank you for reaching out. A board-certified content supervisor or technical editor will contact you within 24-48 hours.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="mt-4 px-5 py-2 rounded-full border border-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formValues.name}
                        onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-accent focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formValues.email}
                        onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-4.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-accent focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Subject</label>
                    <input
                      type="text"
                      value={formValues.subject}
                      onChange={(e) => setFormValues({ ...formValues, subject: e.target.value })}
                      placeholder="Feedback on Guide / Editorial Support"
                      className="w-full px-4.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-accent focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={formValues.message}
                      onChange={(e) => setFormValues({ ...formValues, message: e.target.value })}
                      placeholder="Write your query or feedback here..."
                      className="w-full px-4.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-accent focus:bg-white resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3.5 text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Submit Support Ticket
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Legal & Policies */}
        {activeTab === 'legal' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_2.5fr] gap-10">
            {/* Document Select Sidebar */}
            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-slate-200 pr-0 md:pr-6 shrink-0">
              {[
                { key: 'privacy', label: 'Privacy Policy' },
                { key: 'terms', label: 'Terms of Service' },
                { key: 'cookies', label: 'Cookie Policy' },
                { key: 'disclaimer', label: 'Medical Disclaimer' },
                { key: 'refund', label: 'Refund Policy' },
              ].map((doc) => (
                <Button
                  key={doc.key}
                  onClick={() => handleLegalDocToggle(doc.key)}
                  variant={activeLegalDoc === doc.key ? 'primary' : 'white'}
                  className="flex items-center gap-2.5 px-4.5 py-3 rounded-xl justify-start text-[12.5px] text-left md:w-full whitespace-nowrap cursor-pointer !shadow-none border-none"
                >
                  <FileText size={15} />
                  {doc.label}
                </Button>
              ))}
            </div>

            {/* Document Content View */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 md:p-10 shadow-sm leading-relaxed text-secondary text-[13.5px] space-y-6">
              {activeLegalDoc === 'privacy' && (
                <>
                  <h2 className="font-heading font-extrabold text-2xl text-primary mb-6">{dbPrivacy?.title || 'Privacy Policy'}</h2>
                  <p className="text-slate-400 text-xs mb-4">Last Updated: {dbPrivacy?.lastUpdated ? new Date(dbPrivacy.lastUpdated).toLocaleDateString() : 'January 1, 2026'}</p>

                  {dbPrivacy?.content ? (
                    <div className="legal-content-html" dangerouslySetInnerHTML={{ __html: dbPrivacy.content }} />
                  ) : (
                    <>
                      <h3 className="font-heading font-bold text-primary text-[15px] mt-6">1. Information We Collect</h3>
                      <p>
                        We collect information you provide directly to us when subscribing to our digital magazines, filling out contact support tickets, or interacting with our medical calculators. This includes your name, email address, IP address, and browser cookies.
                      </p>

                      <h3 className="font-heading font-bold text-primary text-[15px] mt-6">2. How We Use Information</h3>
                      <p>
                        We use the information collected to deliver our newsletter, process payment details via secure gateways, personalize your viewing logs, and optimize our medical content syndication templates.
                      </p>

                      <h3 className="font-heading font-bold text-primary text-[15px] mt-6">3. Cookie & Analytics Tracking</h3>
                      <p>
                        A Health Place uses first-party and third-party cookies to remember consent choices and analyze traffic. You can reject analytics cookies through the cookie banner at the bottom of the home screen.
                      </p>

                      <h3 className="font-heading font-bold text-primary text-[15px] mt-6">4. Contact Information</h3>
                      <p>
                        If you have questions about your privacy rights or request data erasure, contact our data compliance officer at <strong>privacy@ahealthplace.com</strong>.
                      </p>
                    </>
                  )}
                </>
              )}

              {activeLegalDoc === 'terms' && (
                <>
                  <h2 className="font-heading font-extrabold text-2xl text-primary mb-6">{dbTerms?.title || 'Terms of Service'}</h2>
                  <p className="text-slate-400 text-xs mb-4">Last Updated: {dbTerms?.lastUpdated ? new Date(dbTerms.lastUpdated).toLocaleDateString() : 'January 1, 2026'}</p>

                  {dbTerms?.content ? (
                    <div className="legal-content-html" dangerouslySetInnerHTML={{ __html: dbTerms.content }} />
                  ) : (
                    <>
                      <h3 className="font-heading font-bold text-primary text-[15px] mt-6">1. Acceptance of Terms</h3>
                      <p>
                        By accessing or using the A Health Place digital publication platform, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the website.
                      </p>

                      <h3 className="font-heading font-bold text-primary text-[15px] mt-6">2. Intellectual Property Rights</h3>
                      <p>
                        All content, including medically reviewed wellness guides, graphics, digital magazine cover illustrations, code layouts, and custom scripts are the intellectual property of A Health Place and may not be reproduced without written licensing agreements.
                      </p>

                      <h3 className="font-heading font-bold text-primary text-[15px] mt-6">3. User Conduct</h3>
                      <p>
                        You agree not to attempt database scraping, SQL injection, API keys spoofing, or bypass cookie consent checks on the CMS administration interfaces. Any unauthorized server access will result in immediate IP blocking.
                      </p>

                      <h3 className="font-heading font-bold text-primary text-[15px] mt-6">4. Subscription Terminations</h3>
                      <p>
                        Subscribers may terminate their digital issue newsletter membership at any time using the link provided in the quarterly email delivery or by submitting a ticket under the contact panel.
                      </p>
                    </>
                  )}
                </>
              )}

              {activeLegalDoc === 'cookies' && (
                <>
                  <h2 className="font-heading font-extrabold text-2xl text-primary mb-6">{dbCookies?.title || 'Cookie Policy'}</h2>
                  <p className="text-slate-400 text-xs mb-4">Last Updated: {dbCookies?.lastUpdated ? new Date(dbCookies.lastUpdated).toLocaleDateString() : 'January 1, 2026'}</p>

                  {dbCookies?.content ? (
                    <div className="legal-content-html" dangerouslySetInnerHTML={{ __html: dbCookies.content }} />
                  ) : (
                    <>
                      <h3 className="font-heading font-bold text-primary text-[15px] mt-6">1. What Are Cookies</h3>
                      <p>
                        Cookies are small text files placed on your device to collect standard Internet log information and visitor behavior information. When you visit our website, we may collect information from you automatically through cookies or similar technology.
                      </p>

                      <h3 className="font-heading font-bold text-primary text-[15px] mt-6">2. How We Use Cookies</h3>
                      <p>
                        Our company uses cookies in a range of ways to improve your experience on our website, including keeping you signed in, managing site consent settings, and understanding how you use our website.
                      </p>

                      <h3 className="font-heading font-bold text-primary text-[15px] mt-6">3. Managing Cookie Settings</h3>
                      <p>
                        You can set your browser not to accept cookies, or decline tracking preferences in our Cookie Banner option. However, in a few cases, some of our website features may not function as a result.
                      </p>
                    </>
                  )}
                </>
              )}

              {activeLegalDoc === 'disclaimer' && (
                <>
                  <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-semibold mb-6">
                    <ShieldAlert size={18} className="shrink-0 text-amber-600" />
                    IMPORTANT SAFETY NOTICE: Read carefully before following any guidelines.
                  </div>

                  <h2 className="font-heading font-extrabold text-2xl text-primary mb-6">{dbDisclaimer?.title || 'Medical Disclaimer'}</h2>
                  <p className="text-slate-400 text-xs mb-4">Last Updated: {dbDisclaimer?.lastUpdated ? new Date(dbDisclaimer.lastUpdated).toLocaleDateString() : 'January 1, 2026'}</p>

                  {dbDisclaimer?.content ? (
                    <div className="legal-content-html" dangerouslySetInnerHTML={{ __html: dbDisclaimer.content }} />
                  ) : (
                    <>
                      <h3 className="font-heading font-bold text-primary text-[15px] mt-6">1. No Medical Advice</h3>
                      <p>
                        The contents of the A Health Place website, such as articles, newsletters, graphics, physical diagnostics helpers, and guides are for informational purposes only. The content is <strong>not</strong> intended to be a substitute for professional medical advice, diagnosis, or treatment.
                      </p>

                      <h3 className="font-heading font-bold text-primary text-[15px] mt-6">2. Critical Emergency Care</h3>
                      <p>
                        Never disregard professional medical advice or delay seeking treatment because of something you have read on this site. If you think you may have a medical emergency, call your local medical emergency number (e.g. 911) or go to the nearest emergency room immediately.
                      </p>

                      <h3 className="font-heading font-bold text-primary text-[15px] mt-6">3. Endorsement and Liability</h3>
                      <p>
                        A Health Place does not recommend or endorse any specific tests, medical physicians, clinic setups, pharmaceuticals, or traditional wellness herbal routines that may be mentioned. Reliance on any details provided by the editorial team or review board is solely at your own risk.
                      </p>
                    </>
                  )}
                </>
              )}

              {activeLegalDoc === 'refund' && (
                <>
                  <h2 className="font-heading font-extrabold text-2xl text-primary mb-6">{dbRefund?.title || 'Refund Policy'}</h2>
                  <p className="text-slate-400 text-xs mb-4">Last Updated: {dbRefund?.lastUpdated ? new Date(dbRefund.lastUpdated).toLocaleDateString() : 'January 1, 2026'}</p>

                  {dbRefund?.content ? (
                    <div className="legal-content-html" dangerouslySetInnerHTML={{ __html: dbRefund.content }} />
                  ) : (
                    <>
                      <h3 className="font-heading font-bold text-primary text-[15px] mt-6">1. Subscription Refunds</h3>
                      <p>
                        Since our articles and digital calculators are free or available under open licensing, digital premium issues are non-refundable once delivered.
                      </p>

                      <h3 className="font-heading font-bold text-primary text-[15px] mt-6">2. Billing Disputes</h3>
                      <p>
                        If you believe you were charged in error for a premium newsletter membership, submit a ticket through our Contact Support tab.
                      </p>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
