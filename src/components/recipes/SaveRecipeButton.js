"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Bookmark } from "lucide-react";

export default function SaveRecipeButton({ recipeId, className = "w-10 h-10 rounded-full" }) {
  const { data: session } = useSession();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session || !recipeId) return;
    
    // Check if recipe is already saved
    const checkSavedStatus = async () => {
      try {
        const res = await fetch("/api/user/saved-recipes");
        if (res.ok) {
          const data = await res.json();
          if (data?.data?.recipes) {
            const saved = data.data.recipes.some(r => r.id === recipeId);
            setIsSaved(saved);
          }
        }
      } catch (err) {
        console.error("Error checking saved status", err);
      }
    };
    checkSavedStatus();
  }, [session, recipeId]);

  const toggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      alert("Please log in to save recipes");
      return;
    }

    if (!recipeId) return;

    setLoading(true);
    try {
      if (isSaved) {
        // Unsave
        const res = await fetch(`/api/user/saved-recipes?recipeId=${recipeId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setIsSaved(false);
        } else {
          throw new Error("Failed to unsave");
        }
      } else {
        // Save
        const res = await fetch("/api/user/saved-recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId }),
        });
        if (res.ok) {
          setIsSaved(true);
        } else {
          throw new Error("Failed to save");
        }
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving the recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleSave}
      disabled={loading}
      className={`relative flex items-center justify-center transition-all shadow-sm z-20 ${className} ${
        isSaved 
          ? "text-[#ff3b6a] bg-[#ff3b6a]/10 hover:bg-[#ff3b6a]/20 border border-[#ff3b6a]/30" 
          : "text-slate-400 bg-white hover:bg-slate-50 border border-slate-200"
      }`}
      title={isSaved ? "Unsave recipe" : "Save recipe"}
    >
      <Bookmark 
        size={18} 
        className={`transition-all duration-300 ${isSaved ? "fill-current scale-110" : "scale-100"}`} 
      />
    </button>
  );
}
