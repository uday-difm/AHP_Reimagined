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
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    });

    const observeElements = () => {
      const revealElements = document.querySelectorAll('.reveal-text:not(.reveal-observed), .reveal-slide:not(.reveal-observed), .reveal-scale:not(.reveal-observed), .reveal-fade:not(.reveal-observed)');
      revealElements.forEach(el => {
        el.classList.add('reveal-observed');
        observer.observe(el);
      });
    };

    // Initial observation
    observeElements();

    // Watch for dynamically added elements (like ArticlesGrid)
    const mutationObserver = new MutationObserver((mutations) => {
      let shouldObserve = false;
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) shouldObserve = true;
      });
      if (shouldObserve) observeElements();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
