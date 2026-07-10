import Image from 'next/image';
import Link from 'next/link';

export default function WellnessShowcase() {
  return (
    <section id="about" className="values-section py-[100px] bg-slate-50/50 rounded-b-[40px]">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-grid grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-[60px] mb-16 items-end">
          <div className="reveal-slide">
            <h2 className="section-title-large font-heading font-bold text-[32px] md:text-[54px] leading-[1.15] text-primary tracking-[-1px]">
              Empathetic, verified, and forward-thinking.
            </h2>
          </div>
          <div className="reveal-fade">
            <p className="section-subtitle-text text-[16px] text-secondary leading-[1.7]">
              We believe health information should be transparent and accessible. We work alongside leading physicians, registered dietitians, and clinical advisors to structure guides that promote physical longevity and mental resilience<Link href="/services" className="hover:text-accent transition-colors cursor-default select-none">.</Link>
            </p>
          </div>
        </div>

        {/* Modular Grid Layout (swapped gallery) */}
        <div className="flex flex-col gap-8">
          
          {/* Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Large Card: Ayurveda Hub */}
            <div className="lg:col-span-2 bg-[#dceeed]/90 border border-slate-200/40 rounded-[32px] p-8 md:p-10 flex flex-col justify-between items-center text-center relative overflow-hidden h-[420px] md:h-[460px] reveal-slide">
              <div className="flex flex-col items-center max-w-md z-10">
                <span className="text-[#0f7c85] font-extrabold text-[11px] uppercase tracking-[2.5px] mb-3">Ayurvedic Living</span>
                <h3 className="text-primary font-heading font-extrabold text-[26px] md:text-[34px] leading-tight tracking-tight mb-4">
                  Ayurvedic living, simplified
                </h3>
                <p className="text-[#4a4a5a] text-[13.5px] md:text-[14.5px] leading-relaxed mb-6">
                  Take charge of your digestion with guidance on natural remedies, biophilic diets, and gut longevity from our certified specialists.
                </p>
                <Link href="/blogs?filter=Holistic%20Ayurveda" className="bg-[#0f7c85] hover:bg-[#0c646b] text-white font-bold text-[12.5px] py-3 px-6 rounded-full transition-all duration-300 no-underline shadow-sm">
                  Visit Ayurveda Hub
                </Link>
              </div>
              
              {/* Circle plate image at the bottom */}
              <div className="absolute bottom-[-110px] w-[250px] h-[250px] rounded-full overflow-hidden border-[6px] border-white shadow-lg z-0">
                <Image 
                  src="/images/ayurveda.png" 
                  alt="Ayurvedic medicine" 
                  fill 
                  className="object-cover"
                  sizes="250px"
                />
              </div>
            </div>

            {/* Right Column: 3 Small Cards */}
            <div className="flex flex-col gap-4 reveal-slide">
              {[
                {
                  tag: 'Daily Wellness Guide',
                  desc: 'Quick tips to integrate wellness routines into your busy schedule.',
                  link: '/blogs',
                },
                {
                  tag: 'Stress Assessment',
                  desc: 'Analyze your daily anxiety levels and unlock targeted breathing guides.',
                  link: '/blogs?filter=Mental%20Health',
                },
                {
                  tag: 'Metabolism Indicator',
                  desc: 'Discover if your digestive fire is balanced, weak, or hyperactive.',
                  link: '/blogs?filter=Holistic%20Ayurveda',
                },
              ].map((item, idx) => (
                <Link key={idx} href={item.link} className="bg-[#eaf1f0] hover:bg-[#e0e9e8] rounded-[24px] p-5 flex items-center justify-between gap-4 border border-slate-100 hover:shadow-md transition-all duration-300 group no-underline text-left flex-grow">
                  <div className="flex flex-col gap-1">
                    <span className="text-[#0f7c85] font-extrabold text-[10px] uppercase tracking-wider">{item.tag}</span>
                    <p className="text-primary font-heading font-bold text-[13.5px] leading-snug">{item.desc}</p>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 border border-slate-100/50 group-hover:scale-105 transition-transform">
                    <svg className="w-4 h-4 text-[#0f7c85]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: 3 Medium/Teal Small Cards */}
            <div className="flex flex-col gap-4 order-2 lg:order-1 reveal-slide">
              {[
                {
                  tag: 'Sleep Hygiene Checklist',
                  desc: 'Unlock clinically approved techniques to optimize your REM sleep.',
                  link: '/blogs?filter=Physical%20Health',
                },
                {
                  tag: 'Insurance Code Lookup',
                  desc: 'Demystify medical claims, diagnostic codes, and wellness coverage.',
                  link: '/blogs?filter=Insurance%20Mappings',
                },
                {
                  tag: 'Find Care Provider',
                  desc: 'Connect with certified ayurvedic specialists on our review board.',
                  link: '/info?tab=board',
                },
              ].map((item, idx) => (
                <Link key={idx} href={item.link} className="bg-[#3f9a9e] hover:bg-[#368b8e] rounded-[24px] p-5 flex items-center justify-between gap-4 hover:shadow-md transition-all duration-300 group no-underline text-left flex-grow">
                  <div className="flex flex-col gap-1 text-white">
                    <span className="text-white/80 font-extrabold text-[10px] uppercase tracking-wider">{item.tag}</span>
                    <p className="font-heading font-bold text-[13.5px] leading-snug">{item.desc}</p>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-4 h-4 text-[#3f9a9e]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>

            {/* Large Card: Medical Directory */}
            <div className="lg:col-span-2 bg-[#1c7b80] rounded-[32px] p-8 md:p-10 flex flex-col justify-between items-center text-center relative overflow-hidden h-[420px] md:h-[460px] order-1 lg:order-2 reveal-slide">
              <div className="flex flex-col items-center max-w-md z-10 text-white">
                <span className="text-white/80 font-extrabold text-[11px] uppercase tracking-[2.5px] mb-3">Vetted Directory</span>
                <h3 className="font-heading font-extrabold text-[26px] md:text-[34px] leading-tight tracking-tight mb-4 text-white">
                  Medically verified guides: A to Z
                </h3>
                <p className="text-white/90 text-[13.5px] md:text-[14.5px] leading-relaxed mb-6">
                  Learn everything you need to know about wellness treatments, clinical research, diagnostics, and certified natural remedies.
                </p>
                <Link href="/blogs" className="bg-white text-[#1c7b80] hover:bg-slate-100 font-bold text-[12.5px] py-3 px-6 rounded-full transition-all duration-300 no-underline shadow-sm">
                  Search Directory
                </Link>
              </div>
              
              {/* Circle plate image at the bottom */}
              <div className="absolute bottom-[-110px] w-[250px] h-[250px] rounded-full overflow-hidden border-[6px] border-white shadow-lg z-0">
                <Image 
                  src="/images/disease.png" 
                  alt="Clinical directory" 
                  fill 
                  className="object-cover"
                  sizes="250px"
                />
              </div>
            </div>
            
          </div>
          
        </div>
      </div>
    </section>
  );
}
