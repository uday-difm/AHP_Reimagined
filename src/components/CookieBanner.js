'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner({ complianceSettings }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  const isEnabled = complianceSettings?.cookieConsentEnabled !== false;

  const [analyticsChecked, setAnalyticsChecked] = useState(true);
  const [marketingChecked, setMarketingChecked] = useState(true);

  useEffect(() => {
    if (!isEnabled) return;
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    } else {
      try {
        const parsed = JSON.parse(consent);
        setAnalyticsChecked(parsed.analytics ?? true);
        setMarketingChecked(parsed.marketing ?? true);
      } catch (e) {
        // Fallback
      }
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

  const handleSavePreferences = () => {
    saveConsent(analyticsChecked, marketingChecked);
  };

  if (!isEnabled || !isVisible) return null;

  const cookieText = complianceSettings?.cookieText || "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.";
  const acceptText = complianceSettings?.cookieButtonText || "Accept All";
  const declineText = complianceSettings?.cookieDeclineButtonText || "Reject All";
  const settingsText = complianceSettings?.settingsButtonText || "Preferences";
  const privacyLink = complianceSettings?.cookiePrivacyLink || "/info?tab=legal&doc=privacy";

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-[9999] animate-slide-up">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="font-heading font-extrabold text-[16px] text-primary mb-1.5 tracking-tight">
            We value your privacy
          </h3>
          
          {!showPreferences ? (
            <p className="text-[12.5px] text-secondary leading-relaxed">
              {cookieText}
              {complianceSettings?.cookiePrivacyLink && (
                <span className="block mt-1">
                  Read our <a href={privacyLink} className="underline text-accent hover:opacity-85 font-semibold">Cookie Policy</a>.
                </span>
              )}
            </p>
          ) : (
            <div className="flex flex-col gap-3 my-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Essential Cookies</h4>
                  <p className="text-[10px] text-slate-500">Required for the website to function properly. Cannot be disabled.</p>
                </div>
                <input type="checkbox" checked disabled className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent accent-accent mt-0.5" />
              </div>
              <div className="h-[1px] bg-slate-200/60" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Analytics & Performance</h4>
                  <p className="text-[10px] text-slate-500">Helps us understand how visitors interact with the site to improve user experience.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={analyticsChecked} 
                  onChange={(e) => setAnalyticsChecked(e.target.checked)} 
                  className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent accent-accent mt-0.5 cursor-pointer" 
                />
              </div>
              <div className="h-[1px] bg-slate-200/60" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Marketing & Advertising</h4>
                  <p className="text-[10px] text-slate-500">Used to deliver personalized ads and content based on your interests.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={marketingChecked} 
                  onChange={(e) => setMarketingChecked(e.target.checked)} 
                  className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent accent-accent mt-0.5 cursor-pointer" 
                />
              </div>
            </div>
          )}
        </div>

        {!showPreferences ? (
          <div className="flex gap-2 justify-between items-center mt-1">
            <button
              onClick={() => setShowPreferences(true)}
              className="text-xs font-semibold text-accent hover:underline cursor-pointer py-2"
            >
              {settingsText}
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-xs font-semibold text-secondary hover:text-primary hover:bg-slate-100/80 rounded-full transition-all cursor-pointer border border-transparent active:scale-[0.98]"
              >
                {declineText}
              </button>
              <button
                onClick={handleAccept}
                className="px-5 py-2 text-xs font-semibold bg-accent text-white rounded-full hover:bg-[#0c646b] hover:border-[#0c646b] hover:shadow-[0_8px_20px_rgba(15,124,133,0.25)] transition-all duration-300 hover:scale-[1.02] cursor-pointer active:scale-[0.98] border border-accent"
              >
                {acceptText}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 justify-between items-center mt-1">
            <button
              onClick={() => setShowPreferences(false)}
              className="px-4 py-2 text-xs font-semibold text-secondary hover:text-primary hover:bg-slate-100/80 rounded-full transition-all cursor-pointer border border-transparent active:scale-[0.98]"
            >
              Back
            </button>
            <button
              onClick={handleSavePreferences}
              className="px-5 py-2 text-xs font-semibold bg-accent text-white rounded-full hover:bg-[#0c646b] hover:border-[#0c646b] hover:shadow-[0_8px_20px_rgba(15,124,133,0.25)] transition-all duration-300 hover:scale-[1.02] cursor-pointer active:scale-[0.98] border border-accent"
            >
              Save Choices
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
