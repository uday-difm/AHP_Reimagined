"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function DashboardLayout({ children, siteId, sites = [] }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isLoginPage = pathname.includes("/dashboard/login");

  useEffect(() => {
    setMounted(true);
    if (siteId && typeof window !== "undefined") {
      localStorage.setItem("x-site-id", siteId);
    }
  }, [siteId]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!mounted || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium animate-pulse">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        siteId={siteId}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          siteId={siteId}
          sites={sites}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-grow p-4 sm:p-6 overflow-y-auto">{children}</main>
        <style>{`
                  /* Base Backgrounds */
                  .dark .dashboard-layout,
                  .dark .dashboard-layout main { background-color: #020617 !important; }
                  
                  /* Sidebar & Navbar */
                  .dark .dashboard-layout aside,
                  .dark .dashboard-layout header,
                  .dark .dashboard-layout .bg-white.dark\\:bg-slate-950 { background-color: #0F172A !important; }
                  
                  /* Cards & Panels */
                  .dark .dashboard-layout :where(.dark\\:bg-slate-800, .dark\\:bg-slate-900, .bg-white, .bg-gray-50, .bg-slate-50, .bg-gray-100, .bg-slate-100, .bg-gray-200) { background-color: #1E293B !important; }
                  .dark .dashboard-layout :where(.bg-gray-50\\/50, .bg-slate-50\\/50 , .bg-blue-50\\/50) { background-color: #0F172A !important; }
                  
                  /* Borders */
                  .dark .dashboard-layout :where(td, th, .border-gray-100, .border-gray-200, .border-gray-300, .border-gray-150, .border-slate-100, .border-slate-200, .border-slate-300, .dark\\:border-slate-700, .dark\\:border-slate-800, .dark\\:border-slate-900) { border-color: #334155 !important; }
                  .dark .dashboard-layout :where(.divide-gray-100, .divide-gray-150, .divide-slate-100) > * { border-color: #334155 !important; }
                  
                  /* Headings & High Contrast Text */
                  .dark .dashboard-layout :where(h1, h2, h3, h4, h5, h6, .text-gray-900, .text-slate-900, .dark\\:text-slate-100, .dark\\:text-white) { color: #F8FAFC !important; }
                  
                  /* Body Text */
                  .dark .dashboard-layout :where(.text-gray-800, .text-slate-800, .text-gray-700, .text-slate-700, .dark\\:text-slate-200, .dark\\:text-slate-300, .text-slate-900.dark\\:text-slate-100) { color: #CBD5E1 !important; }
                  
                  /* Muted Text */
                  .dark .dashboard-layout :where(.text-gray-600, .text-slate-600, .text-gray-500, .text-slate-500, .text-gray-400, .text-slate-400, .dark\\:text-slate-400, .dark\\:text-slate-500) { color: #94A3B8 !important; }
                  
                  /* Primary Accent (Emerald) overrides for Indigo/Blue */
                  .dark .dashboard-layout :where(.text-blue-600, .text-blue-700, .text-blue-900, .text-indigo-600, .text-indigo-700, .text-indigo-800, .dark\\:text-indigo-300, .dark\\:text-indigo-400) { color: #10B981 !important; }
                  .dark .dashboard-layout :where(.hover\\:text-indigo-800):hover,
                  .dark .dashboard-layout :where(.hover\\:text-blue-800):hover { color: #34D399 !important; }
                  
                  .dark .dashboard-layout :where(.bg-indigo-600, .bg-indigo-700, .bg-blue-600, .bg-blue-700, .dark\\:bg-indigo-500, .dark\\:bg-indigo-600) { background-color: #10B981 !important; color: #F8FAFC !important; }
                  .dark .dashboard-layout :where(.hover\\:bg-blue-700):hover,
                  .dark .dashboard-layout :where(.hover\\:bg-indigo-700):hover { background-color: #059669 !important; color: #F8FAFC !important; }
                  
                  .dark .dashboard-layout :where(.bg-indigo-50, .dark\\:bg-indigo-900\\/50, .dark\\:bg-indigo-950\\/40, .dark\\:bg-indigo-900\\/20) { background-color: rgba(16, 185, 129, 0.1) !important; color: #10B981 !important; border-color: rgba(16, 185, 129, 0.2) !important; }
                  
                  /* Other Accents */
                  .dark .dashboard-layout :where(.text-green-600, .text-green-700) { color: #10B981 !important; }
                  .dark .dashboard-layout :where(.text-amber-600, .text-amber-700) { color: #fbbf24 !important; }
                  .dark .dashboard-layout :where(.text-red-600, .text-red-700) { color: #f87171 !important; }
                  
                  /* Inputs & Forms */
                  .dark .dashboard-layout :where(input:not([type="checkbox"]):not([type="radio"]), textarea, select) {
                    background-color: #1E293B !important;
                    color: #CBD5E1 !important;
                    border-color: #334155 !important;
                  }
                  .dark .dashboard-layout :where(input::placeholder, textarea::placeholder) { color: #94A3B8 !important; }
                  
                  /* Hover States & Active Rows */
                  .dark .dashboard-layout :where(.hover\\:bg-gray-50\\/50):hover,
                  .dark .dashboard-layout :where(.hover\\:bg-gray-50):hover,
                  .dark .dashboard-layout :where(.hover\\:bg-slate-50):hover,
                  .dark .dashboard-layout :where(.hover\\:bg-gray-100):hover,
                  .dark .dashboard-layout :where(.hover\\:bg-slate-100):hover,
                  .dark .dashboard-layout :where(.hover\\:bg-gray-200):hover,
                  .dark .dashboard-layout :where(.hover\\:bg-slate-200):hover,
                  .dark .dashboard-layout :where(.dark\\:hover\\:bg-slate-800):hover,
                  .dark .dashboard-layout :where(.dark\\:hover\\:bg-slate-900):hover { background-color: #334155 !important; color: #F8FAFC !important; }
                  
                  .dark .dashboard-layout :where(.hover\\:bg-indigo-50\\/10):hover { background-color: rgba(16, 185, 129, 0.15) !important; }
                  
                  /* Shadows */
                  .dark .dashboard-layout :where(.shadow-sm, .shadow, .shadow-md) { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5) !important; }
                `}</style>
      </div>
    </div>
  );
}
