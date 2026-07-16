'use client';

import React, { useState, useEffect } from 'react';

export default function Marquee() {
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    fetch('/api/header')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.success && data.data?.header?.announcementBar) {
          setAnnouncement(data.data.header.announcementBar);
        }
      })
      .catch(err => console.error("Error loading announcement bar config:", err));
  }, []);

  // Default fallback items if announcement is not loaded yet or disabled
  const defaultItems = [
    { text: 'MIND & SOUL' },
    { text: 'PHYSICAL VITALITY' },
    { text: 'MEDICALLY VETTED' },
    { text: 'HOLISTIC AYURVEDA' },
    { text: 'SCIENCE-BACKED GUIDES' },
    { text: 'SLEEP OPTIMIZATION' },
    { text: 'STRESS RESILIENCE' },
    { text: 'NUTRIENT-DENSE DIETS' },
    { text: 'INTEGRATIVE HEALTH' },
  ];

  const isEnabled = announcement ? announcement.enabled : true;
  if (!isEnabled) return null;

  // Resolve items list: prioritizes announcement.items (which has text & link properties)
  let baseList = [];
  if (announcement && Array.isArray(announcement.items) && announcement.items.length > 0) {
    baseList = announcement.items;
  } else if (announcement) {
    const rawTexts = announcement.texts || announcement.text;
    if (Array.isArray(rawTexts)) {
      baseList = rawTexts.map(t => typeof t === 'string' ? { text: t } : t);
    } else if (typeof rawTexts === 'string' && rawTexts.trim() !== '') {
      baseList = [{ text: rawTexts, link: announcement.link }];
    }
  }

  if (baseList.length === 0) {
    baseList = defaultItems;
  }

  // Pad list dynamically to at least 15 items to ensure content is wider than 100vw for seamless looping
  let filledList = [...baseList];
  while (filledList.length < 15 && baseList.length > 0) {
    filledList = [...filledList, ...baseList];
  }

  const repeatedItems = [...filledList, ...filledList];
  const bgColor = announcement?.bgColor || '#0f7c85';
  const textColor = announcement?.textColor || '#ffffff';

  const renderItem = (item, idx, prefix = '') => {
    const content = (
      <span 
        className="inline-flex items-center mx-6 font-heading text-base md:text-lg tracking-[2px]"
        style={{ color: textColor }}
      >
        <span className="w-2.5 h-2.5 rounded-full mr-4" style={{ backgroundColor: textColor === '#ffffff' ? '#8fe9ec' : textColor }} />
        {item.text}
      </span>
    );

    if (item.link) {
      return (
        <a 
          key={`${prefix}-${idx}`} 
          href={item.link} 
          className="hover:underline inline-block"
          style={{ color: textColor }}
        >
          {content}
        </a>
      );
    }

    return <span key={`${prefix}-${idx}`} className="inline-block">{content}</span>;
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 w-full overflow-hidden whitespace-nowrap py-2 border-b border-white/5 select-none z-[9001] shadow-sm"
      style={{ backgroundColor: bgColor }}
    >
      <div className="inline-block animate-marquee whitespace-nowrap">
        {repeatedItems.map((item, idx) => renderItem(item, idx, 'orig'))}
      </div>
      <div className="inline-block animate-marquee whitespace-nowrap" aria-hidden="true">
        {repeatedItems.map((item, idx) => renderItem(item, idx, 'clone'))}
      </div>
    </div>
  );
}
