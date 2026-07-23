"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, MessageCircle, Phone, Mail, HelpCircle, Info, MapPin, Share2, MessageSquare } from "lucide-react";


const getIcon = (iconName) => {
  const icons = {
    "message-circle": MessageCircle,
    "message-square": MessageSquare,
    phone: Phone,
    mail: Mail,
    help: HelpCircle,
    info: Info,
    map: MapPin,
    share: Share2,
    sparkles: Sparkles,
  };
  const IconComponent = icons[iconName?.toLowerCase()] || Sparkles;

  if (iconName && (iconName.startsWith("http") || iconName.startsWith("/"))) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={iconName} alt="icon" className="w-5 h-5 shrink-0 object-contain" />;
  }

  return <IconComponent className="w-4 h-4 shrink-0" />;
};

export default function GlobalPopup({ ctaConfig }) {
  const [activePopups, setActivePopups] = useState([]);

  useEffect(() => {
    if (!ctaConfig?.popups || !Array.isArray(ctaConfig.popups)) return;

    const storedClosed = JSON.parse(localStorage.getItem("closedPopups") || "[]");
    const timeouts = [];

    const handleExitIntent = (e) => {
      if (e.clientY <= 0) {
        ctaConfig.popups.forEach((popup) => {
          if (popup.triggerOn === "exit-intent") {
            if (popup.showOnce && storedClosed.includes(popup.id)) return;
            setActivePopups((prev) => {
              if (prev.find((p) => p.id === popup.id)) return prev;
              return [...prev, popup];
            });
          }
        });
      }
    };

    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      ctaConfig.popups.forEach((popup) => {
        if (popup.triggerOn === "scroll") {
          const triggerVal = parseInt(popup.triggerValue) || 50;
          if (scrollPercent >= triggerVal) {
            if (popup.showOnce && storedClosed.includes(popup.id)) return;
            setActivePopups((prev) => {
              if (prev.find((p) => p.id === popup.id)) return prev;
              return [...prev, popup];
            });
          }
        }
      });
    };

    ctaConfig.popups.forEach((popup) => {
      if (popup.showOnce && storedClosed.includes(popup.id)) return;

      if (popup.triggerOn === "page-load" || popup.triggerOn === "0") {
        setActivePopups((prev) => [...prev, popup]);
      } else if (popup.triggerOn === "delay") {
        const delayMs = (parseInt(popup.triggerValue) || 3) * 1000;
        const t = setTimeout(() => {
          setActivePopups((prev) => {
            if (prev.find((p) => p.id === popup.id)) return prev;
            return [...prev, popup];
          });
        }, delayMs);
        timeouts.push(t);
      }
    });

    document.addEventListener("mouseleave", handleExitIntent);
    document.addEventListener("scroll", handleScroll);

    return () => {
      timeouts.forEach(clearTimeout);
      document.removeEventListener("mouseleave", handleExitIntent);
      document.removeEventListener("scroll", handleScroll);
    };
  }, [ctaConfig]);

  const handleClosePopup = (popupId, showOnce) => {
    setActivePopups((prev) => prev.filter((p) => p.id !== popupId));
    if (showOnce) {
      const storedClosed = JSON.parse(localStorage.getItem("closedPopups") || "[]");
      if (!storedClosed.includes(popupId)) {
        storedClosed.push(popupId);
        localStorage.setItem("closedPopups", JSON.stringify(storedClosed));
      }
    }
  };

  if (!ctaConfig) return null;

  const { floatingButtons } = ctaConfig;

  return (
    <>
      {/* Floating Buttons */}
      {floatingButtons?.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[90] flex flex-col gap-3 items-end">
          {floatingButtons.filter((btn) => btn.enabled !== false).map((btn) => (
            <a
              key={btn.id}
              href={btn.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 transition-all"
              style={{ backgroundColor: btn.color || "#1e293b", color: btn.textColor || "#ffffff" }}
            >
              {getIcon(btn.icon)}
              {btn.label}
            </a>
          ))}
        </div>
      )}

      {/* Popups */}
      {activePopups.map((popup) => (
        <div
          key={popup.id}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden animate-in zoom-in-95 duration-300">
            <button
              onClick={() => handleClosePopup(popup.id, popup.showOnce)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            {popup.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={popup.imageUrl} alt={popup.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-10 text-center space-y-4">
              <h3 className="card-title text-slate-900">{popup.title}</h3>
              <p className="description text-slate-500">{popup.body}</p>
              {popup.buttonText && popup.buttonLink && (
                <div className="pt-6">
                  <a
                    href={popup.buttonLink}
                    onClick={() => handleClosePopup(popup.id, popup.showOnce)}
                    className="inline-block w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-lg"
                  >
                    {popup.buttonText}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
