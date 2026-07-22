'use client';
import { useEffect } from 'react';

export default function RecentViewTracker({ item }) {
  useEffect(() => {
    if (!item || !item.url) return;
    try {
      const existing = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
      const filtered = existing.filter(i => i.url !== item.url);
      const updated = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, 20); // Keep top 20
      localStorage.setItem('recently_viewed', JSON.stringify(updated));
    } catch (e) {
      console.error('Error tracking recent view:', e);
    }
  }, [JSON.stringify(item)]);
  
  return null;
}
