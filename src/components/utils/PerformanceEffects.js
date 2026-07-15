"use client";

import { useEffect } from "react";

export default function PerformanceEffects({ lazyLoadImages, lazyLoadVideos }) {
  useEffect(() => {
    const applyLazyLoading = () => {
      if (lazyLoadImages) {
        document.querySelectorAll("img:not([loading])").forEach((img) => {
          img.setAttribute("loading", "lazy");
        });
      }
      if (lazyLoadVideos) {
        document.querySelectorAll("video:not([preload])").forEach((video) => {
          video.setAttribute("preload", "none");
        });
      }
    };

    // Apply initially
    applyLazyLoading();

    // Use MutationObserver for dynamically added elements (e.g. Next.js navigation)
    const observer = new MutationObserver((mutations) => {
      let shouldApply = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldApply = true;
          break;
        }
      }
      if (shouldApply) applyLazyLoading();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [lazyLoadImages, lazyLoadVideos]);

  return null;
}
