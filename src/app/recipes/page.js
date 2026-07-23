"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Loader2, Clock, Flame, Tag as TagIcon, ChefHat, Sparkles, ChevronRight } from "lucide-react";

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
    <main className="min-h-screen relative pt-0 pb-24 font-sans selection:bg-emerald-500/30 bg-white">
      {/* Background Image that fades into white */}
      <div className="absolute inset-0 z-0 w-full h-[900px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/images/CommunityRecipe.png")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/80 to-white"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24">

        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex flex-col items-center justify-center mb-4">
            {/* Custom Leaf Icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 mb-1">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
            <span className="text-emerald-500 italic font-serif text-2xl drop-shadow-sm">Discover</span>
          </div>
          
          <h1 className="hero-title text-slate-900 mb-4 drop-shadow-sm">
            Healthy Recipes
          </h1>
          
          <p className="description text-slate-600 max-w-sm mx-auto drop-shadow-sm">
            Nutritious, delicious and easy-to-make meals<br/>for a healthier you
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-20 space-y-6">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center bg-slate-800 rounded-full p-1.5 shadow-xl transition-all focus-within:ring-4 focus-within:ring-emerald-500/20">
              <Search className="text-slate-400 ml-4 shrink-0" size={20} />
              <input
                type="text"
                placeholder="Search for ingredients, dishes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-0 text-sm"
              />
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-2.5 rounded-full font-bold transition-colors shrink-0 text-sm md:text-base">
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            <button
              onClick={() => setCategory("")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 shadow-md ${category === ""
                ? "bg-emerald-500 text-white"
                : "bg-slate-800 text-white hover:bg-slate-700 hover:scale-105"
                }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 shadow-md ${category === cat
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-800 text-white hover:bg-slate-700 hover:scale-105"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Separator / Section Title */}
        <div className="text-center mt-20 mb-14">
          <div className="flex justify-center mb-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
               {/* Custom Bowl Icon */}
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                  <path d="M2 12h20"/>
                  <path d="M4 12v2a8 8 0 0 0 16 0v-2"/>
                  <path d="M10 6.5a2.5 2.5 0 0 0 4 0"/>
                  <path d="M12 2v2"/>
               </svg>
            </div>
          </div>
          <h2 className="main-heading text-slate-900 mb-4">Popular Healthy Recipes</h2>
          <div className="flex items-center justify-center gap-4 text-slate-500 text-sm font-medium">
            <div className="h-px bg-emerald-200 w-16"></div>
            <span>Explore wholesome meals from our community</span>
            <div className="h-px bg-emerald-200 w-16"></div>
          </div>
        </div>

        {/* Recipe Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-600 font-bold text-sm animate-pulse">Loading delicious recipes...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-slate-100 max-w-2xl mx-auto">
            <ChefHat size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No recipes found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <Link href={`/recipes/${recipe.id}`} key={recipe.id} className="group flex flex-col bg-white rounded-[1.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-slate-100 transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-56 overflow-hidden bg-slate-100">
                  {recipe.imageUrl ? (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                      <ChefHat size={40} className="text-slate-300" />
                    </div>
                  )}
                  
                  {recipe.difficulty && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-white rounded-full text-[10px] font-extrabold text-slate-900 shadow-sm uppercase tracking-wider">
                      {recipe.difficulty}
                    </div>
                  )}
                  
                  {/* Bookmark Action */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-600 hover:text-emerald-500 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col relative z-10">
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 mb-3">
                    {recipe.cookingTime && (
                      <span className="flex items-center gap-1"><Clock size={12} className="text-emerald-500" /> {recipe.cookingTime} min</span>
                    )}
                    {recipe.calories && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="flex items-center gap-1"><Flame size={12} className="text-orange-400" /> {recipe.calories} kcal</span>
                      </>
                    )}
                  </div>

                  <h3 className="card-title text-slate-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {recipe.title}
                  </h3>

                  <p className="description text-slate-500 line-clamp-2 mb-5 flex-1">
                    {recipe.description || "A delicious, healthy recipe thoughtfully shared by our wellness community."}
                  </p>

                  <div className="mt-auto">
                    {recipe.tags && recipe.tags.length > 0 ? (
                      <span className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-fit shadow-sm">
                        <TagIcon size={10} className="text-slate-400" /> {recipe.tags[0].name}
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-fit shadow-sm">
                        <TagIcon size={10} className="text-slate-400" /> Recipe
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom Button */}
        {!loading && recipes.length > 0 && (
          <div className="mt-14 text-center">
            <Link href="/recipes" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-600 transition-colors text-sm md:text-base shadow-md hover:shadow-lg">
              Explore More Recipes <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
