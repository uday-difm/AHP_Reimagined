import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="footer bg-bg-dark text-white py-20 rounded-t-[40px]">
      <div className="container">
        <div className="footer-grid grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-20 border-b border-white/8 pb-15">
          {/* Logo and Info */}
          <div className="footer-brand flex flex-col gap-5">
            <a href="#" className="logo-link-footer inline-block">
              <div className="logo-badge bg-white px-5 py-2.5 rounded-xl inline-flex items-center justify-center transition-transform hover:scale-[1.03]">
                <Image
                  src="/images/Logo-web.png"
                  alt="A Health Place Logo"
                  width={180}
                  height={36}
                  className="logo-img h-9 w-auto object-contain"
                />
              </div>
            </a>
            <p className="footer-tagline text-[14px] text-white/60 leading-relaxed max-w-[320px]">Empowering individuals with reliable, medically verified guides to navigate daily physical and emotional health.</p>
          </div>

          {/* Links Grid */}
          <div className="footer-links-group grid grid-cols-1 sm:grid-cols-3 gap-10">
            {/* Categories */}
            <div className="footer-col">
              <h4 className="footer-title font-heading text-[12px] font-semibold uppercase tracking-[2px] text-accent mb-6">Categories</h4>
              <ul className="footer-links list-none flex flex-col gap-3">
                <li><a href="#" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Physical Health</a></li>
                <li><a href="#" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Mental Health</a></li>
                <li><a href="#" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Holistic Ayurveda</a></li>
                <li><a href="#" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Insurance Mappings</a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="footer-col">
              <h4 className="footer-title font-heading text-[12px] font-semibold uppercase tracking-[2px] text-accent mb-6">Company</h4>
              <ul className="footer-links list-none flex flex-col gap-3">
                <li><a href="mailto:support@ahealthplace.com" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">support@ahealthplace.com</a></li>
                <li><a href="#" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">About Our Board</a></li>
                <li><a href="#" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Contact Support</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="footer-col">
              <h4 className="footer-title font-heading text-[12px] font-semibold uppercase tracking-[2px] text-accent mb-6">Legal</h4>
              <ul className="footer-links list-none flex flex-col gap-3">
                <li><a href="#" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Privacy Policy</a></li>
                <li><a href="#" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Terms of Service</a></li>
                <li><a href="#" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Medical Disclaimer</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom flex justify-between items-center pt-10 flex-wrap gap-5">
          <p className="copyright text-[12px] text-white/40 leading-relaxed">© 2026 A Health Place. All rights reserved. Professional medical advice should be sought for any health concerns.</p>
          <div className="footer-bottom-links flex gap-6">
            <a href="#" className="footer-bottom-link text-[12px] text-white/40 no-underline hover:text-white">Privacy Policy</a>
            <a href="#" className="footer-bottom-link text-[12px] text-white/40 no-underline hover:text-white">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
