import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import CustomCursor from '@/components/CustomCursor';
import BackdropBlobs from '@/components/BackdropBlobs';
import Button from '@/components/Button';
import AdSlot from '@/components/AdSlot';

export const metadata = {
  title: 'About Us — A Health Place',
  description:
    'Learn about A Health Place — our mission to deliver empathetic, medically verified health guides, and our commitment to holistic wellness.',
};

const stats = [
  { value: '500+', label: 'Verified Articles' },
  { value: '40+', label: 'Clinical Advisors' },
  { value: '1M+', label: 'Monthly Readers' },
  { value: '8', label: 'Health Categories' },
];

const values = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Clinical Accuracy',
    desc: 'Every article is reviewed by licensed physicians, registered dietitians, and certified specialists before publication.',
    color: 'bg-[#e8f4ff] text-[#1fb9fb]',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: 'Empathetic Approach',
    desc: 'We write for real people navigating real health challenges — with warmth, clarity, and zero jargon overload.',
    color: 'bg-[#fdecea] text-[#e05248]',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    title: 'Holistic Perspective',
    desc: 'From Ayurveda to insurance navigation — we cover the full spectrum of health so you never feel lost.',
    color: 'bg-[#e8f8f0] text-[#27ae60]',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Always Evolving',
    desc: 'Health science moves fast. We continuously update our content to reflect the latest clinical research and guidelines.',
    color: 'bg-[#fff8e8] text-[#f39c12]',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: 'Community First',
    desc: 'Built around our readers — we listen, adapt, and grow alongside the community we serve.',
    color: 'bg-[#f3eeff] text-[#8e44ad]',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
      </svg>
    ),
    title: 'Transparent & Safe',
    desc: 'No hidden agendas. We clearly distinguish editorial content from sponsored material — always.',
    color: 'bg-[#e8f4ff] text-[#1fb9fb]',
  },
];

const categories = [
  { name: 'Physical Health', icon: '🏃', desc: 'Cardio, sleep, preventive routines' },
  { name: 'Mental Health', icon: '🧠', desc: 'Stress resilience & mindfulness' },
  { name: 'Holistic Ayurveda', icon: '🌿', desc: 'Ancient wisdom, modern context' },
  { name: 'Nutrition & Diet', icon: '🥗', desc: 'Clean eating & clinical nutrition' },
  { name: 'Fitness & Training', icon: '💪', desc: 'Strength, posture & movement' },
  { name: 'Insurance Mappings', icon: '📋', desc: 'Claims, codes & coverage' },
  { name: 'Digital Wellness', icon: '📱', desc: 'Screen balance & focus' },
  { name: 'Alternative Care', icon: '🌸', desc: 'Herbal & natural therapies' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-light relative">
      <CustomCursor />
      <ScrollReveal />
      <BackdropBlobs />
      <Header />

      <main className="w-full">

        <section className="relative overflow-hidden bg-gradient-to-br from-[#f0fafa] via-[#f8fafc] to-[#eaf7f7] pt-[140px] pb-24 md:pb-32 rounded-b-[40px] border-b border-slate-200/20">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#27ae60]/8 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/4" />
          <div className="container relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

              {/* Left — Text */}
              <div className="flex-1 reveal-slide">
                <span className="inline-block text-[11px] font-bold tracking-[3px] uppercase text-accent mb-5">Our Story</span>
                <h1 className="font-heading font-extrabold text-[40px] md:text-[64px] lg:text-[72px] text-primary leading-[1.05] tracking-[-2px] mb-7">
                  Health information<br />
                  <span className="text-accent">you can trust.</span>
                </h1>
                <p className="text-[16px] md:text-[18px] text-secondary leading-[1.8] max-w-xl mb-10">
                  A Health Place was founded on a single belief — that every person deserves access to empathetic, accurate,
                  and actionable health guidance. No gatekeeping, no scare tactics, just science-backed clarity.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button href="/blogs" variant="primary" className="!text-[13px] !py-3.5 !px-7 font-bold shadow-[0_8px_24px_rgba(79,192,195,0.35)] hover:shadow-[0_12px_32px_rgba(79,192,195,0.45)]">
                    Explore Articles
                  </Button>
                  <Button href="/about#values" variant="outline" className="!text-[13px] !py-3.5 !px-7">
                    Our Values
                  </Button>
                </div>
              </div>

              {/* Right — Visual card */}
              <div className="flex-shrink-0 w-full lg:w-[440px] reveal-scale">
                <div className="relative min-h-[360px] md:min-h-[420px] h-auto">
                  <div className="absolute top-6 right-6 w-full h-full bg-[#dceeed]/60 rounded-[32px] border border-slate-200/40 rotate-2" />
                  <div className="relative z-10 w-full h-full min-h-[360px] md:min-h-[420px] bg-[#1c7b80] rounded-[32px] overflow-hidden flex flex-col justify-between p-8 md:p-10 shadow-[0_24px_60px_rgba(28,123,128,0.25)]">
                    <div>
                      <span className="text-white/70 font-bold text-[10px] uppercase tracking-[2.5px]">Medically Verified</span>
                      <h3 className="font-heading font-extrabold text-[26px] md:text-[32px] text-white mt-3 leading-tight tracking-tight">
                        Science-backed.<br />Human-first.
                      </h3>
                      <p className="text-white/80 text-[14px] leading-relaxed mt-4 max-w-sm">
                        Our review board spans cardiology, psychiatry, Ayurveda, clinical dietetics, and insurance navigation.
                      </p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {['Physicians', 'Dietitians', 'Specialists', 'Advisors'].map((t, i) => (
                        <span key={i} className="bg-white/15 text-white/90 text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/20">{t}</span>
                      ))}
                    </div>
                    <div className="absolute bottom-[-80px] right-[-60px] w-[240px] h-[240px] rounded-full bg-white/5 border border-white/10 pointer-events-none" />
                    <div className="absolute bottom-[-40px] right-[-20px] w-[160px] h-[160px] rounded-full bg-white/5 border border-white/10 pointer-events-none" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Ad Spot */}
        <div className="container mx-auto my-10 px-6">
          <AdSlot zone="about-hero-bottom" />
        </div>

        {/* Stats Banner */}
        <section className="bg-primary py-16">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
              {stats.map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center px-6 py-4 md:py-0 reveal-scale">
                  <span className="font-heading font-extrabold text-[40px] md:text-[52px] text-accent leading-none tracking-tight">{s.value}</span>
                  <span className="text-white/60 text-[13px] mt-2 font-body tracking-wide">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-24 md:py-32 bg-white">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div className="reveal-slide">
                <span className="text-[11px] font-bold tracking-[3px] uppercase text-accent mb-4 block">Our Mission</span>
                <h2 className="font-heading font-extrabold text-[32px] md:text-[48px] text-primary leading-[1.15] tracking-[-1px] mb-6">
                  Empathetic, verified,<br />and forward-thinking.
                </h2>
                <p className="text-[16px] text-secondary leading-[1.8] mb-5">
                  We believe health information should be transparent and accessible. We work alongside leading physicians,
                  registered dietitians, and clinical advisors to structure guides that promote physical longevity and mental resilience.
                </p>
                <p className="text-[16px] text-secondary leading-[1.8] mb-8">
                  Our editorial process is rigorous. Every piece of content is fact-checked against peer-reviewed literature
                  and signed off by at least one qualified medical professional. We never publish anything we would not share with our own families.
                </p>
              </div>

              {/* Visual card */}
              <div className="relative h-[420px] md:h-[480px] reveal-scale">
                <div className="absolute top-8 right-8 w-full h-full bg-[#dceeed]/60 rounded-[32px] border border-slate-200/40 rotate-2" />
                <div className="relative z-10 w-full h-full bg-[#1c7b80] rounded-[32px] overflow-hidden flex flex-col justify-between p-8 md:p-10 shadow-[0_24px_60px_rgba(28,123,128,0.25)]">
                  <div>
                    <span className="text-white/70 font-bold text-[10px] uppercase tracking-[2.5px]">Medically Verified</span>
                    <h3 className="font-heading font-extrabold text-[26px] md:text-[32px] text-white mt-3 leading-tight tracking-tight">
                      Science-backed.<br />Human-first.
                    </h3>
                    <p className="text-white/80 text-[14px] leading-relaxed mt-4 max-w-sm">
                      Our review board spans cardiology, psychiatry, Ayurveda, clinical dietetics, and insurance navigation.
                    </p>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {['Physicians', 'Dietitians', 'Specialists', 'Advisors'].map((t, i) => (
                      <span key={i} className="bg-white/15 text-white/90 text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/20">{t}</span>
                    ))}
                  </div>
                  <div className="absolute bottom-[-80px] right-[-60px] w-[240px] h-[240px] rounded-full bg-white/5 border border-white/10 pointer-events-none" />
                  <div className="absolute bottom-[-40px] right-[-20px] w-[160px] h-[160px] rounded-full bg-white/5 border border-white/10 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ad Spot */}
        <div className="container mx-auto my-10 px-6">
          <AdSlot zone="about-mission-bottom" />
        </div>

        {/* Values */}
        <section className="py-24 md:py-32 bg-[#f8fafc]">
          <div className="container">
            <div className="text-center max-w-[560px] mx-auto mb-16 reveal-slide">
              <span className="text-[11px] font-bold tracking-[3px] uppercase text-accent mb-4 block">What We Stand For</span>
              <h2 className="font-heading font-extrabold text-[32px] md:text-[44px] text-primary tracking-[-1px] leading-[1.15]">
                Six principles that guide everything we do
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((v, i) => (
                <div key={i} className="bg-white rounded-[24px] p-7 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(79,192,195,0.08)] hover:-translate-y-1 transition-all duration-300 reveal-slide">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${v.color}`}>
                    {v.icon}
                  </div>
                  <h3 className="font-heading font-bold text-[17px] text-primary mb-2">{v.title}</h3>
                  <p className="text-[13.5px] text-secondary leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-24 md:py-32 bg-white">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="reveal-slide">
                <span className="text-[11px] font-bold tracking-[3px] uppercase text-accent mb-4 block">What We Cover</span>
                <h2 className="font-heading font-extrabold text-[32px] md:text-[44px] text-primary tracking-[-1px] leading-[1.15] mb-6">
                  Eight health categories.<br />Thousands of answers.
                </h2>
                <p className="text-[16px] text-secondary leading-[1.8] mb-8">
                  From everyday nutrition questions to navigating complex insurance codes — our library covers the full
                  arc of human health so you always find what you need.
                </p>
                <Button href="/blogs" variant="primary" className="!bg-primary hover:!bg-[#16162a] !text-[13px] !py-3.5 !px-7 font-bold shadow-sm inline-flex items-center gap-2">
                  Browse All Articles
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 reveal-scale">
                {categories.map((cat, i) => (
                  <Link key={i} href={`/blogs?filter=${encodeURIComponent(cat.name)}`} className="group bg-[#f0fafa] hover:bg-[#e0f5f5] rounded-[20px] p-5 border border-[#d4eeed] hover:border-accent/40 transition-all duration-300 no-underline hover:-translate-y-0.5">
                    <span className="text-2xl mb-3 block">{cat.icon}</span>
                    <p className="font-heading font-bold text-[14px] text-primary group-hover:text-accent transition-colors">{cat.name}</p>
                    <p className="text-[12px] text-secondary mt-0.5">{cat.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 md:py-32 bg-gradient-to-br from-[#1c7b80] via-[#1a1a2e] to-[#1a1a2e] relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#27ae60]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-accent/40 to-transparent pointer-events-none" />
          <div className="container relative z-10 text-center">
            <span className="inline-block text-[11px] font-bold tracking-[3px] uppercase text-accent mb-5 reveal-slide">Start Your Journey</span>
            <h2 className="font-heading font-extrabold text-[32px] md:text-[52px] text-white leading-[1.1] tracking-[-1.5px] mb-6 max-w-2xl mx-auto reveal-slide">
              Small changes.<br />Big impact.
            </h2>
            <p className="text-[16px] text-white/70 leading-[1.8] max-w-lg mx-auto mb-10 reveal-fade">
              Browse hundreds of clinically reviewed guides — free, forever. Your health journey starts with one article.
            </p>
            <div className="flex flex-wrap gap-4 justify-center reveal-fade">
              <Button href="/blogs" variant="primary">
                Read Our Guides
              </Button>
              <Button href="/services" variant="transparent">
                Partner With Us
              </Button>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
