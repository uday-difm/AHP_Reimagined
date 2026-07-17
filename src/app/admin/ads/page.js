"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Layers, Eye, MousePointerClick, TrendingUp, CheckCircle2,
  Trash2, Globe, Clock, Target, Edit, SlidersHorizontal, AlertTriangle,
  Play, Pause, X, Search, RefreshCw
} from "lucide-react";

// Placement configuration
const PLACEMENTS = [
  { value: "homepage-top", label: "Homepage Top" },
  { value: "sidebar", label: "Sidebar" },
  { value: "in-feed", label: "In-Feed" },
  { value: "footer", label: "Footer" }
];

const STATUS_CONFIG = {
  draft: { label: "Draft", cls: "bg-slate-100 text-slate-700 border-slate-200" },
  active: { label: "Active", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  paused: { label: "Paused", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  expired: { label: "Expired", cls: "bg-rose-50 text-rose-755 border-rose-200" }
};

export default function AdminAdsPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteId, setSiteId] = useState("");
  
  // Filtering and Searching
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [placementFilter, setPlacementFilter] = useState("all");
  
  // Compose / Edit slide-over state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: "",
    description: "",
    mediaUrl: "",
    mediaType: "image",
    targetUrl: "",
    placement: "homepage-top",
    status: "draft",
    priority: 1,
    startDate: "",
    endDate: "",
    targetDevice: "all",
    targetLocation: ""
  });

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const id = localStorage.getItem("x-site-id") || process.env.NEXT_PUBLIC_SITE_ID || "AHP";
    setSiteId(id);
  }, []);

  const fetchAds = useCallback(async () => {
    if (!siteId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ads", {
        headers: { "x-site-id": siteId }
      });
      if (res.ok) {
        const data = await res.json();
        setAds(data.data?.ads || []);
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to fetch ads", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Network error loading ads", "error");
    } finally {
      setLoading(false);
    }
  }, [siteId, showToast]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleOpenCompose = (ad = null) => {
    if (ad) {
      setEditingAd(ad);
      setForm({
        title: ad.title || "",
        description: ad.description || "",
        mediaUrl: ad.mediaUrl || "",
        mediaType: ad.mediaType || "image",
        targetUrl: ad.targetUrl || "",
        placement: ad.placement || "homepage-top",
        status: ad.status || "draft",
        priority: ad.priority || 1,
        startDate: ad.startDate ? ad.startDate.slice(0, 16) : "",
        endDate: ad.endDate ? ad.endDate.slice(0, 16) : "",
        targetDevice: ad.targetDevice || "all",
        targetLocation: ad.targetLocation || ""
      });
    } else {
      setEditingAd(null);
      setForm({
        title: "",
        description: "",
        mediaUrl: "",
        mediaType: "image",
        targetUrl: "",
        placement: "homepage-top",
        status: "draft",
        priority: 1,
        startDate: "",
        endDate: "",
        targetDevice: "all",
        targetLocation: ""
      });
    }
    setPanelOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingAd ? `/api/ads/${editingAd.id}` : "/api/ads";
      const method = editingAd ? "PUT" : "POST";
      
      const payload = {
        ...form,
        priority: Number(form.priority)
      };

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-site-id": siteId
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(editingAd ? "Ad details updated successfully" : "New advertisement created successfully", "success");
        setPanelOpen(false);
        fetchAds();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to save ad", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error saving ad details", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (ad) => {
    const nextStatus = ad.status === "active" ? "paused" : "active";
    try {
      const res = await fetch(`/api/ads/${ad.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-site-id": siteId
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showToast(`Ad is now ${nextStatus}`, "success");
        fetchAds();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to toggle status", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating ad status", "error");
    }
  };

  const handleDeleteAd = async (id) => {
    if (!window.confirm("Are you sure you want to soft-delete this ad? Statistics will be preserved.")) return;
    try {
      const res = await fetch(`/api/ads/${id}`, {
        method: "DELETE",
        headers: { "x-site-id": siteId }
      });
      if (res.ok) {
        showToast("Ad marked as expired", "success");
        fetchAds();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to delete ad", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting ad", "error");
    }
  };

  // Filter ads
  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (ad.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ad.placement.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ad.status === statusFilter;
    const matchesPlacement = placementFilter === "all" || ad.placement === placementFilter;
    return matchesSearch && matchesStatus && matchesPlacement;
  });

  // Calculate totals
  const totalImpressions = ads.reduce((acc, ad) => acc + (ad.impressions || 0), 0);
  const totalClicks = ads.reduce((acc, ad) => acc + (ad.clicks || 0), 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";
  const activeCount = ads.filter(ad => ad.status === "active").length;

  return (
    <div className="space-y-6 w-full p-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold text-white transition-all ${
          toast.type === "error" ? "bg-rose-600" : "bg-emerald-600"
        }`}>
          {toast.type === "error" ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Layers size={22} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
              Legacy Ads Panel
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Manage campaign creatives, placement rules, device targeting, and track performance metrics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenCompose()}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <Plus size={14} /> Create Ad
          </button>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-xl"><Eye size={18} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Impressions</p>
            <p className="text-lg font-black mt-0.5">{totalImpressions.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white border p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl"><MousePointerClick size={18} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Clicks</p>
            <p className="text-lg font-black mt-0.5">{totalClicks.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white border p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="p-2.5 bg-violet-50 text-violet-500 rounded-xl"><TrendingUp size={18} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average CTR</p>
            <p className="text-lg font-black mt-0.5">{avgCtr}%</p>
          </div>
        </div>
        <div className="bg-white border p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="p-2.5 bg-sky-50 text-sky-500 rounded-xl"><CheckCircle2 size={18} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Ads</p>
            <p className="text-lg font-black mt-0.5">{activeCount} / {ads.length}</p>
          </div>
        </div>
      </div>

      {/* Filters and List */}
      <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 border px-3 py-1.5 rounded-lg text-xs bg-slate-50 w-full sm:w-72">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-slate-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal size={13} className="text-slate-400" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filter:</span>
            </div>
            
            <select
              value={placementFilter}
              onChange={e => setPlacementFilter(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-xs font-semibold bg-slate-50 outline-none"
            >
              <option value="all">All Placements</option>
              {PLACEMENTS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-xs font-semibold bg-slate-50 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="expired">Expired</option>
            </select>

            <button
              onClick={fetchAds}
              className="p-1.5 hover:bg-slate-100 border rounded-lg transition"
            >
              <RefreshCw size={14} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Ads Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider text-left">
                <th className="px-4 py-3 rounded-l-xl">Ad Creative</th>
                <th className="px-4 py-3">Placement</th>
                <th className="px-4 py-3">Target Device</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Impressions</th>
                <th className="px-4 py-3 text-center">Clicks</th>
                <th className="px-4 py-3 text-center">CTR</th>
                <th className="px-4 py-3 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400 font-medium">
                    Loading advertisements list...
                  </td>
                </tr>
              ) : filteredAds.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400 font-medium">
                    No advertisements found matching the filters
                  </td>
                </tr>
              ) : (
                filteredAds.map(ad => {
                  const statusCfg = STATUS_CONFIG[ad.status] || STATUS_CONFIG.draft;
                  return (
                    <tr key={ad.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {ad.mediaType === "image" && ad.mediaUrl ? (
                            <img
                              src={ad.mediaUrl}
                              alt={ad.title}
                              className="w-12 h-12 object-cover rounded-lg border bg-slate-50 shrink-0"
                              onError={e => { e.target.src = 'https://placehold.co/100x100?text=Ad'; }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg border bg-slate-50 flex items-center justify-center font-bold text-[9px] text-slate-400 shrink-0 uppercase">
                              {ad.mediaType}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-800 block text-[13px]">{ad.title}</span>
                            <span className="text-[10px] text-slate-400 block line-clamp-1 max-w-[200px] mt-0.5">{ad.description || "No description"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-600 capitalize">
                        {ad.placement}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono capitalize">
                        {ad.targetDevice || "all"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusCfg.cls}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-medium text-slate-700">
                        {(ad.impressions || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-center font-medium text-slate-700">
                        {(ad.clicks || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                        {ad.ctr || "0.00"}%
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(ad)}
                            title={ad.status === "active" ? "Pause Ad" : "Activate Ad"}
                            className={`p-1.5 border rounded-lg transition ${
                              ad.status === "active"
                                ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                                : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                            }`}
                          >
                            {ad.status === "active" ? <Pause size={13} /> : <Play size={13} />}
                          </button>
                          <button
                            onClick={() => handleOpenCompose(ad)}
                            title="Edit Ad"
                            className="p-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            title="Soft Delete"
                            className="p-1.5 border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Compose Panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setPanelOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  {editingAd ? "Edit Advertisement" : "Deploy Advertisement"}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Specify details, select media layout formats, and setup scheduling filters
                </p>
              </div>
              <button onClick={() => setPanelOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {/* Panel Body Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ad Campaign Title *</label>
                <input
                  type="text" required placeholder="Ex: Summer Clearance Sale 2026"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description / Tagline</label>
                <textarea
                  rows={2} placeholder="Ex: Get up to 50% off all apparel categories..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Placement Zone *</label>
                  <select
                    value={form.placement}
                    onChange={e => setForm({ ...form, placement: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-xs outline-none bg-white font-semibold"
                  >
                    {PLACEMENTS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Creative Media Type *</label>
                  <select
                    value={form.mediaType}
                    onChange={e => setForm({ ...form, mediaType: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-xs outline-none bg-white font-semibold"
                  >
                    <option value="image">Image Creative</option>
                    <option value="video">Video Loop</option>
                    <option value="html">Custom HTML / Script</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Creative Media URL / Script Code *</label>
                {form.mediaType === "html" ? (
                  <textarea
                    rows={4} required placeholder="<ins class='adsbygoogle' ...></ins>"
                    value={form.mediaUrl}
                    onChange={e => setForm({ ...form, mediaUrl: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-xs outline-none font-mono"
                  />
                ) : (
                  <input
                    type="url" required placeholder="https://res.cloudinary.com/..."
                    value={form.mediaUrl}
                    onChange={e => setForm({ ...form, mediaUrl: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-xs outline-none"
                  />
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Destination Target URL *</label>
                <input
                  type="url" required placeholder="https://yoursite.com/promotions"
                  value={form.targetUrl}
                  onChange={e => setForm({ ...form, targetUrl: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Delivery Priority</label>
                  <input
                    type="number" min={1} max={100}
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Device targeting</label>
                  <select
                    value={form.targetDevice}
                    onChange={e => setForm({ ...form, targetDevice: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-xs outline-none bg-white font-semibold"
                  >
                    <option value="all">All Devices</option>
                    <option value="mobile">Mobile Only</option>
                    <option value="desktop">Desktop Only</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status Mode</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-xs outline-none bg-white font-semibold"
                  >
                    <option value="draft">Draft Mode</option>
                    <option value="active">Active/Live</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Start Date</label>
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">End Date</label>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Location (Country ISO Code)</label>
                <input
                  type="text" placeholder="Ex: US, GB, or blank for all locations"
                  value={form.targetLocation}
                  onChange={e => setForm({ ...form, targetLocation: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-xs outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button" onClick={() => setPanelOpen(false)}
                  className="flex-1 py-2.5 border rounded-lg text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingAd ? "Save Changes" : "Create Ad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
