      }
    };

    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-site-id": siteId },
        body: JSON.stringify(updatedSettings)
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleArrayChange = (setter, index, value, arr) => {
    const newArr = [...arr];
    newArr[index] = value;
    setter(newArr);
  };
  const addArrayItem = (setter, arr) => setter([...arr, ""]);
  const removeArrayItem = (setter, index, arr) => {
    if (arr.length > 1) {
      const newArr = [...arr];
      newArr.splice(index, 1);
      setter(newArr);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <form onSubmit={handleSave} className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-8">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between sticky top-0 bg-white z-10 pt-2">
          <div>
            <h3 className="font-heading font-extrabold text-slate-800 text-lg">Healthy Bite CMS</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Manage all recipe content for the dashboard.</p>
          </div>
          <button type="submit" disabled={saving} className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-xl transition shadow-sm ${saved ? "bg-emerald-500 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2">Section 1: Overview</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1"><label className="block text-xs font-bold text-slate-500">Widget Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg" /></div>
            <div className="space-y-1"><label className="block text-xs font-bold text-slate-500">Recipe Name</label><input type="text" value={recipeName} onChange={e => setRecipeName(e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg" /></div>
        </div>

        {adminLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" /></div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Recipe</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Contributor</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredAdmin.map(recipe => (
                    <tr key={recipe.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                            {recipe.imageUrl && <img src={recipe.imageUrl} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{recipe.title}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <Link href={`/recipes/${recipe.id}`} target="_blank" className="hover:text-emerald-500 flex items-center gap-1"><ExternalLink size={12}/> View Page</Link>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{recipe.contributor?.name || "Unknown User"}</div>
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
                            <button onClick={() => updateStatus(recipe.id, 'APPROVED')} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve">
                              <CheckCircle size={18} />
                            </button>
                          )}
                          {recipe.status !== 'REJECTED' && (
                            <button onClick={() => updateStatus(recipe.id, 'REJECTED')} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Reject">
                              <XCircle size={18} />
                            </button>
                          )}
                          <button onClick={() => deleteRecipe(recipe.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAdmin.length === 0 && (
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
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Search, CheckCircle, XCircle, Trash2, ExternalLink, Check, Save, X, Plus, Upload, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import MediaPickerModal from "@/components/media/MediaPickerModal";
import { useSession } from "next-auth/react";

// ─── Healthy Bite Panel ──────────────────────────────────────────────────────

function HealthyBitePanel({ siteId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [title, setTitle] = useState("Healthy Bite of the Day");
  const [recipeName, setRecipeName] = useState("Quinoa & Avocado Power Bowl");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("/images/healthy_bite.png");
  const [difficulty, setDifficulty] = useState("Easy");
  const [category, setCategory] = useState("Breakfast");
  const [recipeLink, setRecipeLink] = useState("/recipes/healthy-bite-of-the-day");
  
  const [time, setTime] = useState("15 mins");
  const [calories, setCalories] = useState("320 kcal");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [fiber, setFiber] = useState("");
  const [points, setPoints] = useState("High in Protein, Gut Friendly, Quick & Easy");

  const [contributorName, setContributorName] = useState("");
  const [contributorRole, setContributorRole] = useState("");
  const [contributorAvatar, setContributorAvatar] = useState("");

  const [ingredients, setIngredients] = useState([""]);
  const [instructions, setInstructions] = useState([""]);
  const [allergens, setAllergens] = useState([""]);
  const [relatedRecipes, setRelatedRecipes] = useState("");

  const [displayEnabled, setDisplayEnabled] = useState(true);
  const [showBadges, setShowBadges] = useState(true);

  const [fullWebsiteSettings, setFullWebsiteSettings] = useState({});

  useEffect(() => {
    if (!siteId) return;
    setLoading(true);
    fetch("/api/dashboard/settings", { headers: { "x-site-id": siteId } })
      .then(res => res.ok ? res.json() : {})
      .then(resData => {
        const dataObj = resData.data?.websiteSettings || resData.websiteSettings || {};
        setFullWebsiteSettings(dataObj);
        if (dataObj.wellnessBanner?.healthyBite) {
          const hb = dataObj.wellnessBanner.healthyBite;
          setTitle(hb.title || "Healthy Bite of the Day");
          setRecipeName(hb.recipeName || "");
          setDescription(hb.description || "");
          setImage(hb.image || "");
          setDifficulty(hb.difficulty || "");
          setCategory(hb.category || "");
          setRecipeLink(hb.recipeLink || "");
          
          setTime(hb.time || "");
          setCalories(hb.calories || "");
          setProtein(hb.protein || "");
          setCarbs(hb.carbs || "");
          setFat(hb.fat || "");
          setFiber(hb.fiber || "");
          setPoints(Array.isArray(hb.points) ? hb.points.join(", ") : (hb.points || ""));
          
          setContributorName(hb.contributorName || "");
          setContributorRole(hb.contributorRole || "");
          setContributorAvatar(hb.contributorAvatar || "");
          
          setIngredients(hb.ingredients?.length ? hb.ingredients : [""]);
          setInstructions(hb.instructions?.length ? hb.instructions : [""]);
          setAllergens(hb.allergens?.length ? hb.allergens : [""]);
          setRelatedRecipes(hb.relatedRecipes || "");
          
          if (hb.displayEnabled !== undefined) setDisplayEnabled(hb.displayEnabled);
          if (hb.showBadges !== undefined) setShowBadges(hb.showBadges);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [siteId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const pointsArray = points.split(",").map(p => p.trim()).filter(Boolean);
    
    const updatedSettings = {
      ...fullWebsiteSettings,
      wellnessBanner: {
        ...(fullWebsiteSettings.wellnessBanner || { enabled: true }),
        healthyBite: {
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default function RecipesDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("moderation");
  const [showAddModal, setShowAddModal] = useState(false);
  const siteId = typeof window !== "undefined" ? localStorage.getItem("x-site-id") : null;
  const isAdminOrEditor = session?.user?.globalRole === "SUPERADMIN" || session?.user?.globalRole === "ADMIN" || session?.user?.globalRole === "EDITOR";
  
  const [adminRecipes, setAdminRecipes] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");

  const fetchAdminRecipes = async () => {
    setAdminLoading(true);
    try {
      const res = await fetch("/api/admin/recipes", { cache: 'no-store' });
      const data = await res.json();
      if (!data.error) setAdminRecipes(data.data.recipes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminOrEditor) {
      fetchAdminRecipes();
    }
  }, [isAdminOrEditor]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/recipes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to update status'}`);
        return;
      }
      fetchAdminRecipes();
    } catch (err) {
      console.error(err);
      alert('Failed to update status due to network error');
    }
  };

  const deleteRecipe = async (id) => {
    if (!confirm("Are you sure you want to delete this recipe permanently?")) return;
    try {
      await fetch(`/api/admin/recipes/${id}`, { method: "DELETE" });
      fetchAdminRecipes();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAdminOrEditor) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Access Denied</h1>
        <p className="text-slate-500 mt-2">You do not have permission to view the recipe moderation dashboard.</p>
      </div>
    );
  }

  const filteredAdmin = adminRecipes.filter(r => {
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Recipes Moderation & Healthy Bite</h1>
          <p className="text-slate-500 text-sm">Review and moderate community recipes or edit the Healthy Bite.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors mt-4 sm:mt-0">
          <Plus size={16} />
          Add Recipe
        </button>
      </div>

      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-4">
        {[
