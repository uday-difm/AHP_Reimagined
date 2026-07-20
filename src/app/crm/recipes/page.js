"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Search, CheckCircle, XCircle, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function CRMRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");

  const fetchRecipes = async () => {
    try {
      const res = await fetch("/api/admin/recipes");
      const data = await res.json();
      if (!data.error) setRecipes(data.data.recipes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await fetch(`/api/admin/recipes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      fetchRecipes();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRecipe = async (id) => {
    if (!confirm("Are you sure you want to delete this recipe permanently?")) return;
    try {
      await fetch(`/api/admin/recipes/${id}`, { method: "DELETE" });
      fetchRecipes();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = recipes.filter(r => {
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Recipe Moderation</h1>
          <p className="text-slate-500 text-sm">Review, approve, and manage community recipes</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          {["PENDING", "APPROVED", "REJECTED", "ALL"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === status ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" /></div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Recipe</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Contributor</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map(recipe => (
                  <tr key={recipe.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                          {recipe.imageUrl && <img src={recipe.imageUrl} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{recipe.title}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Link href={`/recipes/${recipe.id}`} target="_blank" className="hover:text-emerald-500 flex items-center gap-1"><ExternalLink size={12}/> View Page</Link>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{recipe.contributor?.name}</div>
                      <div className="text-xs text-slate-500">{recipe.contributor?.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${
                        recipe.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        recipe.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {recipe.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {recipe.status !== 'APPROVED' && (
                          <button onClick={() => updateStatus(recipe.id, 'APPROVED')} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg" title="Approve">
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {recipe.status !== 'REJECTED' && (
                          <button onClick={() => updateStatus(recipe.id, 'REJECTED')} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg" title="Reject">
                            <XCircle size={18} />
                          </button>
                        )}
                        <button onClick={() => deleteRecipe(recipe.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">No recipes found matching your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
