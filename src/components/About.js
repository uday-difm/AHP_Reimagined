import Image from 'next/image';

export default function About() {
  return (
    <section id="about" className="values-section py-[100px] relative">
      <div className="container">
        <div className="section-header-grid grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-[60px] mb-16 items-end">
          <div className="reveal-slide">
            <h2 className="section-title-large font-heading font-bold text-[32px] md:text-[54px] leading-[1.15] text-primary tracking-[-1px]">Empathetic, verified, and forward-thinking.</h2>
          </div>
          <div className="reveal-fade">
            <p className="section-subtitle-text text-[16px] text-secondary leading-[1.7]">
              We believe health information should be transparent and accessible. We work alongside leading physicians, registered dietitians, and clinical advisors to structure guides that promote physical longevity and mental resilience.
            </p>
          </div>
        </div>

        {/* Asymmetrical Gallery Grid */}
        <div className="gallery-grid grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] md:grid-rows-[240px_240px] gap-6">
          <div
            className="gallery-item item-skewed relative rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)] md:row-span-2 reveal-slide group cursor-pointer"
            style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)' }}
          >
            <div className="image-zoom-container w-full h-full overflow-hidden relative">
              <Image
                src="/images/ayurveda.png"
                alt="Ayurvedic herbs and holistic healthcare"
                fill
                className="gallery-img object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-hover:rotate-1"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            </div>
            <div className="gallery-caption absolute bottom-5 left-5 bg-white/85 backdrop-blur-md px-4 py-2 rounded-full text-[12px] font-semibold text-primary shadow-[0_4px_12px_rgba(0,0,0,0.05)]">Holistic Ayurveda</div>
          </div>

          <div
            className="gallery-item item-rect-top relative rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)] md:col-start-2 md:row-start-1 reveal-slide group cursor-pointer"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 15% 100%)' }}
          >
            <div className="image-zoom-container w-full h-full overflow-hidden relative">
              <Image
                src="/images/hero_sleep.png"
                alt="Quiet sleep environment"
                fill
                className="gallery-img object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-hover:rotate-1"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
            <div className="gallery-caption absolute bottom-5 left-5 bg-white/85 backdrop-blur-md px-4 py-2 rounded-full text-[12px] font-semibold text-primary shadow-[0_4px_12px_rgba(0,0,0,0.05)]">Restful Decompression</div>
          </div>

          <div
            className="gallery-item item-rect-bottom relative rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)] md:col-start-2 md:row-start-2 reveal-slide group cursor-pointer"
            style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)' }}
          >
            <div className="image-zoom-container w-full h-full overflow-hidden relative">
              <Image
                src="/images/physical_health.png"
                alt="Healthy active lifestyle"
                fill
                className="gallery-img object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-hover:rotate-1"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
            <div className="gallery-caption absolute bottom-5 left-5 bg-white/85 backdrop-blur-md px-4 py-2 rounded-full text-[12px] font-semibold text-primary shadow-[0_4px_12px_rgba(0,0,0,0.05)]">Active Physical Longevity</div>
          </div>
        </div>
      </div>
    </section>
  );
}
