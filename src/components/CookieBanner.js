'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Avoid showing on load if user already interacted
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-[9999] animate-slide-up">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="font-heading font-extrabold text-[16px] text-primary mb-1.5 tracking-tight">
            We value your privacy
          </h3>
          <p className="text-[12.5px] text-secondary leading-relaxed">
            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
          </p>
        </div>
        <div className="flex gap-2.5 justify-end mt-1">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-xs font-semibold text-secondary hover:text-primary hover:bg-slate-100/80 rounded-full transition-all cursor-pointer border border-transparent active:scale-[0.98]"
          >
            Reject All
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2 text-xs font-semibold bg-accent text-primary rounded-full hover:shadow-[0_8px_20px_rgba(79,192,195,0.25)] transition-all duration-300 hover:scale-[1.02] cursor-pointer active:scale-[0.98] border border-accent"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
