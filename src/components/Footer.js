import Image from 'next/image';
import Link from 'next/link';

export default function Footer({ className = "" }) {
  return (
    <footer className="footer bg-cyan-900 text-white relative overflow-hidden rounded-t-[48px] border-t border-white/5 pt-24 pb-12 mt-[-48px] z-10">
      {/* Top Accent Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-accent/30 to-transparent pointer-events-none" />

      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-80 h-80 bg-accent-green/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container relative z-10">
        <div className="footer-grid grid grid-cols-1 lg:grid-cols-[1.1fr_1.9fr] gap-16 lg:gap-24 pb-16">

          {/* Brand Presentation Card (Premium Glass & Shadow Gradient) */}
          <div className="footer-brand flex flex-col gap-6 bg-gradient-to-br from-white/[0.12] via-white/[0.03] to-transparent border border-white/10 backdrop-blur-2xl rounded-3xl p-8 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 shadow-[0_10px_40px_rgba(100,100,200,0.05)] hover:shadow-[0_15px_50px_rgba(100,100,200,0.15)]">
            <a href="#" className="logo-link-footer inline-block self-start transition-all duration-300">
              <Image
                src="/images/Logo-web.png"
                alt="A Health Place Logo"
                width={320}
                height={90}
                className="logo-img h-20 w-auto object-contain"
              />
            </a>
            <p className="footer-tagline text-[14px] text-white/60 leading-relaxed font-body">
              Empowering individuals with reliable, medically verified guides to navigate daily physical and emotional health. Your trusted companion on the journey to holistic wellness.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 mt-2">
              {[
                { icon: 'instagram', link: 'https://www.instagram.com/ahealthplace/', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                { icon: 'facebook', link: 'https://www.facebook.com/ahealthplace', path: 'M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z' },
                { icon: 'linkedin', link: 'https://www.linkedin.com/company/a-health-place/', path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' },
                { icon: 'youtube', link: 'https://www.youtube.com/@ahealthplace', path: 'M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-accent hover:border-accent hover:bg-accent/5 hover:-translate-y-1 transition-all duration-300 shadow-md"
                  aria-label={social.icon}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="footer-links-group grid grid-cols-1 sm:grid-cols-3 gap-12 lg:gap-8 pt-4">

            {/* ISSN Barcode */}
            <div className="footer-col flex flex-col gap-4">
              <h4 className="footer-title font-heading text-[12px] font-extrabold uppercase tracking-[2.5px] text-teal-300 mb-6">
                ISSN
              </h4>
              <div className="bg-white p-3 rounded-xl inline-block self-start shadow-sm border border-white/20">
                <Image
                  src="/images/ISSN_BARCODE.png"
                  alt="ISSN Barcode"
                  width={180}
                  height={70}
                  className="object-contain animate-[pulse_3s_infinite_ease-in-out]"
                />
              </div>
            </div>

            {/* Company */}
            <div className="footer-col">
              <h4 className="footer-title font-heading text-[12px] font-extrabold uppercase tracking-[2.5px] text-teal-300 mb-6">
                Company
              </h4>
              <ul className="footer-links list-none flex flex-col gap-4">
                <li>
                  <a
                    href="mailto:support@ahealthplace.com"
                    className="footer-link text-[14px] text-white/90 font-semibold no-underline transition-all duration-300 hover:text-teal-300 hover:pl-2 flex items-center group font-body"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-300 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                    support@ahealthplace.com
                  </a>
                </li>
                {[
                  { label: 'About Our Board', link: '#' },
                  { label: 'Contact Support', link: '#' }
                ].map((item, idx) => (
                  <li key={idx}>
                    <a
                      href={item.link}
                      className="footer-link text-[14px] text-white/80 no-underline transition-all duration-300 hover:text-teal-300 hover:pl-2 flex items-center group font-body"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-300 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="footer-col">
              <h4 className="footer-title font-heading text-[12px] font-extrabold uppercase tracking-[2.5px] text-teal-300 mb-6">Legal</h4>
              <ul className="footer-links list-none flex flex-col gap-3">
                <li><Link href="/info?tab=legal&doc=privacy" className="footer-link text-[13.5px] text-white/80 no-underline transition-all hover:text-teal-300 hover:pl-1">Privacy Policy</Link></li>
                <li><Link href="/info?tab=legal&doc=terms" className="footer-link text-[13.5px] text-white/80 no-underline transition-all hover:text-teal-300 hover:pl-1">Terms of Service</Link></li>
                <li><Link href="/info?tab=legal&doc=disclaimer" className="footer-link text-[13.5px] text-white/80 no-underline transition-all hover:text-teal-300 hover:pl-1">Medical Disclaimer</Link></li>
              </ul>
            </div>

          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom flex flex-col sm:flex-row justify-between items-center pt-10 mt-6 gap-6 text-center sm:text-left border-t border-white/5">
          <p className="copyright text-[12px] text-white/40 leading-relaxed font-body">
            © 2026 A Health Place. All rights reserved. Professional medical advice should be sought for any health concerns.
          </p>
          <div className="footer-bottom-links flex gap-6">
            <a href="/legal/privacy" className="footer-bottom-link text-[12.5px] text-white/40 no-underline hover:text-accent transition-colors duration-300 font-body">
              Privacy Policy
            </a>
            <a href="/legal/terms" className="footer-bottom-link text-[12.5px] text-white/40 no-underline hover:text-accent transition-colors duration-300 font-body">
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
