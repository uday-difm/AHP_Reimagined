"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Loader2, Clock, Flame, Tag as TagIcon, ChefHat } from "lucide-react";

export default function RecipesGallery() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const categories = ["Breakfast", "Lunch", "Dinner", "Vegetarian", "Vegan", "High Protein", "Gluten Free", "Ayurvedic"];

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("q", search);
      if (category) params.append("category", category);

      const res = await fetch(`/api/recipes?${params.toString()}`);
      const data = await res.json();
      if (!data.error) {
        setRecipes(data.data.recipes || []);
      }
    } catch (err) {
      console.error("Error fetching recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [category]); // re-fetch when category changes

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecipes();
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Community <span className="text-emerald-500">Recipes</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Discover and share healthy, delicious recipes from our wellness community.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-10 space-y-6">
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search for ingredients, dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 shadow-sm focus:outline-none transition-all text-slate-900 dark:text-white"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition">
              Search
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setCategory("")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${category === ""
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${category === cat
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
            <p className="text-slate-500 font-medium">Loading delicious recipes...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <ChefHat size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No recipes found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {recipes.map((recipe) => (
              <Link href={`/recipes/${recipe.id}`} key={recipe.id} className="group flex flex-col bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-56 overflow-hidden bg-slate-200 dark:bg-slate-700">
                  {recipe.imageUrl ? (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat size={40} className="text-slate-400" />
                    </div>
                  )}
                  {recipe.difficulty && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full text-xs font-bold text-slate-900 dark:text-white shadow-sm">
                      {recipe.difficulty}
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-500 transition-colors">
                    {recipe.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">
                    {recipe.cookingTime && (
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-emerald-500" /> {recipe.cookingTime} mins</span>
                    )}
                    {recipe.calories && (
                      <span className="flex items-center gap-1.5"><Flame size={14} className="text-orange-500" /> {recipe.calories} kcal</span>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-6 flex-1">
                    {recipe.description || "A delicious recipe shared by our community."}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex flex-wrap gap-2">
                      {recipe.tags && recipe.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <TagIcon size={10} /> {tag.name}
                        </span>
                      ))}
                      {recipe.tags && recipe.tags.length > 2 && (
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded text-[10px] font-bold">
                          +{recipe.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
