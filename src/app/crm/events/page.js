"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  Clock,
  Tag,
  Users,
  Image as ImageIcon,
  Star,
  RefreshCw,
  X,
  Search,
} from "lucide-react";
import MediaPickerModal from "@/components/media/MediaPickerModal";

export default function EventsManagerPage() {
  const [siteId, setSiteId] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "MINDFULNESS WALK",
    description: "",
    imageUrl: "",
    eventDate: "",
    eventTime: "",
    location: "",
    tags: "Mindfulness, Outdoor, Beginner Friendly",
    reservedSeats: 45,
    totalSeats: 60,
    isFeatured: true,
    status: "active",
  });

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const id = localStorage.getItem("x-site-id") || process.env.NEXT_PUBLIC_SITE_ID || "";
    setSiteId(id);
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!siteId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/events", {
        headers: { "x-site-id": siteId },
      });
      const data = await res.json();
      if (data.success && data.data?.events) {
        setEvents(data.data.events);
      }
    } catch (e) {
      console.error("Failed to load events:", e);
      showToast("Error loading events list", "error");
    } finally {
      setLoading(false);
    }
  }, [siteId, showToast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const openNew = () => {
    setEditingId(null);
    setForm({
      title: "",
      category: "MINDFULNESS WALK",
      description: "",
      imageUrl: "/images/hero_exercise.png",
      eventDate: "Sat, 27 July 2024",
      eventTime: "9:00 AM – 11:30 AM",
      location: "City Nature Park",
      tags: "Mindfulness, Outdoor, Beginner Friendly",
      reservedSeats: 45,
      totalSeats: 60,
      isFeatured: true,
      status: "active",
    });
    setPanelOpen(true);
  };

  const openEdit = (ev) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title || "",
      category: ev.category || "MINDFULNESS WALK",
      description: ev.description || "",
      imageUrl: ev.imageUrl || "",
      eventDate: ev.eventDate || "",
      eventTime: ev.eventTime || "",
      location: ev.location || "",
      tags: ev.tags || "",
      reservedSeats: ev.reservedSeats ?? 45,
      totalSeats: ev.totalSeats ?? 60,
      isFeatured: ev.isFeatured ?? true,
      status: ev.status || "active",
    });
    setPanelOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/dashboard/events/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "x-site-id": siteId },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch("/api/dashboard/events", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-site-id": siteId },
          body: JSON.stringify(form),
        });
      }

      const data = await res.json();
      if (data.success) {
        showToast(editingId ? "Event updated successfully!" : "Featured event published!");
        setPanelOpen(false);
        fetchEvents();
      } else {
        showToast(data.error || "Failed to save event", "error");
      }
    } catch (err) {
      showToast("Error saving event details", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`/api/dashboard/events/${id}`, {
        method: "DELETE",
        headers: { "x-site-id": siteId },
      });
      if (res.ok) {
        showToast("Event removed.");
        fetchEvents();
      }
    } catch (err) {
      showToast("Failed to delete event", "error");
    }
  };

  const toggleFeatured = async (ev) => {
    try {
      const res = await fetch(`/api/dashboard/events/${ev.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-site-id": siteId },
        body: JSON.stringify({ isFeatured: !ev.isFeatured }),
      });
      if (res.ok) {
        showToast(`Event set as ${!ev.isFeatured ? 'Featured on Homepage' : 'Standard'}`);
        fetchEvents();
      }
    } catch (err) {
      showToast("Failed to update featured status", "error");
    }
  };

  const filtered = events.filter((ev) =>
    ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ev.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ev.location || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full relative">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-semibold text-white transition-all ${
          toast.type === "error" ? "bg-rose-600" : "bg-emerald-600"
        }`}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Calendar size={22} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Community & Events Manager
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              Control the featured event card, dates, seats, and venue details shown on your website homepage.
            </p>
          </div>
        </div>

        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          <Plus size={15} /> + Add Featured Event
        </button>
      </div>

      {/* Info Card Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-sky-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={18} className="text-emerald-600 mt-0.5 shrink-0" />
        <div className="text-xs text-emerald-900 dark:text-emerald-200">
          <span className="font-extrabold block mb-0.5 uppercase tracking-wide">Homepage Event Card Synchronization</span>
          Events marked with <strong>Featured Event</strong> automatically update the <strong>&quot;Our Community &amp; Events&quot;</strong> card on your main landing page in real-time.
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 p-4 rounded-xl flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search events by title, category, or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-0 outline-none text-xs text-slate-800 dark:text-slate-200"
          />
        </div>
        <button
          onClick={fetchEvents}
          className="p-2 border rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
          title="Refresh"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Events Table / List */}
      <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-emerald-500" /> Loading events...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
              <Calendar size={22} />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No community events found</p>
            <p className="text-xs text-slate-400">Click <strong>&quot;+ Add Featured Event&quot;</strong> to publish your first community event.</p>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold mt-1"
            >
              <Plus size={14} /> + Add Featured Event
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b dark:border-slate-700 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="p-4">Event Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Date &amp; Time</th>
                  <th className="p-4">Venue / Location</th>
                  <th className="p-4 text-center">Seats Reserved</th>
                  <th className="p-4 text-center">Homepage Card?</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                {filtered.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={ev.imageUrl || "/images/hero_exercise.png"}
                          alt={ev.title}
                          className="w-12 h-12 rounded-xl object-cover border dark:border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white text-xs">{ev.title}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{ev.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                        {ev.category}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      <div className="font-bold">{ev.eventDate || "TBA"}</div>
                      <div className="text-[10px] text-slate-400">{ev.eventTime}</div>
                    </td>
                    <td className="p-4 whitespace-nowrap font-medium text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" /> {ev.location || "Online"}
                      </div>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap font-bold">
                      <span className="text-emerald-600">{ev.reservedSeats}</span> / {ev.totalSeats}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleFeatured(ev)}
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold border transition-all cursor-pointer ${
                          ev.isFeatured
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800"
                        }`}
                      >
                        {ev.isFeatured ? "⭐ Featured" : "Standard"}
                      </button>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => openEdit(ev)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit Event"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(ev.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Event"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Form Panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            {/* Form Header */}
            <div className="px-6 py-4 border-b dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {editingId ? "Edit Event Details" : "Create New Community Event"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Update event card title, image, date, time, venue, and reserved spots.
                </p>
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <form id="event-form" onSubmit={handleSave} className="p-6 space-y-4 flex-1">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Restorative Walk: Managing Stress in Nature"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 border dark:border-slate-700 rounded-xl text-xs dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Category Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. MINDFULNESS WALK"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2.5 border dark:border-slate-700 rounded-xl text-xs dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Venue / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. City Nature Park or Online Zoom"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full p-2.5 border dark:border-slate-700 rounded-xl text-xs dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Featured Image URL</label>
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    Choose from Media Library
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. /images/hero_exercise.png or image URL"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full p-2.5 border dark:border-slate-700 rounded-xl text-xs dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Event Description</label>
                <textarea
                  rows={3}
                  placeholder="Short, engaging description of the event..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 border dark:border-slate-700 rounded-xl text-xs dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Event Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Sat, 27 July 2024"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="w-full p-2.5 border dark:border-slate-700 rounded-xl text-xs dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Event Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 9:00 AM – 11:30 AM"
                    value={form.eventTime}
                    onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
                    className="w-full p-2.5 border dark:border-slate-700 rounded-xl text-xs dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Event Tags <span className="normal-case font-normal">(comma-separated)</span></label>
                <input
                  type="text"
                  placeholder="e.g. Mindfulness, Outdoor, Beginner Friendly"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full p-2.5 border dark:border-slate-700 rounded-xl text-xs dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Reserved Seats</label>
                  <input
                    type="number"
                    value={form.reservedSeats}
                    onChange={(e) => setForm({ ...form, reservedSeats: e.target.value })}
                    className="w-full p-2.5 border dark:border-slate-700 rounded-xl text-xs dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Total Seats Capacity</label>
                  <input
                    type="number"
                    value={form.totalSeats}
                    onChange={(e) => setForm({ ...form, totalSeats: e.target.value })}
                    className="w-full p-2.5 border dark:border-slate-700 rounded-xl text-xs dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t dark:border-slate-800">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="rounded text-emerald-600 h-4 w-4 border-slate-300"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Feature on Homepage Card</span>
                    <span className="text-[10px] text-slate-400 block">Set this event as the primary featured card in &quot;Our Community &amp; Events&quot;</span>
                  </div>
                </label>
              </div>
            </form>

            {/* Form Footer */}
            <div className="px-6 py-4 border-t dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 border rounded-xl hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                form="event-form"
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-50 transition shadow-md shadow-emerald-600/20"
              >
                {saving ? "Publishing..." : "Save Event Details"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {mediaPickerOpen && (
        <MediaPickerModal
          isOpen={mediaPickerOpen}
          onClose={() => setMediaPickerOpen(false)}
          onSelect={(media) => {
            setForm((prev) => ({ ...prev, imageUrl: media.url }));
            setMediaPickerOpen(false);
          }}
          title="Select Event Banner Image"
        />
      )}
    </div>
  );
}
