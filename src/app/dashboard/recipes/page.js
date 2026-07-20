"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Clock, Loader2, AlertCircle } from "lucide-react";

export default function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch("/api/user/recipes");
        const data = await res.json();
        if (!data.error) setRecipes(data.data.recipes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Recipes</h1>
          <p className="text-slate-500 text-sm">Manage the recipes you have submitted</p>
        </div>
        <Link href="/dashboard/recipes/submit" className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold hover:bg-emerald-600 transition">
          <Plus size={16} /> Submit Recipe
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-500" /></div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <p className="text-slate-500 mb-4">You haven't submitted any recipes yet.</p>
          <Link href="/dashboard/recipes/submit" className="text-emerald-500 font-bold hover:underline">Submit your first recipe</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <div key={recipe.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="h-40 bg-slate-100 dark:bg-slate-700">
                {recipe.imageUrl && <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{recipe.title}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                    recipe.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                    recipe.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {recipe.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 border-t border-slate-100 dark:border-slate-700 pt-3">
                  <span className="flex items-center gap-1"><Clock size={12}/> {new Date(recipe.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
