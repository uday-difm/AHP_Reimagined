'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Button from '@/components/Button';

export default function CommunityEvents() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [toast, setToast] = useState(null);
  const [reserveForm, setReserveForm] = useState({
    name: '',
    email: '',
    phone: '',
    seats: 1
  });

  const [config, setConfig] = useState({
    forceComingSoon: false,
    comingSoonTitle: "Community & Events Coming Soon",
    comingSoonDesc: "We are preparing our next round of group nature walks, online yoga sessions, and wellness seminars. Check back soon for new dates!",
    subtitle: "COMMUNITY CONNECTION",
    title: "Our Community & Events",
    description: "We host regular group nature walks, online yoga sessions, and stress management seminars created by wellness experts to keep you connected and inspired.",
    features: [
      { title: "Nature Walks", sub: "Reconnect", icon: "sun" },
      { title: "Yoga Sessions", sub: "Strengthen", icon: "user" },
      { title: "Wellness Talks", sub: "Learn", icon: "globe" },
      { title: "Community", sub: "Support", icon: "users" }
    ],
    communityBox: {
      title: "Our Community",
      badgeText: "+ More Members",
      description: "Join a growing community focused on wellness, mindfulness and healthy living."
    },
    testimonialBox: {
      quote: "Being part of these sessions has helped me stay more mindful, active and positive.",
      author: "— A COMMUNITY MEMBER"
    },
    ctaButtons: {
      primaryText: "Join Community",
      primaryLink: "/register",
      secondaryText: "Explore All Events",
      secondaryLink: "/events"
    }
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    async function fetchFeaturedEvent() {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.data?.event) {
              setEvent(data.data.event);
            } else {
              setEvent(null);
            }
            if (data.data?.communityConfig) {
              setConfig(prev => ({ ...prev, ...data.data.communityConfig }));
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch dynamic event:", e);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }
    fetchFeaturedEvent();
  }, []);

  const handleBookmarkToggle = () => {
    const next = !bookmarked;
    setBookmarked(next);
    showToast(next ? '⭐ Event saved to your bookmarks!' : 'Event removed from bookmarks');
  };

  const handleReserveSubmit = async (e) => {
    e.preventDefault();
    if (!reserveForm.name || !reserveForm.email) {
      showToast('Name and Email are required', 'error');
      return;
    }
    setReserving(true);
    try {
      const res = await fetch('/api/events/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event?.id,
          ...reserveForm
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('🎉 Your spot has been reserved!');
        if (data.data?.event) {
          setEvent(data.data.event);
        }
        setReserveModalOpen(false);
        setReserveForm({ name: '', email: '', phone: '', seats: 1 });
      } else {
        showToast(data.error || 'Failed to reserve spot', 'error');
      }
    } catch (err) {
      showToast('Error submitting reservation', 'error');
    } finally {
      setReserving(false);
    }
  };

  if (loading) return null;

  const isClosed = config.forceComingSoon || !event;

  const tagsList = event?.tags ? event.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const reserved = Number(event?.reservedSeats) || 0;
  const total = Number(event?.totalSeats) || 1;
  const pct = Math.min(Math.round((reserved / Math.max(total, 1)) * 100), 100);

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'user':
        return <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
      case 'globe':
        return <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m-9 9a9 9 0 019-9" /></svg>;
      case 'users':
        return <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
      default:
        return <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
    }
  };

  return (
    <section id="events" className="community-section pt-16 pb-[100px] bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/30 rounded-t-[40px] relative overflow-hidden">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold text-white transition-all flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-rose-600' : 'bg-[#0f7c85]'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Background Decorations */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100/30 blur-[100px] pointer-events-none rounded-full transform -translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-100/20 blur-[80px] pointer-events-none rounded-full transform translate-x-1/3 -translate-y-1/3" />

      <div className="container mx-auto px-4 relative z-10">
        {isClosed ? (
          /* Full Container Width "Community & Events Coming Soon" Banner when Closed */
          <div className="w-full max-w-6xl mx-auto text-center bg-white/90 backdrop-blur-md rounded-[36px] p-10 md:p-16 border border-teal-100/80 shadow-[0_20px_60px_rgba(0,0,0,0.04)] reveal-scale">
            <div className="w-16 h-16 rounded-2xl bg-[#0f7c85]/10 text-[#0f7c85] flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-[11px] font-extrabold tracking-[3px] text-[#0f7c85] uppercase mb-3 block">
              {config.subtitle || "COMMUNITY CONNECTION"}
            </span>
            <h2 className="font-heading font-extrabold text-3xl md:text-5xl text-slate-800 tracking-tight leading-tight mb-4">
              Community &amp; Events Coming Soon
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-8">
              {config.comingSoonDesc || "We are preparing our next round of group nature walks, online yoga sessions, and wellness seminars. Check back soon for new dates!"}
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f7c85]/10 text-[#0f7c85] rounded-full text-xs font-extrabold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#0f7c85] animate-ping" />
              Stay tuned for upcoming event dates &amp; schedules
            </div>
          </div>
        ) : (
          /* Normal 2-column layout when an Event is OPEN & active */
          <div className="community-grid grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-start max-w-6xl mx-auto">
            
            {/* Left Side: Community Info */}
            <div className="community-info flex flex-col items-start reveal-slide">
              <div className="mb-8">
                <span className="text-[11px] font-extrabold tracking-[2px] text-[#0f7c85] uppercase mb-4 block">
                  {config.subtitle || "COMMUNITY CONNECTION"}
                </span>
                <h2 className="font-heading font-extrabold text-4xl md:text-[42px] text-slate-800 tracking-tight leading-[1.1] mb-5">
                  {config.title || "Our Community & Events"}
                </h2>
                <p className="text-slate-600 text-sm md:text-[15px] leading-relaxed max-w-sm">
                  {config.description}
                </p>
              </div>

              {/* Dynamic Features Row */}
              {config.features && config.features.length > 0 && (
                <div className="grid grid-cols-4 gap-4 w-full max-w-md mb-8">
                  {config.features.map((item, i) => (
                    <div key={i} className="flex flex-col items-center text-center gap-1.5">
                      <div className="text-[#0f7c85] bg-[#0f7c85]/5 p-2 rounded-xl mb-1">
                        {renderIcon(item.icon)}
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 leading-tight">{item.title}</span>
                      <span className="text-[9px] font-medium text-slate-500">{item.sub}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Dynamic Our Community Box */}
              {config.communityBox && (
                <div className="bg-[#0f7c85]/5 rounded-2xl p-5 w-full max-w-md mb-4 border border-[#0f7c85]/10">
                  <h4 className="text-[13px] font-extrabold text-[#0f7c85] mb-3">{config.communityBox.title || "Our Community"}</h4>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <div className="flex items-center bg-white/60 p-1.5 pr-3 rounded-full shadow-sm shrink-0">
                      <div className="flex -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 border border-white flex items-center justify-center text-xs z-40">👩</div>
                        <div className="w-7 h-7 rounded-full bg-amber-100 border border-white flex items-center justify-center text-xs z-30">👨</div>
                        <div className="w-7 h-7 rounded-full bg-blue-100 border border-white flex items-center justify-center text-xs z-20">👱‍♀️</div>
                        <div className="w-7 h-7 rounded-full bg-rose-100 border border-white flex items-center justify-center text-xs z-10">👨‍🦱</div>
                      </div>
                      <div className="text-[9px] font-bold text-[#0f7c85] ml-2 leading-tight">
                        {config.communityBox.badgeText || "+ More Members"}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">
                      {config.communityBox.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Dynamic Testimonial Box */}
              {config.testimonialBox && (
                <div className="bg-[#0f7c85]/5 rounded-2xl p-5 w-full max-w-md mb-8 flex gap-4 items-start border border-[#0f7c85]/10">
                  <div className="w-10 h-10 rounded-full bg-[#0f7c85]/10 text-[#0f7c85] flex items-center justify-center shrink-0 font-serif text-3xl leading-none pt-2">“</div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed mb-2">
                      {config.testimonialBox.quote}
                    </p>
                    <span className="text-[11px] font-bold text-[#0f7c85] uppercase tracking-wider">{config.testimonialBox.author}</span>
                  </div>
                </div>
              )}

              {/* Dynamic CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <Button href={config.ctaButtons?.primaryLink || "/register"} variant="primary" className="!rounded-xl !px-6 !py-3 !text-[13px] !font-bold shadow-lg shadow-[#0f7c85]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  {config.ctaButtons?.primaryText || "Join Community"}
                </Button>
                <Button href={config.ctaButtons?.secondaryLink || "/events"} variant="outline" className="!rounded-xl !px-6 !py-3 !text-[13px] !font-bold !border-slate-300 !text-slate-600 hover:!bg-slate-50 transition-all flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {config.ctaButtons?.secondaryText || "Explore All Events"}
                </Button>
              </div>
            </div>

            {/* Right Side: Active Featured Event Card Column */}
            <div className="community-featured reveal-scale relative z-10 w-full h-full flex flex-col">
              <div className="bg-[#ffffff] rounded-[32px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-slate-100 flex-1 flex flex-col justify-between">
                <div>
                  {/* Image Area */}
                  {event.imageUrl && (
                    <div className="relative h-[280px] w-full overflow-hidden p-3">
                      <div className="relative w-full h-full rounded-[24px] overflow-hidden">
                        <Image
                          src={event.imageUrl}
                          alt={event.title || "Featured Event"}
                          fill
                          className="object-cover"
                          sizes="(max-width: 900px) 100vw, 50vw"
                          unoptimized={true}
                        />
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute top-4 left-4 bg-[#0f7c85]/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider flex items-center gap-1.5 shadow-sm">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                          FEATURED EVENT
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-8 pt-4">
                    {event.category && (
                      <span className="text-[11px] font-bold tracking-wider text-[#0f7c85] uppercase mb-2 block">{event.category}</span>
                    )}
                    <h3 className="font-heading font-extrabold text-[22px] text-slate-800 leading-tight mb-3">{event.title}</h3>
                    {event.description && (
                      <p className="text-[13px] font-medium text-slate-500 leading-relaxed mb-5">
                        {event.description}
                      </p>
                    )}

                    {/* Event Tags */}
                    {tagsList.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {tagsList.map((tag, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[11px] font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="h-px w-full bg-slate-100 mb-5" />

                    {/* Info Row */}
                    <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-2 text-[12px] font-semibold text-slate-600 mb-5">
                      {event.eventDate && (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {event.eventDate}
                        </div>
                      )}
                      {event.eventTime && (
                        <>
                          <div className="w-px h-4 bg-slate-200 hidden sm:block" />
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {event.eventTime}
                          </div>
                        </>
                      )}
                      {event.location && (
                        <>
                          <div className="w-px h-4 bg-slate-200 hidden sm:block" />
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {event.location}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="h-px w-full bg-slate-100 mb-5" />

                    {/* Seats Availability */}
                    <div className="mb-6">
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-700">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          Seats Availability
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Limited spots remaining</span>
                          <span className="text-sm font-bold text-[#0f7c85]">{reserved} / {total}</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-[#0f7c85] h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setReserveModalOpen(true)}
                        className="flex-1 bg-[#0f7c85] hover:bg-[#0c6b73] text-white rounded-xl py-3.5 px-4 text-[13px] font-bold shadow-md shadow-[#0f7c85]/10 hover:shadow-lg transition-all flex justify-center items-center gap-2 cursor-pointer"
                      >
                        Reserve Your Spot
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </button>
                      <button
                        onClick={handleBookmarkToggle}
                        className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                          bookmarked ? 'border-[#0f7c85] text-[#0f7c85] bg-[#0f7c85]/10' : 'border-slate-200 text-slate-400 hover:text-[#0f7c85] hover:border-[#0f7c85]'
                        }`}
                        title={bookmarked ? 'Remove Bookmark' : 'Bookmark Event'}
                      >
                        <svg className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Interactive Spot Reservation Modal */}
      {reserveModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[32px] p-6 md:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setReserveModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              ✕
            </button>
            <div className="mb-6">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0f7c85]">Reserve Your Spot</span>
              <h3 className="font-heading font-extrabold text-xl text-slate-900 mt-1">{event?.title || 'Community Event'}</h3>
              <p className="text-xs text-slate-500 mt-1">{event?.eventDate} • {event?.location}</p>
            </div>

            <form onSubmit={handleReserveSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={reserveForm.name}
                  onChange={(e) => setReserveForm({ ...reserveForm, name: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#0f7c85]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah@example.com"
                  value={reserveForm.email}
                  onChange={(e) => setReserveForm({ ...reserveForm, email: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#0f7c85]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. (555) 000-1234"
                    value={reserveForm.phone}
                    onChange={(e) => setReserveForm({ ...reserveForm, phone: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#0f7c85]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Number of Seats</label>
                  <select
                    value={reserveForm.seats}
                    onChange={(e) => setReserveForm({ ...reserveForm, seats: Number(e.target.value) })}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs outline-none bg-white focus:ring-1 focus:ring-[#0f7c85]"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Seat' : 'Seats'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={reserving}
                  className="w-full bg-[#0f7c85] hover:bg-[#0c6b73] disabled:opacity-50 text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-md shadow-[#0f7c85]/20 cursor-pointer"
                >
                  {reserving ? 'Confirming Reservation...' : 'Confirm Spot Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
