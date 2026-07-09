'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal-text, .reveal-slide, .reveal-scale, .reveal-fade');

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

    revealElements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
