'use client';

export default function Newsletter() {
  return (
    <section id="contact" className="cta-section py-[120px] bg-white text-center relative">
      <div className="container">
        <div className="cta-content max-w-[700px] mx-auto flex flex-col items-center gap-6 reveal-slide">
          <h2 className="cta-title font-heading font-extrabold text-[36px] md:text-[54px] text-primary tracking-[-2px] leading-[1.1]">Subscribe to our newsletter</h2>
          <p className="cta-subtitle text-[15px] md:text-[17px] text-secondary leading-relaxed mb-3">Join 50,000+ wellness readers receiving expert medical guidelines directly in their inbox every week.</p>
          
          <form
            className="newsletter-form-main flex flex-col sm:flex-row w-full max-w-[560px] gap-4 mb-2"
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you for subscribing to A Health Place!');
            }}
          >
            <input
              type="email"
              placeholder="Enter your email address"
              required
              className="newsletter-input-main flex-grow bg-bg-light border border-slate-200 rounded-full px-7 py-4 text-sm outline-none text-primary transition-all duration-300 focus:border-accent focus:bg-white focus:shadow-[0_0_0_4px_rgba(31,185,251,0.1)]"
            />
            <button type="submit" className="btn-primary btn-large hover-glow bg-primary text-white px-9 py-4 rounded-full font-bold text-[15px] border border-primary hover:bg-transparent hover:text-primary transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(26,26,46,0.12)]">
              Subscribe
            </button>
          </form>
          <p className="form-disclaimer text-[12px] text-muted">Zero spam. Unsubscribe at any time.</p>
        </div>
      </div>
    </section>
  );
}
