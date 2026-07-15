"use client";

import { useState, useEffect } from "react";
import {
  Plus, Layers, RefreshCw, BarChart2, Eye, MousePointer,
  Target, Calendar, Users, Briefcase, FileText, CheckCircle,
  XCircle, Trash2, Globe, Clock, Settings, Zap, Play, Pause,
  DollarSign, Sparkles, Filter, ChevronRight
} from "lucide-react";

export default function AdsPage() {
  const [ads, setAds] = useState([]);
  const [zones, setZones] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [advertisers, setAdvertisers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ads"); // "ads", "campaigns", "advertisers", "zones"
  const [siteId, setSiteId] = useState("");
  const [saveError, setSaveError] = useState(null);

  // Form states
  const [newZone, setNewZone] = useState({ name: "", width: "", height: "" });
  const [newCampaign, setNewCampaign] = useState({
    name: "", description: "", budget: "", startDate: "", endDate: "", status: "active"
  });
  const [newAdvertiser, setNewAdvertiser] = useState({
    companyName: "", contactName: "", email: "", phone: "", website: "", logo: "", status: "active"
  });
  const [newAd, setNewAd] = useState({
    zoneId: "", name: "", type: "banner", code: "", imageUrl: "", targetUrl: "",
    advertiserId: "", campaignId: "", priority: 50, isActive: true,
    // Targeting rules
    targetDevice: "all", targetCountry: "all", targetRoutes: "",
    // Scheduling rules
    schedTimezone: "UTC", schedTimeStart: "", schedTimeEnd: "",
    schedDays: [], // e.g. [1, 2, 3, 4, 5]
  });

  useEffect(() => {
    const id = localStorage.getItem("x-site-id") || process.env.NEXT_PUBLIC_SITE_ID || "";
    setSiteId(id);
  }, []);

  useEffect(() => {
    if (siteId) {
      fetchData();
    }
  }, [siteId]);

  const fetchData = async () => {
    setLoading(true);
    setSaveError(null);
    try {
      const [adsRes, zonesRes, campaignsRes, advertisersRes] = await Promise.all([
        fetch("/api/dashboard/ads", { headers: { "x-site-id": siteId } }),
        fetch("/api/dashboard/ads/zones", { headers: { "x-site-id": siteId } }),
        fetch("/api/dashboard/advertisement-campaigns", { headers: { "x-site-id": siteId } }),
        fetch("/api/dashboard/advertisers", { headers: { "x-site-id": siteId } }),
      ]);
      
      if (adsRes.ok && zonesRes.ok && campaignsRes.ok && advertisersRes.ok) {
        const adsData = await adsRes.json().catch(() => ({}));
        const zonesData = await zonesRes.json().catch(() => ({}));
        const campaignsData = await campaignsRes.json().catch(() => ({}));
        const advertisersData = await advertisersRes.json().catch(() => ({}));

        if (adsData.success) setAds(adsData.data?.ads || []);
        if (zonesData.success) setZones(zonesData.data?.zones || []);
        if (campaignsData.success) setCampaigns(campaignsData.data?.campaigns || []);
        if (advertisersData.success) setAdvertisers(advertisersData.data?.advertisers || []);
      }
    } catch (e) {
      console.error("Failed to load advertising data:", e);
    } finally {
      setLoading(false);
    }
  };

  // Create Placement Zone
  const handleCreateZone = async (e) => {
    e.preventDefault();
    setSaveError(null);
    try {
      const res = await fetch("/api/dashboard/ads/zones", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-site-id": siteId },
        body: JSON.stringify({
          name: newZone.name,
          width: newZone.width ? Number(newZone.width) : null,
          height: newZone.height ? Number(newZone.height) : null,
        })
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        setNewZone({ name: "", width: "", height: "" });
        fetchData();
      } else {
        setSaveError(data.error || "Failed to create ad zone");
      }
    } catch (err) {
      setSaveError("Error creating ad zone");
    }
  };

  // Create Campaign
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setSaveError(null);
    try {
      const res = await fetch("/api/dashboard/advertisement-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-site-id": siteId },
        body: JSON.stringify({
          ...newCampaign,
          budget: newCampaign.budget ? Number(newCampaign.budget) : null,
          startDate: newCampaign.startDate || null,
          endDate: newCampaign.endDate || null,
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewCampaign({ name: "", description: "", budget: "", startDate: "", endDate: "", status: "active" });
        fetchData();
      } else {
        setSaveError(data.error || "Failed to create campaign");
      }
    } catch (err) {
      setSaveError("Error creating campaign");
    }
  };

  // Create Advertiser
  const handleCreateAdvertiser = async (e) => {
    e.preventDefault();
    setSaveError(null);
    try {
      const res = await fetch("/api/dashboard/advertisers", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-site-id": siteId },
        body: JSON.stringify(newAdvertiser)
      });
      const data = await res.json();
      if (data.success) {
        setNewAdvertiser({ companyName: "", contactName: "", email: "", phone: "", website: "", logo: "", status: "active" });
        fetchData();
      } else {
        setSaveError(data.error || "Failed to create advertiser");
      }
    } catch (err) {
      setSaveError("Error creating advertiser");
    }
  };

  // Create Advertisement
  const handleCreateAd = async (e) => {
    e.preventDefault();
    setSaveError(null);

    // Compile targeting JSON
    const targetingObj = {
      device: newAd.targetDevice,
      country: newAd.targetCountry,
      routes: newAd.targetRoutes ? newAd.targetRoutes.split(",").map(r => r.trim()).filter(Boolean) : []
    };

    // Compile scheduling JSON
    const schedulingObj = {
      timezone: newAd.schedTimezone,
      timeStart: newAd.schedTimeStart || null,
      timeEnd: newAd.schedTimeEnd || null,
      days: newAd.schedDays.length > 0 ? newAd.schedDays.map(Number) : []
    };

    try {
      const res = await fetch("/api/dashboard/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-site-id": siteId },
        body: JSON.stringify({
          zoneId: newAd.zoneId,
          name: newAd.name,
          type: newAd.type,
          code: newAd.code,
          imageUrl: newAd.imageUrl,
          targetUrl: newAd.targetUrl,
          advertiserId: newAd.advertiserId || null,
          campaignId: newAd.campaignId || null,
          priority: Number(newAd.priority),
          isActive: newAd.isActive,
          targeting: JSON.stringify(targetingObj),
          scheduling: JSON.stringify(schedulingObj)
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewAd({
          zoneId: "", name: "", type: "banner", code: "", imageUrl: "", targetUrl: "",
          advertiserId: "", campaignId: "", priority: 50, isActive: true,
          targetDevice: "all", targetCountry: "all", targetRoutes: "",
          schedTimezone: "UTC", schedTimeStart: "", schedTimeEnd: "", schedDays: [],
        });
        fetchData();
      } else {
        setSaveError(data.error || "Failed to create ad");
      }
    } catch (err) {
      setSaveError("Error creating ad");
    }
  };

  // Delete Ad
  const handleDeleteAd = async (id) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    try {
      const res = await fetch(`/api/dashboard/ads/${id}`, {
        method: "DELETE",
        headers: { "x-site-id": siteId }
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Advertiser
  const handleDeleteAdvertiser = async (id) => {
    if (!confirm("Delete this advertiser? All their ad relation links will be set to Null.")) return;
    try {
      const res = await fetch(`/api/dashboard/advertisers/${id}`, {
        method: "DELETE",
        headers: { "x-site-id": siteId }
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = async (id) => {
    if (!confirm("Delete this ad campaign?")) return;
    try {
      const res = await fetch(`/api/dashboard/advertisement-campaigns/${id}`, {
        method: "DELETE",
        headers: { "x-site-id": siteId }
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Ad status
  const toggleAdActive = async (ad) => {
    try {
      const res = await fetch(`/api/dashboard/ads/${ad.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-site-id": siteId },
        body: JSON.stringify({ isActive: !ad.isActive })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Preset Layout Dimensions Helper
  const handlePresetChange = (presetValue) => {
    if (!presetValue) {
      setNewZone(prev => ({ ...prev, width: "", height: "" }));
      return;
    }
    const [width, height] = presetValue.split("x");
    setNewZone(prev => ({ ...prev, width, height }));
  };

  // Toggle Day Selection
  const toggleDay = (dayIndex) => {
    setNewAd(prev => {
      const days = [...prev.schedDays];
      const idx = days.indexOf(dayIndex);
      if (idx >= 0) {
        days.splice(idx, 1);
      } else {
        days.push(dayIndex);
      }
      return { ...prev, schedDays: days };
    });
  };

  // Metrics
  const totalImpressions = ads.reduce((acc, curr) => acc + (curr.impressions || 0), 0);
  const totalClicks = ads.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const totalCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  return (
    <div className="space-y-6 w-full text-slate-800 dark:text-slate-200">
      
      {/* Top Banner Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles size={22} className="text-indigo-600 animate-pulse" />
            Advertisement Dashboard
          </h1>
          <p className="text-slate-500 text-xs mt-1">Deploy, rotate, target, and monitor advertising placements across all connected channels</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Metrics Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Eye size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Total Impressions</span>
            <span className="text-xl font-black text-slate-800 dark:text-slate-100">{totalImpressions.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <MousePointer size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Total Clicks</span>
            <span className="text-xl font-black text-slate-800 dark:text-slate-100">{totalClicks.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <BarChart2 size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Average CTR</span>
            <span className="text-xl font-black text-slate-800 dark:text-slate-100">{totalCtr}%</span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex border-b dark:border-slate-700 gap-4 overflow-x-auto pb-1 shrink-0">
        {[
          { key: "ads",         label: "Advertisements",  icon: FileText },
          { key: "campaigns",   label: "Campaigns",       icon: Briefcase },
          { key: "advertisers", label: "Advertisers",     icon: Users },
          { key: "zones",       label: "Placement Zones",  icon: Layers },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { setActiveTab(t.key); setSaveError(null); }}
            className={`pb-2.5 text-xs font-bold transition-all relative flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === t.key ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 font-extrabold" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: ADVERTISEMENTS ────────────────────────────────────────── */}
      {activeTab === "ads" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Ad campaigns list table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b dark:border-slate-700">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Deployments List</span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                  <RefreshCw size={14} className="animate-spin text-indigo-600" /> Loading ads list...
                </div>
              ) : ads.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  No active advertisements deployed. Build one using the form on the right!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="p-3">Ad Name / Details</th>
                        <th className="p-3">Placement Zone</th>
                        <th className="p-3">Advertiser / Campaign</th>
                        <th className="p-3 text-center">Priority</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-center">Performance</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                      {ads.map((ad) => (
                        <tr key={ad.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850 transition-colors">
                          <td className="p-3">
                            <div className="font-semibold text-slate-800 dark:text-slate-100">{ad.name}</div>
                            <div className="text-[10px] text-slate-450 uppercase mt-0.5 tracking-wider font-mono">{ad.type}</div>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-md font-bold text-[9.5px]">
                              {ad.zone?.name || "Unassigned"}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-700 dark:text-slate-300">{ad.advertiser?.companyName || "—"}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{ad.campaign?.name || "No Campaign"}</div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                              ad.priority >= 80 ? "bg-red-50 text-red-700 dark:bg-red-950/20" :
                              ad.priority >= 50 ? "bg-blue-50 text-blue-700 dark:bg-blue-950/20" :
                              "bg-slate-100 text-slate-600"
                            }`}>
                              {ad.priority}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => toggleAdActive(ad)}
                              title="Click to toggle status"
                              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9.5px] font-bold rounded-full border transition-colors ${
                                ad.isActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                              }`}
                            >
                              {ad.isActive ? <Play size={8} /> : <Pause size={8} />}
                              {ad.isActive ? "Active" : "Paused"}
                            </button>
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <div className="font-semibold">{ad.clicks || 0} clicks</div>
                            <div className="text-[10px] text-slate-400">{ad.impressions || 0} imps</div>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteAd(ad.id)}
                              className="p-1 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors"
                              title="Delete Advertisement"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Form Create Ad Campaign */}
          <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 p-5 rounded-xl space-y-4 shadow-sm h-fit">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
              <Plus size={14} /> Deploy New Ad Campaign
            </h3>
            
            <form onSubmit={handleCreateAd} className="space-y-3.5">
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ad Name</label>
                <input
                  type="text" required placeholder="Summer Promotion Leaderboard"
                  value={newAd.name}
                  onChange={(e) => setNewAd({ ...newAd, name: e.target.value })}
                  className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Zone Placement</label>
                  <select
                    required value={newAd.zoneId}
                    onChange={(e) => setNewAd({ ...newAd, zoneId: e.target.value })}
                    className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                  >
                    <option value="">Select Zone</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Priority Weight</label>
                  <select
                    value={newAd.priority}
                    onChange={(e) => setNewAd({ ...newAd, priority: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                  >
                    <option value="100">100 (Highest)</option>
                    <option value="80">80 (High)</option>
                    <option value="50">50 (Normal)</option>
                    <option value="20">20 (Low)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Advertiser Link</label>
                  <select
                    value={newAd.advertiserId}
                    onChange={(e) => setNewAd({ ...newAd, advertiserId: e.target.value })}
                    className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                  >
                    <option value="">No Advertiser</option>
                    {advertisers.map((adv) => (
                      <option key={adv.id} value={adv.id}>{adv.companyName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Campaign Link</label>
                  <select
                    value={newAd.campaignId}
                    onChange={(e) => setNewAd({ ...newAd, campaignId: e.target.value })}
                    className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                  >
                    <option value="">No Campaign</option>
                    {campaigns.map((camp) => (
                      <option key={camp.id} value={camp.id}>{camp.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ad Content Format</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewAd({ ...newAd, type: "banner" })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      newAd.type === "banner"
                        ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20"
                        : "border-slate-200 text-slate-400 dark:border-slate-700"
                    }`}
                  >
                    Image Banner
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAd({ ...newAd, type: "adsense" })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      newAd.type === "adsense"
                        ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20"
                        : "border-slate-200 text-slate-400 dark:border-slate-700"
                    }`}
                  >
                    AdSense / Scripts
                  </button>
                </div>
              </div>

              {newAd.type === "banner" ? (
                <div className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Banner Image URL</label>
                    <input
                      type="text" placeholder="https://example.com/banner.png"
                      value={newAd.imageUrl}
                      onChange={(e) => setNewAd({ ...newAd, imageUrl: e.target.value })}
                      className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Target Destination URL</label>
                    <input
                      type="text" placeholder="https://example.com/target-page"
                      value={newAd.targetUrl}
                      onChange={(e) => setNewAd({ ...newAd, targetUrl: e.target.value })}
                      className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">HTML Code / AdSense snippet</label>
                  <textarea
                    rows={3} placeholder='<ins class="adsbygoogle" ...>'
                    value={newAd.code}
                    onChange={(e) => setNewAd({ ...newAd, code: e.target.value })}
                    className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none font-mono"
                  />
                </div>
              )}

              {/* Targeting settings block */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block flex items-center gap-1"><Target size={11} /> Audience Targeting Rules</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-450 block mb-0.5">Target Device</label>
                    <select
                      value={newAd.targetDevice}
                      onChange={(e) => setNewAd({ ...newAd, targetDevice: e.target.value })}
                      className="w-full p-1.5 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                    >
                      <option value="all">All Devices</option>
                      <option value="desktop">Desktop Only</option>
                      <option value="mobile">Mobile Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-slate-450 block mb-0.5">Country ISO Code</label>
                    <input
                      type="text" placeholder="US, IN, or 'all'"
                      value={newAd.targetCountry}
                      onChange={(e) => setNewAd({ ...newAd, targetCountry: e.target.value })}
                      className="w-full p-1.5 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9.5px] font-bold text-slate-450 block mb-0.5">Routes Filters (comma-separated)</label>
                  <input
                    type="text" placeholder="e.g. /blogs/*, /about"
                    value={newAd.targetRoutes}
                    onChange={(e) => setNewAd({ ...newAd, targetRoutes: e.target.value })}
                    className="w-full p-1.5 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Scheduling settings block */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block flex items-center gap-1"><Clock size={11} /> Delivery Schedule</span>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-450 block mb-0.5">Start Hour</label>
                    <input
                      type="text" placeholder="e.g. 09:00"
                      value={newAd.schedTimeStart}
                      onChange={(e) => setNewAd({ ...newAd, schedTimeStart: e.target.value })}
                      className="w-full p-1.5 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-450 block mb-0.5">End Hour</label>
                    <input
                      type="text" placeholder="e.g. 18:00"
                      value={newAd.schedTimeEnd}
                      onChange={(e) => setNewAd({ ...newAd, schedTimeEnd: e.target.value })}
                      className="w-full p-1.5 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-450 block mb-0.5">Timezone</label>
                    <select
                      value={newAd.schedTimezone}
                      onChange={(e) => setNewAd({ ...newAd, schedTimezone: e.target.value })}
                      className="w-full p-1.5 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                    >
                      <option value="UTC">UTC</option>
                      <option value="Asia/Kolkata">IST (Kolkata)</option>
                      <option value="America/New_York">EST (New York)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Days of the Week</label>
                  <div className="flex justify-between gap-1">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayName, idx) => {
                      const isSelected = newAd.schedDays.includes(idx);
                      return (
                        <button
                          key={dayName} type="button"
                          onClick={() => toggleDay(idx)}
                          className={`w-8 h-8 text-[10px] font-extrabold rounded-full border transition-colors ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600"
                          }`}
                        >
                          {dayName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold mt-2 shadow-sm">
                Deploy Campaign
              </button>
              {saveError && <p className="text-red-500 text-xs font-semibold">{saveError}</p>}
            </form>
          </div>
        </div>
      )}

      {/* ─── TAB 2: CAMPAIGNS ────────────────────────────────────────────── */}
      {activeTab === "campaigns" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaigns list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b dark:border-slate-700">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Ad Campaigns</span>
              </div>

              {campaigns.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">No campaigns created yet.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {campaigns.map((camp) => (
                    <div key={camp.id} className="p-4 flex justify-between items-center hover:bg-slate-50/50 dark:hover:bg-slate-850">
                      <div>
                        <h4 className="font-bold text-xs text-slate-850 dark:text-white">{camp.name}</h4>
                        {camp.description && <p className="text-[11px] text-slate-500 mt-0.5">{camp.description}</p>}
                        <div className="flex gap-4 mt-2 text-[10px] text-slate-450">
                          {camp.budget && <span className="flex items-center gap-0.5"><DollarSign size={10} /> Budget: ${camp.budget}</span>}
                          {camp.startDate && <span>Start: {new Date(camp.startDate).toLocaleDateString()}</span>}
                          {camp.endDate && <span>End: {new Date(camp.endDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 text-[9.5px] font-bold rounded-full ${camp.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
                          {camp.status}
                        </span>
                        <button
                          onClick={() => handleDeleteCampaign(camp.id)}
                          className="text-rose-600 hover:text-rose-700 text-xs font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Create Campaign */}
          <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 p-5 rounded-xl space-y-4 shadow-sm h-fit">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
              <Briefcase size={14} /> Create Ad Campaign Group
            </h3>
            <form onSubmit={handleCreateCampaign} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Campaign Name</label>
                <input
                  type="text" required placeholder="e.g. Summer 2026 Specials"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                <textarea
                  rows={2} placeholder="Optional notes or goals"
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Budget ($)</label>
                <input
                  type="number" placeholder="500"
                  value={newCampaign.budget}
                  onChange={(e) => setNewCampaign({ ...newCampaign, budget: e.target.value })}
                  className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newCampaign.startDate}
                    onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                    className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">End Date</label>
                  <input
                    type="date"
                    value={newCampaign.endDate}
                    onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                    className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold mt-2">
                Create Campaign
              </button>
              {saveError && <p className="text-red-500 text-xs font-semibold">{saveError}</p>}
            </form>
          </div>
        </div>
      )}

      {/* ─── TAB 3: ADVERTISERS ──────────────────────────────────────────── */}
      {activeTab === "advertisers" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Advertisers list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b dark:border-slate-700">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Advertiser Profiles</span>
              </div>

              {advertisers.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">No advertisers added yet.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {advertisers.map((adv) => (
                    <div key={adv.id} className="p-4 flex justify-between items-center hover:bg-slate-50/50 dark:hover:bg-slate-850">
                      <div>
                        <h4 className="font-bold text-xs text-slate-850 dark:text-white flex items-center gap-1.5">
                          {adv.logo ? <img src={adv.logo} className="w-5 h-5 rounded-full object-cover" /> : "🏢"}
                          {adv.companyName}
                        </h4>
                        <div className="flex gap-4 mt-2 text-[10px] text-slate-450">
                          {adv.contactName && <span>Contact: {adv.contactName}</span>}
                          {adv.email && <span>Email: {adv.email}</span>}
                          {adv.website && <span>Site: <a href={adv.website} target="_blank" className="underline">{adv.website}</a></span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 text-[9.5px] font-bold rounded-full ${adv.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
                          {adv.status}
                        </span>
                        <button
                          onClick={() => handleDeleteAdvertiser(adv.id)}
                          className="text-rose-600 hover:text-rose-700 text-xs font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Create Advertiser */}
          <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 p-5 rounded-xl space-y-4 shadow-sm h-fit">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
              <Users size={14} /> Create Advertiser Account
            </h3>
            <form onSubmit={handleCreateAdvertiser} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Company Name</label>
                <input
                  type="text" required placeholder="e.g. Novartis Pharmaceuticals"
                  value={newAdvertiser.companyName}
                  onChange={(e) => setNewAdvertiser({ ...newAdvertiser, companyName: e.target.value })}
                  className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Contact Name</label>
                <input
                  type="text" placeholder="e.g. John Doe"
                  value={newAdvertiser.contactName}
                  onChange={(e) => setNewAdvertiser({ ...newAdvertiser, contactName: e.target.value })}
                  className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Email</label>
                  <input
                    type="email" placeholder="billing@novartis.com"
                    value={newAdvertiser.email}
                    onChange={(e) => setNewAdvertiser({ ...newAdvertiser, email: e.target.value })}
                    className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Phone</label>
                  <input
                    type="text" placeholder="+1 (555) 0199"
                    value={newAdvertiser.phone}
                    onChange={(e) => setNewAdvertiser({ ...newAdvertiser, phone: e.target.value })}
                    className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Website URL</label>
                <input
                  type="text" placeholder="https://www.novartis.com"
                  value={newAdvertiser.website}
                  onChange={(e) => setNewAdvertiser({ ...newAdvertiser, website: e.target.value })}
                  className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Logo Image URL</label>
                <input
                  type="text" placeholder="https://example.com/novartis-logo.png"
                  value={newAdvertiser.logo}
                  onChange={(e) => setNewAdvertiser({ ...newAdvertiser, logo: e.target.value })}
                  className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                />
              </div>

              <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold mt-2">
                Add Advertiser
              </button>
              {saveError && <p className="text-red-500 text-xs font-semibold">{saveError}</p>}
            </form>
          </div>
        </div>
      )}

      {/* ─── TAB 4: PLACEMENT ZONES ──────────────────────────────────────── */}
      {activeTab === "zones" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Zones List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b dark:border-slate-700">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Ad Placement Zones</span>
              </div>

              {zones.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">No ad placement zones configured.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {zones.map((zone) => (
                    <div key={zone.id} className="p-4 flex justify-between items-center hover:bg-slate-50/50 dark:hover:bg-slate-850">
                      <div>
                        <div className="font-semibold text-xs text-slate-800 dark:text-slate-100">{zone.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">slug: {zone.slug}</div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md font-bold text-[10px]">
                          {zone.width && zone.height ? `${zone.width}x${zone.height}` : "Responsive / Native"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Create Zone Form */}
          <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 p-5 rounded-xl space-y-4 shadow-sm h-fit">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
              <Layers size={14} /> Create Placement Zone
            </h3>
            <form onSubmit={handleCreateZone} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Zone Name</label>
                <input
                  type="text" required placeholder="e.g. Header Leaderboard"
                  value={newZone.name}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                  className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Layout Preset</label>
                <select
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                  defaultValue=""
                >
                  <option value="">Custom / Responsive</option>
                  <optgroup label="Mobile Layouts (High-End Devices)">
                    <option value="300x200">300 x 200 px (Mobile Medium)</option>
                    <option value="300x50">300 x 50 px (Mobile Leaderboard)</option>
                    <option value="300x100">300 x 100 px (Mobile Large)</option>
                    <option value="250x250">250 x 250 px (Square)</option>
                    <option value="200x200">200 x 200 px (Small Square)</option>
                  </optgroup>
                  <optgroup label="Computer Layouts (Desktop)">
                    <option value="300x250">300 x 250 px (Medium Rectangle)</option>
                    <option value="336x280">336 x 280 px (Large Rectangle)</option>
                    <option value="728x90">728 x 90 px (Leaderboard)</option>
                    <option value="970x90">970 x 90 px (Large Leaderboard)</option>
                    <option value="468x60">468 x 60 px (Banner)</option>
                    <option value="300x600">300 x 600 px (Half-Page / Tower)</option>
                    <option value="160x600">160 x 600 px (Wide Skyscraper)</option>
                    <option value="250x250">250 x 250 px (Square)</option>
                    <option value="200x200">200 x 200 px (Small Square)</option>
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Width (px)</label>
                  <input
                    type="number" placeholder="728"
                    value={newZone.width}
                    onChange={(e) => setNewZone({ ...newZone, width: e.target.value })}
                    className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Height (px)</label>
                  <input
                    type="number" placeholder="90"
                    value={newZone.height}
                    onChange={(e) => setNewZone({ ...newZone, height: e.target.value })}
                    className="w-full p-2 border rounded-lg text-xs dark:bg-slate-900 outline-none"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold mt-2">
                Create Zone
              </button>
              {saveError && <p className="text-red-500 text-xs font-semibold">{saveError}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
