"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import Button from "@/components/Button";

const DEFAULT_BANNER_CONFIG = {
  badgeText: "PR & EDITORIAL PLACEMENTS",
  title: "Want to get featured in AHealthPlace?",
  description: "Unlock authority status and reach our highly engaged, health-conscious readers. Align your expertise with a publication vetted by a medical review board.",
  benefits: [
    "Digital Cover Placements",
    "Professionally Written Q&As",
    "High-Domain SEO Backlinks",
    "Magazine Spread Ad Spots"
  ],
  buttonText: "Explore Media Packages",
  buttonLink: "/services",
  bgCoverImage: "/images/mag_strength.png",
  fgCoverImage: "/images/mag_sleep.png"
};

export default function ServicesBanner() {
  const [config, setConfig] = useState(DEFAULT_BANNER_CONFIG);

  useEffect(() => {
    async function loadBannerConfig() {
      try {
        const siteId = (typeof window !== "undefined" && localStorage.getItem("x-site-id")) || process.env.NEXT_PUBLIC_SITE_ID || "AHP";
        const res = await fetch("/api/services/banner-config", {
          headers: { "x-site-id": siteId }
        });
        const data = await res.json();
        if (data.success && data.data?.bannerConfig) {
          setConfig(data.data.bannerConfig);
        }
      } catch (err) {
        console.error("Failed to load dynamic ServicesBanner config:", err);
      }
    }
    loadBannerConfig();
  }, []);

  return (
    <section className="services-banner-section py-16 bg-bg-light relative overflow-hidden">
      <div className="container">
        {/* Floating Card Container */}
        <div className="relative bg-gradient-to-br from-[#0f4c4e] to-[#176265] rounded-[36px] overflow-hidden shadow-[0_24px_50px_rgba(15,76,78,0.15)] border border-white/10 p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row gap-12 items-center justify-between">

          {/* Decorative Backdrop Blobs */}
          <div className="absolute w-[300px] h-[300px] rounded-full bg-accent/20 blur-3xl -top-12 -left-12 pointer-events-none" />
          <div className="absolute w-[200px] h-[200px] rounded-full bg-accent-green/20 blur-2xl -bottom-10 -right-10 pointer-events-none" />

          {/* Left: Info Copy */}
          <div className="flex flex-col gap-6 max-w-[560px] relative z-10 text-left">
            <span className="inline-flex items-center gap-1.5 bg-accent/15 border border-accent/20 text-white px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-[2px] w-fit select-none">
              <Sparkles size={11} className="shrink-0" /> {config.badgeText || "PR & EDITORIAL PLACEMENTS"}
            </span>

            <h2 className="main-heading text-white mb-4">
              Want to get featured in AHealthPlace?
            </h2>

            <p className="description text-white/80">
              Unlock authority status and reach our highly engaged, health-conscious readers. Align your expertise with a publication vetted by a medical review board.
            </p>

            {/* Checkmark List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-4 mt-2">
              {(config.benefits || []).map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-white/90">
                  <CheckCircle2 size={15} className="text-accent shrink-0" />
                  <span className="text-[12.5px] font-semibold tracking-wide">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="mt-4">
              <Button
                href={config.buttonLink || "/services"}
                variant="primary"
                className="hover:!bg-white hover:!text-primary !text-xs !py-3.5 !px-7 font-bold inline-flex items-center gap-2"
              >
                {config.buttonText || "Explore Media Packages"} <ArrowRight size={13} />
              </Button>
            </div>
          </div>

          {/* Right: Overlapping Cover Images Stack */}
          <div className="relative w-full max-w-[340px] aspect-[4/3] shrink-0 z-10 select-none hidden md:block">

            {/* Background card (Back Cover) */}
            <div className="absolute w-[200px] h-[260px] rounded-2xl overflow-hidden shadow-md border border-white/10 top-0 left-4 -rotate-6 transition-transform duration-500 hover:-rotate-12 cursor-pointer">
              <Image
                src={config.bgCoverImage || "/images/mag_strength.png"}
                alt="Back Cover Preview"
                fill
                className="object-cover"
                sizes="200px"
              />
            </div>

            {/* Foreground card (Front Cover) */}
            <div className="absolute w-[210px] h-[270px] rounded-2xl overflow-hidden shadow-2xl border border-white/20 top-4 right-4 rotate-6 transition-transform duration-500 hover:rotate-12 cursor-pointer">
              <Image
                src={config.fgCoverImage || "/images/mag_sleep.png"}
                alt="Front Cover Preview"
                fill
                className="object-cover"
                sizes="210px"
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
