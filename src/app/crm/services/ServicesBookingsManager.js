"use client";

import { useState, useMemo } from "react";
import {
  Search, Filter, Mail, Eye, Edit2, Trash2, X,
  CheckCircle, Clock, AlertCircle, XCircle, DollarSign,
  Phone, Globe, MapPin, Calendar, FileText, Send,
  Download, Star, User, Briefcase, MessageSquare, RefreshCw,
  TrendingUp, Package
} from "lucide-react";

const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "closed", "lost"];

const STATUS_CONFIG = {
  new:       { color: "bg-blue-50 text-blue-700 border-blue-200",     icon: Clock,        label: "New" },
  contacted: { color: "bg-amber-50 text-amber-700 border-amber-200",  icon: MessageSquare, label: "Contacted" },
  qualified: { color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: Star,        label: "Qualified" },
  won:       { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle, label: "Won / Paid" },
  closed:    { color: "bg-slate-100 text-slate-600 border-slate-200", icon: XCircle,      label: "Closed" },
  lost:      { color: "bg-red-50 text-red-700 border-red-200",        icon: AlertCircle,  label: "Lost" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${cfg.color}`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

function PriceBadge({ interest }) {
  if (!interest) return null;
  const match = interest.match(/\$(\d+)/);
  if (!match) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
      <DollarSign size={10} />
      {match[1]}
    </span>
  );
}

// Parse the notes/message field to extract booking details
function parseBookingDetails(notes) {
  if (!notes) return {};
  const details = {};
  const fields = [
    ["professionalTitle", /Professional Title:\s*(.+)/i],
    ["website", /Company\/Practice Website:\s*(.+)/i],
    ["phone", /Phone:\s*(.+)/i],
    ["location", /State & Country:\s*(.+)/i],
    ["mediaPackage", /Requested Media Package:\s*(.+)/i],
    ["timeline", /Desired Timeline:\s*(.+)/i],
    ["story", /About Story \/ Brand Mission:\s*([\s\S]+?)(?:\n[A-Z]|$)/i],
  ];
  for (const [key, regex] of fields) {
    const m = notes.match(regex);
    if (m) details[key] = m[1].trim();
  }
  return details;
}

// ─── Lead Detail Panel ────────────────────────────────────────────────────────
function LeadDetailPanel({ lead, siteId, onClose, onUpdate }) {
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.notes || "");
  const [saving, setSaving] = useState(false);
  const [emailTo, setEmailTo] = useState(lead.email);
  const [emailSubject, setEmailSubject] = useState(`Re: Your Media Package Inquiry – ${lead.name}`);
  const [emailBody, setEmailBody] = useState(
    `Hi ${lead.name.split(" ")[0]},\n\nThank you for your interest in our media partnership services at A Health Place.\n\nWe have reviewed your submission and would like to move forward with your request.\n\n[Add your message here]\n\nBest regards,\nA Health Place Team`
  );
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // { type, message }
  const [tab, setTab] = useState("details"); // details | email

  const parsed = parseBookingDetails(lead.notes || "");

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/dashboard/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-site-id": siteId },
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to save");
      const data = await res.json();
      onUpdate({ ...lead, status, notes });
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailTo || !emailSubject || !emailBody) return;
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await fetch("/api/dashboard/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-site-id": siteId },
        body: JSON.stringify({
          to: emailTo,
          subject: emailSubject,
          html: `<div style="font-family:sans-serif;line-height:1.6;color:#333;max-width:600px;margin:auto;padding:24px">
            ${emailBody.replace(/\n/g, "<br/>")}
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
            <p style="font-size:12px;color:#888">A Health Place · ahealthplace.com</p>
          </div>`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Email failed");
      setEmailStatus({ type: "success", message: `Email sent successfully to ${emailTo}` });
    } catch (err) {
      setEmailStatus({ type: "error", message: err.message });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg h-full bg-white border-l border-slate-200 shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">{lead.name}</h2>
            <p className="text-xs text-slate-500">{lead.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={lead.status} />
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          {[["details", "Details", FileText], ["email", "Send Email", Mail]].map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
                tab === key
                  ? "border-indigo-600 text-indigo-700 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {tab === "details" && (
          <div className="flex-1 p-5 space-y-5">
            {/* Contact Info */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2.5">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Contact Information</h3>
              <DetailRow icon={User} label="Name" value={lead.name} />
              <DetailRow icon={Mail} label="Email" value={lead.email} />
              {lead.phone && <DetailRow icon={Phone} label="Phone" value={lead.phone} />}
              {parsed.professionalTitle && <DetailRow icon={Briefcase} label="Title" value={parsed.professionalTitle} />}
              {parsed.website && (
                <DetailRow icon={Globe} label="Website" value={
                  <a href={parsed.website.startsWith("http") ? parsed.website : `https://${parsed.website}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate block">{parsed.website}</a>
                } />
              )}
              {parsed.location && <DetailRow icon={MapPin} label="Location" value={parsed.location} />}
            </div>

            {/* Package Info */}
            {(lead.serviceInterest || parsed.mediaPackage || parsed.timeline) && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2.5">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Service Request</h3>
                {lead.serviceInterest && (
                  <DetailRow icon={Package} label="Package" value={
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-700">{lead.serviceInterest}</span>
                      <PriceBadge interest={lead.serviceInterest} />
                    </div>
                  } />
                )}
                {parsed.timeline && <DetailRow icon={Calendar} label="Timeline" value={parsed.timeline} />}
                {lead.sourcePage && <DetailRow icon={Globe} label="Source" value={lead.sourcePage} />}
              </div>
            )}

            {/* Brand Story */}
            {parsed.story && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Brand Story / Mission</h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{parsed.story}</p>
              </div>
            )}

            {/* Status & Notes */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CRM Management</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Internal Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Add internal notes about this client..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
              >
                {saving ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            <div className="text-center text-xs text-slate-400">
              Submitted {new Date(lead.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        )}

        {tab === "email" && (
          <div className="flex-1 p-5 space-y-4">
            <div className="rounded-xl border border-slate-100 bg-blue-50 p-3 flex items-start gap-2">
              <Mail size={13} className="text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700">Compose and send a direct email to this client. The email will be sent through your configured SMTP settings.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">To</label>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subject</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Message</label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono"
              />
            </div>

            {/* Quick Templates */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Quick Templates</label>
              <div className="flex flex-wrap gap-2">
                {[
                  ["Follow Up", `Hi ${lead.name.split(" ")[0]},\n\nJust following up on your media package inquiry. We'd love to discuss your feature further.\n\nWhen would be a good time to connect?\n\nBest regards,\nA Health Place Team`],
                  ["Approval", `Hi ${lead.name.split(" ")[0]},\n\nGreat news! Your application has been approved. We're excited to feature you in the next issue of A Health Place.\n\nPlease reply to confirm your package selection and we'll begin the onboarding process.\n\nBest regards,\nA Health Place Team`],
                  ["Invoice", `Hi ${lead.name.split(" ")[0]},\n\nThank you for confirming your interest! Your invoice for the ${lead.serviceInterest || "selected package"} will be sent shortly.\n\nPlease let us know if you have any questions.\n\nBest regards,\nA Health Place Team`],
                ].map(([label, body]) => (
                  <button
                    key={label}
                    onClick={() => setEmailBody(body)}
                    className="px-3 py-1 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {emailStatus && (
              <div className={`p-3 rounded-lg text-xs font-semibold border ${emailStatus.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                {emailStatus.message}
              </div>
            )}

            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {sendingEmail ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
              {sendingEmail ? "Sending..." : "Send Email"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={12} className="text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{label}</span>
        <div className="text-xs text-slate-700 break-words">{value}</div>
      </div>
    </div>
  );
}

// ─── Main Manager Component ───────────────────────────────────────────────────
export default function ServicesBookingsManager({ siteId, initialLeads, services, emailSettings }) {
  const [leads, setLeads] = useState(initialLeads);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchStatus = filterStatus === "all" || l.status === filterStatus;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        l.name?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.serviceInterest?.toLowerCase().includes(q) ||
        l.notes?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [leads, search, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const won = leads.filter(l => l.status === "won" || l.status === "converted" || l.status === "approved");
    const totalValue = won.reduce((sum, l) => {
      const m = l.serviceInterest?.match(/\$(\d+)/);
      return sum + (m ? parseInt(m[1]) : 0);
    }, 0);
    return {
      total: leads.length,
      new: leads.filter(l => l.status === "new").length,
      won: won.length,
      totalValue,
      conversionRate: leads.length > 0 ? Math.round((won.length / leads.length) * 100) : 0,
    };
  }, [leads]);

  const handleUpdate = (updated) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
    setSelected(updated);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this service booking lead permanently?")) return;
    try {
      const res = await fetch(`/api/dashboard/leads/${id}`, {
        method: "DELETE",
        headers: { "x-site-id": siteId },
      });
      if (!res.ok) throw new Error("Delete failed");
      setLeads(prev => prev.filter(l => l.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/leads?siteId=${siteId}`, {
        headers: { "x-site-id": siteId },
      });
      const data = await res.json();
      if (data.data?.leads) {
        const serviceLeads = data.data.leads.filter(l =>
          l.serviceInterest && (l.sourcePage?.toLowerCase().includes("service") || l.serviceInterest.length > 0)
        );
        setLeads(serviceLeads);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package size={20} className="text-indigo-600" />
            Service Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-1">All media partnership and service package booking requests</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <a
            href={`/api/dashboard/leads/export?siteId=${siteId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download size={12} /> Export CSV
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: stats.total, icon: FileText, color: "text-indigo-600" },
          { label: "New / Pending", value: stats.new, icon: Clock, color: "text-amber-600" },
          { label: "Won / Confirmed", value: stats.won, icon: CheckCircle, color: "text-emerald-600" },
          {
            label: "Pipeline Value",
            value: `$${stats.totalValue.toLocaleString()}`,
            sub: `${stats.conversionRate}% win rate`,
            icon: DollarSign, color: "text-emerald-600"
          },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className={`flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1`}>
              <Icon size={11} className={color} /> {label}
            </div>
            <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
            {sub && <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, package..."
            className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64 bg-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">All Statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
          ))}
        </select>
        {(search || filterStatus !== "all") && (
          <button
            onClick={() => { setSearch(""); setFilterStatus("all"); }}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <X size={12} /> Clear
          </button>
        )}
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Package size={32} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm font-semibold text-slate-400">
              {search || filterStatus !== "all" ? "No bookings match your filters." : "No service booking requests yet."}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Service booking requests will appear here after clients complete the services form.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Package Requested</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Source</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${selected?.id === lead.id ? "bg-indigo-50/40" : ""}`}
                    onClick={() => setSelected(lead)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 text-sm">{lead.name}</div>
                      <div className="text-xs text-slate-500">{lead.email}</div>
                      {lead.phone && <div className="text-xs text-slate-400">{lead.phone}</div>}
                    </td>
                    <td className="px-5 py-3.5 max-w-[220px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-slate-700 truncate">{lead.serviceInterest || "—"}</span>
                        <PriceBadge interest={lead.serviceInterest} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{lead.sourcePage || "—"}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={lead.status} /></td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelected(lead)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg inline-flex transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => { setSelected(lead); }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg inline-flex transition-colors"
                        title="Send Email"
                      >
                        <Mail size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg inline-flex transition-colors"
                        title="Delete"
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

      {/* Detail Panel */}
      {selected && (
        <LeadDetailPanel
          lead={selected}
          siteId={siteId}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
