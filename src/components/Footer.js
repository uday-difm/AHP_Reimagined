'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

export default function Footer({ className = "" }) {
  const [footerConfig, setFooterConfig] = useState(null);
  const [navMenus, setNavMenus] = useState({});

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const emailInput = form.querySelector('input[type="email"]');
    const email = emailInput.value;
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerText;

    if (!email) return;

    try {
      btn.innerText = "Joining...";
      btn.disabled = true;
      const siteId = process.env.NEXT_PUBLIC_SITE_ID || "AHP";
      const res = await fetch(`/api/newsletter/subscribe?siteId=${siteId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, metadata: { source: "footer-newsletter" } })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to subscribe.");
      
      btn.innerText = "Joined!";
      emailInput.value = "";
      setTimeout(() => { btn.innerText = originalText; btn.disabled = false; }, 3000);
    } catch (err) {
      alert(err.message || "Something went wrong.");
      btn.innerText = originalText;
      btn.disabled = false;
    }
  };

  // Fetch footer layout configurations from DB
  useEffect(() => {
    fetch('/api/footer')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.data?.footer) {
          setFooterConfig(data.data.footer);
        }
      })
      .catch(() => { });
  }, []);

  // Pre-load default navigation menus
  useEffect(() => {
    fetch('/api/navigation/footer')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.data?.items)) {
          setNavMenus((prev) => ({ ...prev, footer: data.data.items }));
        }
      })
      .catch(() => { });

    fetch('/api/navigation/main')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.data?.items)) {
          setNavMenus((prev) => ({ ...prev, main: data.data.items }));
        }
      })
      .catch(() => { });
  }, []);

  // Dynamically fetch other custom menus if defined in columns
  useEffect(() => {
    if (!footerConfig?.columns) return;
    
    const menuTypesToFetch = [];
    footerConfig.columns.forEach((col) => {
      if (col.type === 'links' && col.sourceType === 'navigation' && col.menuType) {
        menuTypesToFetch.push(col.menuType);
      }
    });

    menuTypesToFetch.forEach((type) => {
      fetch(`/api/navigation/${type}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.success && Array.isArray(data.data?.items)) {
            setNavMenus((prev) => ({ ...prev, [type]: data.data.items }));
          }
        })
        .catch(() => { });
    });
  }, [footerConfig]);

  // Extract the first 'logo_desc' column for the Brand Card (with fallbacks)
  const brandColumn = useMemo(() => {
    return footerConfig?.columns?.find(c => c.type === 'logo_desc') || {
      type: 'logo_desc',
      title: 'About Us',
      logoUrl: '/images/Logo-web.png',
      description: 'Empowering individuals with reliable, medically verified guides to navigate daily physical and emotional health. Your trusted companion on the journey to holistic wellness.'
    };
  }, [footerConfig]);

  // Remaining columns are displayed on the right link grid (up to 3 columns)
  const remainingColumns = useMemo(() => {
    if (!footerConfig?.columns) {
      // Default fallback layout
      return [
        {
          type: 'logo_desc',
          title: 'ISSN',
          logoUrl: '/images/ISSN_BARCODE.png'
        },
        {
          type: 'links',
          title: 'Company',
          sourceType: 'navigation',
          menuType: 'footer'
        },
        {
          type: 'links',
          title: 'Legal',
          links: [
            { label: 'Privacy Policy', url: '/info?tab=legal&doc=privacy' },
            { label: 'Terms of Service', url: '/info?tab=legal&doc=terms' },
            { label: 'Medical Disclaimer', url: '/info?tab=legal&doc=disclaimer' }
          ]
        }
      ];
    }

    // Filter out the first logo_desc column (used for the left brand card)
    let foundLogoDesc = false;
    return footerConfig.columns.filter((c) => {
      if (c.type === 'logo_desc' && !foundLogoDesc) {
        foundLogoDesc = true;
        return false;
      }
      return true;
    });
  }, [footerConfig]);

  return (
    <footer className="footer bg-cyan-900 text-white relative overflow-hidden rounded-t-[48px] border-t border-white/5 pt-24 pb-12 mt-[-48px] z-10 font-sans">
      {/* Top Accent Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-accent/30 to-transparent pointer-events-none" />

      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-80 h-80 bg-accent-green/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6 md:px-10">
        <div className="footer-grid grid grid-cols-1 lg:grid-cols-[1.1fr_1.9fr] gap-16 lg:gap-24 pb-16">

          {/* Brand Presentation Card */}
          <div className="footer-brand flex flex-col gap-6 bg-gradient-to-br from-white/[0.12] via-white/[0.03] to-transparent border border-white/10 backdrop-blur-2xl rounded-3xl p-8 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 shadow-[0_10px_40px_rgba(100,100,200,0.05)] hover:shadow-[0_15px_50px_rgba(100,100,200,0.15)]">
            <Link href="/" className="logo-link-footer inline-block self-start transition-all duration-300">
              <img
                src={brandColumn.logoUrl || "/images/Logo-web.png"}
                alt={brandColumn.title || "A Health Place Logo"}
                className="logo-img h-20 w-auto object-contain"
              />
            </Link>
            {brandColumn.description && (
              <p className="footer-tagline text-[14px] text-white/60 leading-relaxed font-body">
                {brandColumn.description}
              </p>
            )}

            {/* Social Icons */}
            <div className="flex gap-4 mt-2">
              {[
                { icon: 'instagram', link: 'https://www.instagram.com/ahealthplace/', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                { icon: 'facebook', link: 'https://www.facebook.com/ahealthplace', path: 'M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z' },
                { icon: 'linkedin', link: 'https://www.linkedin.com/company/a-health-place/', path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' },
                { icon: 'youtube', link: 'https://www.youtube.com/@ahealthplace', path: 'M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
                { icon: 'pinterest', link: 'https://uk.pinterest.com/ahealthyplace/_saved', path: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.624 0 12.017 0z' }
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
            {remainingColumns.map((col, idx) => (
              <div key={idx} className="footer-col">
                <h4 className="footer-title font-heading text-lg font-semibold text-teal-300 mb-6">
                  {col.title || "Block"}
                </h4>

                {col.type === "logo_desc" && (
                  <div className="flex flex-col gap-4">
                    {col.logoUrl && (
                      <div className="bg-white p-3 rounded-xl inline-block self-start shadow-sm border border-white/20">
                        <img
                          src={col.logoUrl}
                          alt={col.title || "Logo"}
                          className="object-contain max-h-16 w-auto"
                        />
                      </div>
                    )}
                    {col.description && (
                      <p className="text-sm text-white/60 leading-relaxed font-body">
                        {col.description}
                      </p>
                    )}
                  </div>
                )}

                {col.type === "links" && (
                  <ul className="footer-links list-none flex flex-col gap-3.5 pl-0">
                    {(col.sourceType === "navigation"
                      ? navMenus[col.menuType || "footer"] || []
                      : col.links || []
                    ).map((linkItem, linkIdx) => (
                      <li key={linkIdx}>
                        <Link
                          href={linkItem.url || "#"}
                          className="footer-link text-sm text-white/85 no-underline transition-all duration-300 hover:text-teal-300 hover:pl-2 flex items-center group font-body"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-300 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                          {linkItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {col.type === "contact" && (
                  <div className="flex flex-col gap-3.5">
                    {col.phone && (
                      <a
                        href={`tel:${col.phone}`}
                        className="footer-link text-sm text-white/85 no-underline transition-all duration-300 hover:text-teal-300 flex items-center group font-body"
                      >
                        <span className="mr-2">📞</span>
                        {col.phone}
                      </a>
                    )}
                    {col.email && (
                      <a
                        href={`mailto:${col.email}`}
                        className="footer-link text-sm text-white/85 no-underline transition-all duration-300 hover:text-teal-300 flex items-center group font-body"
                      >
                        <span className="mr-2">✉️</span>
                        {col.email}
                      </a>
                    )}
                    {col.address && (
                      <div className="text-sm text-white/70 flex items-start font-body">
                        <span className="mr-2">📍</span>
                        <span>{col.address}</span>
                      </div>
                    )}
                  </div>
                )}

                {col.type === "newsletter" && (
                  <div className="flex flex-col gap-4 font-body">
                    <form
                      onSubmit={handleNewsletterSubmit}
                      className="flex bg-white/10 rounded-xl p-1 border border-white/20 focus-within:border-teal-300/50 transition"
                    >
                      <input
                        type="email"
                        required
                        placeholder={col.newsletterPlaceholder || "your@email.com"}
                        className="bg-transparent border-none text-sm w-full px-3 text-white placeholder-white/40 outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm px-4.5 py-2 font-bold transition whitespace-nowrap"
                      >
                        {col.newsletterButtonText || "Join"}
                      </button>
                    </form>
                    <p className="text-sm text-white/50 leading-relaxed">
                      Subscribe to receive regular updates.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom flex flex-col sm:flex-row justify-between items-center pt-10 mt-6 gap-6 text-center sm:text-left border-t border-white/5">
          <p className="copyright text-sm text-white/40 leading-relaxed font-body">
            {footerConfig?.copyright || "© 2026 A Health Place. All rights reserved. Professional medical advice should be sought for any health concerns."}
          </p>
          <div className="footer-bottom-links flex gap-6 flex-wrap justify-center sm:justify-end">
            {Array.isArray(navMenus.footer) && navMenus.footer.length > 0 ? (
              navMenus.footer.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.url || '#'}
                  className="footer-bottom-link text-sm text-white/40 no-underline hover:text-teal-300 transition-colors duration-300 font-body"
                >
                  {item.label}
                </Link>
              ))
            ) : (
              <>
                <Link href="/info?tab=legal&doc=privacy" className="footer-bottom-link text-sm text-white/40 no-underline hover:text-teal-300 transition-colors duration-300 font-body">
                  Privacy Policy
                </Link>
                <Link href="/info?tab=legal&doc=terms" className="footer-bottom-link text-sm text-white/40 no-underline hover:text-teal-300 transition-colors duration-300 font-body">
                  Terms & Conditions
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
