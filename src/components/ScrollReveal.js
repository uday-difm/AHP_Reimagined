'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    const revealCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(revealCallback, {
      root: null,
      threshold: 0.05,
      rootMargin: '0px 0px 50px 0px',
    });

    const observeElements = () => {
      const revealElements = document.querySelectorAll(
        '.reveal-text, .reveal-slide, .reveal-scale, .reveal-fade'
      );
      revealElements.forEach(el => {
        // If already in viewport on load, activate immediately
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
          el.classList.add('reveal-active');
        } else {
          observer.observe(el);
        }
      });
    };

    // Initial observation
    observeElements();

    // Failsafe: activate any remaining elements after 1.2s to prevent blank sections
    const failsafeTimer = setTimeout(() => {
      document.querySelectorAll('.reveal-text, .reveal-slide, .reveal-scale, .reveal-fade').forEach(el => {
        el.classList.add('reveal-active');
      });
    }, 1200);

    // Watch for dynamically added elements
    const mutationObserver = new MutationObserver((mutations) => {
      let shouldObserve = false;
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) shouldObserve = true;
      });
      if (shouldObserve) observeElements();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(failsafeTimer);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
