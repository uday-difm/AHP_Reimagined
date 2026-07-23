"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Image as ImageIcon, Save, RefreshCw, CheckCircle2 } from "lucide-react";
import MediaPickerModal from "@/components/media/MediaPickerModal";

export default function ServicesBannerEditorModal({ siteId, isOpen, onClose, onSaveSuccess }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const [activeMediaTarget, setActiveMediaTarget] = useState(null); // 'bg' | 'fg' | null

  const [form, setForm] = useState({
    badgeText: "PR & EDITORIAL PLACEMENTS",
    title: "Want to get featured in AHealthPlace?",
    description: "Unlock authority status and reach our highly engaged, health-conscious readers. Align your expertise with a publication vetted by a medical review board.",
    benefit1: "Digital Cover Placements",
    benefit2: "Professionally Written Q&As",
    benefit3: "High-Domain SEO Backlinks",
    benefit4: "Magazine Spread Ad Spots",
    buttonText: "Explore Media Packages",
    buttonLink: "/services",
    bgCoverImage: "/images/mag_strength.png",
    fgCoverImage: "/images/mag_sleep.png",
  });

  useEffect(() => {
    if (!isOpen) return;
    async function loadConfig() {
      setLoading(true);
      try {
        const res = await fetch("/api/dashboard/services/banner-config", {
          headers: { "x-site-id": siteId }
        });
        const data = await res.json();
        if (data.success && data.data?.bannerConfig) {
          const c = data.data.bannerConfig;
          setForm({
            badgeText: c.badgeText || "PR & EDITORIAL PLACEMENTS",
            title: c.title || "Want to get featured in AHealthPlace?",
            description: c.description || "",
            benefit1: c.benefits?.[0] || "Digital Cover Placements",
            benefit2: c.benefits?.[1] || "Professionally Written Q&As",
            benefit3: c.benefits?.[2] || "High-Domain SEO Backlinks",
            benefit4: c.benefits?.[3] || "Magazine Spread Ad Spots",
            buttonText: c.buttonText || "Explore Media Packages",
            buttonLink: c.buttonLink || "/services",
            bgCoverImage: c.bgCoverImage || "/images/mag_strength.png",
            fgCoverImage: c.fgCoverImage || "/images/mag_sleep.png",
          });
        }
      } catch (err) {
        console.error("Error loading services banner config:", err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, [isOpen, siteId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        badgeText: form.badgeText,
        title: form.title,
        description: form.description,
        benefits: [form.benefit1, form.benefit2, form.benefit3, form.benefit4],
        buttonText: form.buttonText,
        buttonLink: form.buttonLink,
        bgCoverImage: form.bgCoverImage,
        fgCoverImage: form.fgCoverImage,
      };

      const res = await fetch("/api/dashboard/services/banner-config", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-site-id": siteId },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: "PR & Editorial Services Banner updated live!" });
        if (onSaveSuccess) onSaveSuccess();
        setTimeout(() => onClose(), 1200);
      } else {
        setMsg({ type: "error", text: data.error || "Failed to update banner" });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Error saving banner configuration" });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0f7c85] flex items-center justify-center font-bold">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Customize PR &amp; Editorial Services Banner Card
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Update the badge, title, description, benefits, CTAs, and cover images live on your website.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl">
            <X size={18} />
          </button>
        </div>

        {/* Message */}
        {msg && (
          <div className={`px-6 py-3 text-xs font-bold flex items-center gap-2 ${
            msg.type === "error" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
          }`}>
            <CheckCircle2 size={16} /> {msg.text}
          </div>
        )}

        {/* Body */}
        {loading ? (
          <div className="p-16 text-center text-xs font-bold text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw size={18} className="animate-spin text-[#0f7c85]" /> Loading services banner content...
          </div>
        ) : (
          <form id="banner-config-form" onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
            {/* Header copy */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-[#0f7c85] uppercase tracking-wider">Card Copy &amp; Heading</h4>
              
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Badge Pill Subtitle</label>
                <input
                  type="text"
                  required
                  value={form.badgeText}
                  onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
                  placeholder="e.g. PR & EDITORIAL PLACEMENTS"
                  className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs dark:bg-slate-800 outline-none focus:border-[#0f7c85]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Main Card Heading</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Want to get featured in AHealthPlace?"
                  className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs dark:bg-slate-800 outline-none focus:border-[#0f7c85]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Card Description Paragraph</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Card description text..."
                  className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs dark:bg-slate-800 outline-none focus:border-[#0f7c85]"
                />
              </div>
            </div>

            {/* Checkmark List Benefits */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-extrabold text-[#0f7c85] uppercase tracking-wider">4 Checklist Benefits</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Benefit #1</label>
                  <input
                    type="text"
                    value={form.benefit1}
                    onChange={(e) => setForm({ ...form, benefit1: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Benefit #2</label>
                  <input
                    type="text"
                    value={form.benefit2}
                    onChange={(e) => setForm({ ...form, benefit2: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Benefit #3</label>
                  <input
                    type="text"
                    value={form.benefit3}
                    onChange={(e) => setForm({ ...form, benefit3: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Benefit #4</label>
                  <input
                    type="text"
                    value={form.benefit4}
                    onChange={(e) => setForm({ ...form, benefit4: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-extrabold text-[#0f7c85] uppercase tracking-wider">CTA Button</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={form.buttonText}
                    onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                    className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Button Link</label>
                  <input
                    type="text"
                    value={form.buttonLink}
                    onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
                    className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Cover Images Stack */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-extrabold text-[#0f7c85] uppercase tracking-wider">Cover Images Stack</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">Back Cover Image</label>
                    <button
                      type="button"
                      onClick={() => setActiveMediaTarget('bg')}
                      className="text-[10px] font-bold text-[#0f7c85] hover:underline cursor-pointer"
                    >
                      Choose from Library
                    </button>
                  </div>
                  <input
                    type="text"
                    value={form.bgCoverImage}
                    onChange={(e) => setForm({ ...form, bgCoverImage: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-800 outline-none"
                  />
                  {form.bgCoverImage && (
                    <div className="w-full h-24 rounded-xl overflow-hidden border border-slate-200 relative">
                      <img src={form.bgCoverImage} alt="Back Cover" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">Front Cover Image</label>
                    <button
                      type="button"
                      onClick={() => setActiveMediaTarget('fg')}
                      className="text-[10px] font-bold text-[#0f7c85] hover:underline cursor-pointer"
                    >
                      Choose from Library
                    </button>
                  </div>
                  <input
                    type="text"
                    value={form.fgCoverImage}
                    onChange={(e) => setForm({ ...form, fgCoverImage: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-800 outline-none"
                  />
                  {form.fgCoverImage && (
                    <div className="w-full h-24 rounded-xl overflow-hidden border border-slate-200 relative">
                      <img src={form.fgCoverImage} alt="Front Cover" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-500 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            form="banner-config-form"
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-xs font-extrabold bg-[#0f7c85] hover:bg-[#0c6b73] text-white rounded-2xl disabled:opacity-50 transition shadow-lg shadow-[#0f7c85]/20 flex items-center gap-2 cursor-pointer"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving Changes..." : "Save Card Customization"}
          </button>
        </div>
      </div>

      {/* Media Picker Modal */}
      {activeMediaTarget && (
        <MediaPickerModal
          isOpen={Boolean(activeMediaTarget)}
          siteId={siteId}
          onClose={() => setActiveMediaTarget(null)}
          onSelect={(media) => {
            if (activeMediaTarget === "bg") setForm((prev) => ({ ...prev, bgCoverImage: media.url }));
            if (activeMediaTarget === "fg") setForm((prev) => ({ ...prev, fgCoverImage: media.url }));
            setActiveMediaTarget(null);
          }}
          title="Select Cover Graphic Image"
        />
      )}
    </div>
  );
}
