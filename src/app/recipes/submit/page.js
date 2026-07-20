"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";

export default function SubmitRecipe() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", description: "", cookingTime: "", calories: "", difficulty: "Beginner", imageUrl: "",
    ingredients: [""], steps: [""], tags: "", allergens: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ALLERGENS = ["Contains Nuts", "Contains Dairy", "Contains Gluten", "Contains Soy", "Contains Eggs", "Contains Sesame", "None"];

  const handleArrayChange = (field, index, value) => {
    const newArr = [...form[field]];
    newArr[index] = value;
    setForm(f => ({ ...f, [field]: newArr }));
  };
  
  const addField = (field) => setForm(f => ({ ...f, [field]: [...f[field], ""] }));
  const removeField = (field, index) => setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }));

  const toggleAllergen = (a) => {
    if (a === "None") return setForm(f => ({ ...f, allergens: ["None"] }));
    setForm(f => ({
      ...f, 
      allergens: f.allergens.includes(a) 
        ? f.allergens.filter(x => x !== a) 
        : [...f.allergens.filter(x => x !== "None"), a]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...form,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      ingredients: form.ingredients.filter(Boolean),
      steps: form.steps.filter(Boolean)
    };

    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        alert("Recipe submitted successfully for review!");
        router.push("/recipes");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Submit a Recipe</h1>
      <p className="text-slate-500 mb-8">Share your healthy creations with the community.</p>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Recipe Title</label>
            <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700" rows={3}></textarea>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Time (mins)</label>
              <input type="number" value={form.cookingTime} onChange={e => setForm({...form, cookingTime: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Calories</label>
              <input type="number" value={form.calories} onChange={e => setForm({...form, calories: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
              <input type="text" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700" placeholder="https://..." />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Ingredients</label>
          {form.ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input type="text" required value={ing} onChange={e => handleArrayChange("ingredients", i, e.target.value)} className="flex-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700" placeholder="e.g. 1 cup quinoa" />
              <button type="button" onClick={() => removeField("ingredients", i)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
            </div>
          ))}
          <button type="button" onClick={() => addField("ingredients")} className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-2"><Plus size={14}/> Add Ingredient</button>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Steps</label>
          {form.steps.map((step, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <textarea required value={step} onChange={e => handleArrayChange("steps", i, e.target.value)} className="flex-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700" placeholder="e.g. Boil water..."></textarea>
              <button type="button" onClick={() => removeField("steps", i)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
            </div>
          ))}
          <button type="button" onClick={() => addField("steps")} className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-2"><Plus size={14}/> Add Step</button>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tags (comma separated)</label>
          <input type="text" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700" placeholder="e.g. Vegan, Breakfast, Gluten Free" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Allergens</label>
          <div className="flex flex-wrap gap-2">
            {ALLERGENS.map(a => (
              <button type="button" key={a} onClick={() => toggleAllergen(a)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                form.allergens.includes(a) ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
              }`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
          <button disabled={loading} type="submit" className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? "Submitting..." : <><CheckCircle2 size={18}/> Submit for Review</>}
          </button>
        </div>

      </form>
    </div>
  );
}
