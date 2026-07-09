import Image from 'next/image';
import Link from 'next/link';

export default function Footer({ className = "" }) {
  return (
    <footer className={`footer bg-bg-dark text-white rounded-t-[40px] ${className || 'py-20'}`}>
      <div className="container">
        <div className="footer-grid grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-20 border-b border-white/8 pb-15">
          {/* Logo and Info */}
          <div className="footer-brand flex flex-col gap-5">
            <Link href="/" className="logo-link-footer inline-block">
              <div className="logo-badge bg-white px-5 py-2.5 rounded-xl inline-flex items-center justify-center transition-transform hover:scale-[1.03]">
                <Image
                  src="/images/Logo-web.png"
                  alt="A Health Place Logo"
                  width={180}
                  height={36}
                  className="logo-img h-9 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="footer-tagline text-[14px] text-white/60 leading-relaxed max-w-[320px]">Empowering individuals with reliable, medically verified guides to navigate daily physical and emotional health.</p>
            <div className="issn-barcode mt-2 opacity-85 hover:opacity-100 transition-opacity">
              <a href="https://portal.issn.org/resource/ISSN/3066-5027" target="_blank" rel="noopener noreferrer" className="inline-block">
                <Image
                  src="https://earthbyhumans.s3-eu-central-2.ionoscloud.com/statics/EBH-ISSN.jpg"
                  alt="ISSN Barcode"
                  width={140}
                  height={70}
                  className="h-12 w-auto object-contain rounded"
                  unoptimized
                />
              </a>
            </div>
            <div className="footer-socials flex gap-4 mt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white/45 hover:text-accent transition-colors duration-300" aria-label="Facebook">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/45 hover:text-accent transition-colors duration-300" aria-label="Instagram">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white/45 hover:text-accent transition-colors duration-300" aria-label="LinkedIn">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/45 hover:text-accent transition-colors duration-300" aria-label="Twitter">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="footer-links-group grid grid-cols-1 sm:grid-cols-3 gap-10">
            {/* Categories */}
            <div className="footer-col">
              <h4 className="footer-title font-heading text-[12px] font-semibold uppercase tracking-[2px] text-accent mb-6">Categories</h4>
              <ul className="footer-links list-none flex flex-col gap-3">
                <li><Link href="/blogs?filter=Physical%20Health" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Physical Health</Link></li>
                <li><Link href="/blogs?filter=Mental%20Health" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Mental Health</Link></li>
                <li><Link href="/blogs?filter=Holistic%20Ayurveda" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Holistic Ayurveda</Link></li>
                <li><Link href="/blogs?filter=Insurance%20Mappings" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Insurance Mappings</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div className="footer-col">
              <h4 className="footer-title font-heading text-[12px] font-semibold uppercase tracking-[2px] text-accent mb-6">Company</h4>
              <ul className="footer-links list-none flex flex-col gap-3">
                <li><a href="mailto:support@ahealthplace.com" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">support@ahealthplace.com</a></li>
                <li><Link href="/info?tab=board" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">About Our Board</Link></li>
                <li><Link href="/info?tab=support" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Contact Support</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="footer-col">
              <h4 className="footer-title font-heading text-[12px] font-semibold uppercase tracking-[2px] text-accent mb-6">Legal</h4>
              <ul className="footer-links list-none flex flex-col gap-3">
                <li><Link href="/info?tab=legal&doc=privacy" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Privacy Policy</Link></li>
                <li><Link href="/info?tab=legal&doc=terms" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Terms of Service</Link></li>
                <li><Link href="/info?tab=legal&doc=disclaimer" className="footer-link text-[13.5px] text-white/60 no-underline transition-all hover:text-white hover:pl-1">Medical Disclaimer</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom flex justify-center items-center pt-10 text-center">
          <p className="copyright text-[12px] text-white/40 leading-relaxed">© 2026 A Health Place. All rights reserved. Professional medical advice should be sought for any health concerns.</p>
        </div>
      </div>
    </footer>
  );
}
