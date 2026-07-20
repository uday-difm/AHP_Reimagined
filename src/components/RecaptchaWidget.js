"use client";

import { useEffect, useState } from "react";

export default function RecaptchaWidget() {
  const [siteKey, setSiteKey] = useState("");

  useEffect(() => {
    // Extract site key from global meta tag
    const metaTag = document.querySelector('meta[name="recaptcha-site-key"]');
    const key = metaTag ? metaTag.getAttribute("content") : "";
    
    if (key) {
      setSiteKey(key);
      // Inject Google reCAPTCHA script if not already present
      if (!document.querySelector('script[src="https://www.google.com/recaptcha/api.js"]')) {
        const script = document.createElement("script");
        script.src = "https://www.google.com/recaptcha/api.js";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  if (!siteKey) return null;

  return (
    <div className="mb-4 w-full flex justify-center sm:justify-start">
      <div className="g-recaptcha" data-sitekey={siteKey}></div>
    </div>
  );
}
