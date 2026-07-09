'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner({ complianceSettings }) {
  const [isVisible, setIsVisible] = useState(false);

  const isEnabled = complianceSettings?.cookieConsentEnabled !== false;

  useEffect(() => {
    if (!isEnabled) return;
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, [isEnabled]);

  const saveConsent = async (analytics, marketing) => {
    const visitorId =
      localStorage.getItem("visitor_id") ||
      `visitor_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem("visitor_id", visitorId);

    const consentData = {
      essential: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("cookie_consent", JSON.stringify(consentData));

    const resolvedSiteId = process.env.NEXT_PUBLIC_SITE_ID || "AHP";

    const logCompliance = async (consentType, accepted) => {
      try {
        await fetch("/api/compliance/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            siteId: resolvedSiteId,
            visitorId,
            consentType,
            accepted,
          }),
        });
      } catch (err) {
        console.error("Failed to log compliance consent:", err);
      }
    };

    const logVisitor = async () => {
      try {
        await fetch("/api/visitors/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId,
            accepted: analytics && marketing,
            analytics,
            marketing,
          }),
        });
      } catch (err) {
        console.error("Failed to log visitor consent:", err);
      }
    };

    await Promise.all([
      logCompliance("essential", true),
      logCompliance("analytics", analytics),
      logCompliance("marketing", marketing),
      logVisitor(),
    ]);

    window.dispatchEvent(new Event("cookieConsentChanged"));
    setIsVisible(false);
  };

  const handleAccept = () => {
    saveConsent(true, true);
  };

  const handleDecline = () => {
    saveConsent(false, false);
  };

  if (!isEnabled || !isVisible) return null;

  const cookieText = complianceSettings?.cookieText || "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.";
  const acceptText = complianceSettings?.cookieButtonText || "Accept All";
  const declineText = complianceSettings?.cookieDeclineButtonText || "Reject All";
  const privacyLink = complianceSettings?.cookiePrivacyLink || "/info?tab=legal&doc=privacy";

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-[9999] animate-slide-up">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="font-heading font-extrabold text-[16px] text-primary mb-1.5 tracking-tight">
            We value your privacy
          </h3>
          <p className="text-[12.5px] text-secondary leading-relaxed">
            {cookieText}
            {complianceSettings?.cookiePrivacyLink && (
              <span className="block mt-1">
                Read our <a href={privacyLink} className="underline text-accent hover:opacity-85 font-semibold">Cookie Policy</a>.
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2.5 justify-end mt-1">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-xs font-semibold text-secondary hover:text-primary hover:bg-slate-100/80 rounded-full transition-all cursor-pointer border border-transparent active:scale-[0.98]"
          >
            {declineText}
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2 text-xs font-semibold bg-accent text-primary rounded-full hover:shadow-[0_8px_20px_rgba(79,192,195,0.25)] transition-all duration-300 hover:scale-[1.02] cursor-pointer active:scale-[0.98] border border-accent"
          >
            {acceptText}
          </button>
        </div>
      </div>
    </div>
  );
}
