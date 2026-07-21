"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, AlertCircle, Plus, Trash2, Loader2, Save, XCircle, 
  Upload, Image as ImageIcon, ChevronRight, ChevronLeft, LayoutList, 
  Utensils, Info 
} from "lucide-react";

export default function SubmitRecipe() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    title: "", description: "", cookingTime: "", calories: "", difficulty: "Beginner", imageUrl: "",
    protein: "", carbs: "", fiber: "", fat: "", sugar: "", category: "",
    ingredients: [""], steps: [""], allergens: ["None"]
  });

  const handleArrayChange = (field, index, value) => {
    const newArr = [...form[field]];
    newArr[index] = value;
    setForm(f => ({ ...f, [field]: newArr }));
  };
  
  const addField = (field) => setForm(f => ({ ...f, [field]: [...f[field], ""] }));
  const removeField = (field, index) => setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/media/upload", { method: "POST", body: formData });
      const resData = await res.json();
      
      if (resData.error) {
        setError(resData.error);
      } else if (resData.data?.media?.url) {
        setForm(f => ({ ...f, imageUrl: resData.data.media.url }));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload = {
      ...form,
      tags: form.category ? [form.category] : [],
      ingredients: form.ingredients.filter(Boolean),
      steps: form.steps.filter(Boolean),
      nutrition: {
        protein: form.protein,
        carbs: form.carbs,
        fiber: form.fiber,
        fat: form.fat,
        sugar: form.sugar
      }
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
        setSuccess(true);
        setTimeout(() => {
          router.push("/recipes");
        }, 1500);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-slate-50  pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-slate-900  mb-3">Share Your Recipe</h2>
          <p className="text-slate-500  text-lg">Inspire others with your delicious and healthy creations.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center gap-3 font-medium shadow-sm animate-in fade-in slide-in-from-top-4">
            <AlertCircle size={20} /> {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center gap-3 font-medium shadow-sm animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 size={20} /> Recipe submitted successfully for review! Redirecting...
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8 px-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200  rounded-full z-0"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
            
            {[
              { num: 1, label: "Overview", icon: Info },
              { num: 2, label: "Nutrition", icon: Utensils },
              { num: 3, label: "Instructions", icon: LayoutList }
            ].map((s) => (
              <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-md ${step >= s.num ? "bg-emerald-500 text-white shadow-emerald-500/30 scale-110" : "bg-white text-slate-400 border-2 border-slate-200"}`}>
                  <s.icon size={18} />
                </div>
                <span className={`text-xs font-bold absolute -bottom-6 w-24 text-center transition-colors ${step >= s.num ? "text-emerald-600 " : "text-slate-400"}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white  rounded-[2rem] p-6 md:p-10 shadow-xl shadow-slate-200/40  border border-slate-100  w-full relative overflow-hidden mt-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* STEP 1 */}
            <div className={`transition-all duration-500 ${step === 1 ? "opacity-100 translate-x-0 block" : "opacity-0 translate-x-8 hidden"}`}>
              <h3 className="text-xl font-bold text-slate-800  mb-6 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-600 p-2 rounded-xl"><Info size={20}/></span> 
                Basic Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2 group">
                  <label className="block text-sm font-semibold text-slate-700  mb-2 transition-colors group-focus-within:text-emerald-500">Recipe Title</label>
                  <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-50  border border-slate-200  rounded-xl px-4 py-3 text-slate-800  focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all hover:border-slate-300" placeholder="e.g. Avocado Toast with Poached Egg" />
                </div>
                <div className="col-span-1 md:col-span-2 group">
                  <label className="block text-sm font-semibold text-slate-700  mb-2 transition-colors group-focus-within:text-emerald-500">Description</label>
                  <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-slate-50  border border-slate-200  rounded-xl px-4 py-3 text-slate-800  focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all hover:border-slate-300 resize-none" rows={3} placeholder="Tell us a bit about this recipe..."></textarea>
                </div>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700  mb-2 transition-colors group-focus-within:text-emerald-500">Recipe Image</label>
                  <div className="flex gap-2">
                    <input type="text" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="flex-1 min-w-0 bg-slate-50  border border-slate-200  rounded-xl px-4 py-3 text-slate-800  focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all hover:border-slate-300" placeholder="URL or Upload ->" />
                    <label className="bg-white shrink-0 border-2 border-slate-200  hover:border-emerald-500 hover:text-emerald-600 text-slate-600  px-4 sm:px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center transition-all shadow-sm cursor-pointer whitespace-nowrap">
                      {uploadingImage ? <Loader2 size={18} className="mr-1 sm:mr-2 animate-spin shrink-0" /> : <Upload size={18} className="mr-1 sm:mr-2 shrink-0" />} 
                      <span className="hidden sm:inline">{uploadingImage ? "Uploading..." : "Upload"}</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700  mb-2 transition-colors group-focus-within:text-emerald-500">Category</label>
                  <input type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-slate-50  border border-slate-200  rounded-xl px-4 py-3 text-slate-800  focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all hover:border-slate-300" placeholder="e.g. Breakfast, Dinner, Vegan" />
                </div>
              </div>
            </div>

            {/* STEP 2 */}
            <div className={`transition-all duration-500 ${step === 2 ? "opacity-100 translate-x-0 block" : "opacity-0 translate-x-8 hidden"}`}>
              <h3 className="text-xl font-bold text-slate-800  mb-6 flex items-center gap-2">
                <span className="bg-amber-100 text-amber-600 p-2 rounded-xl"><Utensils size={20}/></span> 
                Details & Nutrition
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700  mb-2 transition-colors group-focus-within:text-emerald-500">Time (mins)</label>
                  <input type="number" value={form.cookingTime} onChange={e => setForm({...form, cookingTime: e.target.value})} className="w-full bg-slate-50  border border-slate-200  rounded-xl px-4 py-3 text-slate-800  focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all hover:border-slate-300" />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700  mb-2 transition-colors group-focus-within:text-emerald-500">Difficulty</label>
                  <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})} className="w-full bg-slate-50  border border-slate-200  rounded-xl px-4 py-3 text-slate-800  focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all hover:border-slate-300">
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700  mb-2 transition-colors group-focus-within:text-emerald-500">Calories</label>
                  <input type="number" value={form.calories} onChange={e => setForm({...form, calories: e.target.value})} className="w-full bg-slate-50  border border-slate-200  rounded-xl px-4 py-3 text-slate-800  focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all hover:border-slate-300" />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700  mb-2 transition-colors group-focus-within:text-emerald-500">Protein (g)</label>
                  <input type="number" value={form.protein} onChange={e => setForm({...form, protein: e.target.value})} className="w-full bg-slate-50  border border-slate-200  rounded-xl px-4 py-3 text-slate-800  focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all hover:border-slate-300" />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700  mb-2 transition-colors group-focus-within:text-emerald-500">Carbs (g)</label>
                  <input type="number" value={form.carbs} onChange={e => setForm({...form, carbs: e.target.value})} className="w-full bg-slate-50  border border-slate-200  rounded-xl px-4 py-3 text-slate-800  focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all hover:border-slate-300" />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700  mb-2 transition-colors group-focus-within:text-emerald-500">Fat (g)</label>
                  <input type="number" value={form.fat} onChange={e => setForm({...form, fat: e.target.value})} className="w-full bg-slate-50  border border-slate-200  rounded-xl px-4 py-3 text-slate-800  focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all hover:border-slate-300" />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700  mb-2 transition-colors group-focus-within:text-emerald-500">Fiber (g)</label>
                  <input type="number" value={form.fiber} onChange={e => setForm({...form, fiber: e.target.value})} className="w-full bg-slate-50  border border-slate-200  rounded-xl px-4 py-3 text-slate-800  focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all hover:border-slate-300" />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700  mb-2 transition-colors group-focus-within:text-emerald-500">Sugar (g)</label>
                  <input type="number" value={form.sugar} onChange={e => setForm({...form, sugar: e.target.value})} className="w-full bg-slate-50  border border-slate-200  rounded-xl px-4 py-3 text-slate-800  focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all hover:border-slate-300" />
                </div>
              </div>
            </div>

            {/* STEP 3 */}
            <div className={`transition-all duration-500 ${step === 3 ? "opacity-100 translate-x-0 block" : "opacity-0 translate-x-8 hidden"}`}>
               <h3 className="text-xl font-bold text-slate-800  mb-6 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-600 p-2 rounded-xl"><LayoutList size={20}/></span> 
                Ingredients & Steps
              </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 {/* Ingredients */}
                 <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-semibold text-slate-700 ">Ingredients</label>
                      <button type="button" onClick={() => addField("ingredients")} className="text-xs text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-bold transition-colors">+ Add Item</button>
                    </div>
                    <div className="space-y-3">
                      {form.ingredients.map((ing, i) => (
                        <div key={i} className="flex gap-2 animate-in slide-in-from-left-4 fade-in">
                          <input type="text" value={ing} onChange={e => handleArrayChange("ingredients", i, e.target.value)} placeholder="e.g. 1 cup quinoa" className="w-full bg-slate-50  border border-slate-200  rounded-xl px-4 py-2.5 text-slate-800  focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" />
                          <button type="button" onClick={() => removeField("ingredients", i)} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                        </div>
                      ))}
                    </div>
                 </div>

                 {/* Steps */}
                 <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-semibold text-slate-700 ">Instructions</label>
                      <button type="button" onClick={() => addField("steps")} className="text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-bold transition-colors">+ Add Step</button>
                    </div>
                    <div className="space-y-3">
                      {form.steps.map((step, i) => (
                        <div key={i} className="flex gap-2 animate-in slide-in-from-left-4 fade-in">
                          <div className="w-8 h-10 flex items-center justify-center font-bold text-slate-400 shrink-0">{i + 1}.</div>
                          <input type="text" value={step} onChange={e => handleArrayChange("steps", i, e.target.value)} placeholder="e.g. Boil water" className="w-full bg-slate-50  border border-slate-200  rounded-xl px-4 py-2.5 text-slate-800  focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
                          <button type="button" onClick={() => removeField("steps", i)} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                        </div>
                      ))}
                    </div>
                 </div>
               </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between pt-8 mt-4 border-t border-slate-100  items-center">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-2">
                  <ChevronLeft size={16} /> Back
                </button>
              ) : (
                <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
              )}

              {step < 3 ? (
                <button type="button" onClick={nextStep} className="bg-slate-900 hover:bg-slate-800   text-white px-7 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  Next Step <ChevronRight size={16} />
                </button>
              ) : (
                <button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Submit Recipe
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
