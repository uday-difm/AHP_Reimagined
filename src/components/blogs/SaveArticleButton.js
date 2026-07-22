"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";

export default function SaveArticleButton({ postId }) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSavedStatus();
  }, [postId]);

  const checkSavedStatus = async () => {
    try {
      const res = await fetch("/api/user/saved-articles");
      if (res.ok) {
        const data = await res.json();
        const saved = data?.data?.articles?.some((article) => article.id === postId);
        setIsSaved(!!saved);
      }
    } catch (err) {
      console.error("Failed to check saved status", err);
    }
  };

  const toggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    setLoading(true);

    try {
      if (isSaved) {
        const res = await fetch(`/api/user/saved-articles?postId=${postId}`, { method: "DELETE" });
        if (res.ok) {
          setIsSaved(false);
        }
      } else {
        const res = await fetch("/api/user/saved-articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        });
        if (res.ok) {
          setIsSaved(true);
        } else if (res.status === 401) {
          window.location.href = "/login";
        }
      }
    } catch (err) {
      console.error("Failed to toggle save status", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleSave}
      disabled={loading}
      className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        isSaved 
          ? "bg-[#0F766E] text-white shadow-md" 
          : "bg-white/80 backdrop-blur-sm text-slate-500 hover:bg-white hover:text-[#0F766E] shadow-sm"
      }`}
      aria-label={isSaved ? "Remove from saved articles" : "Save article"}
    >
      <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
    </button>
  );
}
