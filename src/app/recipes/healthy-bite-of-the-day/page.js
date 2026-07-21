'use client';

import Link from 'next/link';
import { ArrowLeft, Heart, Share2, ChefHat, Flame, Clock, Tag as TagIcon, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function RecipePage() {
  const [saved, setSaved] = useState(false);

  const recipe = {
    title: 'Quinoa & Avocado Power Bowl',
    description: 'A delicious, healthy, and easy to make recipe that is perfect for any time of the day. Packed with nutrients and flavor. This quinoa bowl is loaded with fresh vegetables, creamy avocado, and a light lemon dressing.',
    cookingTime: 15,
    difficulty: 'Easy',
    calories: 320,
    imageUrl: '/images/healthy_bite.png',
    ingredients: [
      '1 cup cooked quinoa',
      '1/2 avocado, sliced',
      '1/2 cup cherry tomatoes, halved',
      '1/4 cup cucumber, diced',
      '1/4 cup chickpeas, rinsed',
      '1 tbsp pumpkin seeds',
      'Lemon vinaigrette to taste'
    ],
    steps: [
      'Prepare the quinoa according to package instructions and let it cool slightly.',
      'In a bowl, arrange the quinoa at the base.',
      'Top with avocado slices, cherry tomatoes, cucumber, and chickpeas.',
      'Sprinkle pumpkin seeds over the top.',
      'Drizzle with your favorite lemon vinaigrette and serve immediately.'
    ],
    tags: [
      { name: 'High in Protein' },
      { name: 'Gut Friendly' },
      { name: 'Quick & Easy' }
    ],
    allergens: [],
    contributor: { name: 'Sarah Jenkins' }
  };

  return (
    <main className="min-h-screen bg-[#f9f9f9] pt-24 pb-20 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Top Nav */}
        <div className="mb-6 flex justify-between items-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#0f7c85] transition-colors">
            <ArrowLeft size={16} /> Back to home
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => setSaved(!saved)}
              className="p-2 bg-white rounded-full text-slate-400 hover:text-rose-500 hover:scale-110 transition shadow-sm border border-slate-200"
            >
              <Heart size={18} className={saved ? "fill-rose-500 text-rose-500" : ""} />
            </button>
            <button className="p-2 bg-white rounded-full text-slate-400 hover:text-[#0f7c85] hover:scale-110 transition shadow-sm border border-slate-200">
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-10 flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 h-72 md:h-auto relative bg-slate-100">
            {recipe.imageUrl ? (
              <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100">
                <ChefHat size={64} className="text-slate-300" />
              </div>
            )}
            <div className="absolute top-6 left-6">
              <span className="bg-[#ff3b6a] text-white text-[10px] font-extrabold uppercase tracking-wider px-4 py-2 rounded-full shadow-sm flex items-center gap-1.5 w-max">
                <Flame size={14} />
                HEALTHY BITE OF THE DAY
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:bg-gradient-to-r md:from-transparent md:to-white/90" />
          </div>

          <div className="p-8 md:p-12 w-full md:w-1/2 flex flex-col justify-center relative">
            <div className="flex flex-wrap gap-2.5 mb-4">
              {recipe.tags && recipe.tags.map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-[#e6f2f1] text-[#0f7c85] text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider border border-[#0f7c85]/10">
                  <TagIcon size={12} /> {tag.name}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-[42px] font-heading font-extrabold text-[#1a1c29] mb-4 tracking-tight leading-[1.1]">
              {recipe.title}
            </h1>

            <div className="flex items-center gap-3 text-[13px] text-slate-500 mb-6 pb-6 border-b border-slate-100">
              <img src="https://i.pravatar.cc/100?img=4" alt="Contributor" className="w-8 h-8 rounded-full border border-slate-200" />
              <div className="flex flex-col">
                <span className="font-bold text-slate-800">{recipe.contributor?.name || "Sarah Jenkins"}</span>
                <span className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">Community Member</span>
              </div>
            </div>

            <p className="text-[15px] text-slate-600 mb-8 leading-relaxed font-medium">
              {recipe.description}
            </p>

            <div className="flex items-center justify-between text-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex flex-col flex-1 border-r border-slate-200 last:border-0">
                <span className="text-[#0f7c85] text-xl font-extrabold">{recipe.cookingTime}</span> 
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">MINS</span>
              </div>
              <div className="flex flex-col flex-1 border-r border-slate-200 last:border-0">
                <span className="text-[#0f7c85] text-xl font-extrabold capitalize">{recipe.difficulty}</span> 
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">DIFFICULTY</span>
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[#0f7c85] text-xl font-extrabold">{recipe.calories}</span> 
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">KCAL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Ingredients & Allergens */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* What it provides / Nutrition */}
            <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h3 className="text-sm font-extrabold text-[#1a1c29] uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0f7c85]"></span>
                Nutrition Facts
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-500">Protein</span>
                  <span className="text-slate-900 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">24g</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-500">Carbs</span>
                  <span className="text-slate-900 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">45g</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-500">Fat</span>
                  <span className="text-slate-900 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">12g</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-500">Fiber</span>
                  <span className="text-slate-900 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">8g</span>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h3 className="text-sm font-extrabold text-[#1a1c29] uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0ed48f]"></span>
                Ingredients
              </h3>
              <ul className="space-y-3.5">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-[#e6f2f1] flex items-center justify-center shrink-0 border border-[#0f7c85]/20 group-hover:bg-[#0f7c85] transition-colors">
                      <CheckCircle2 size={12} className="text-[#0f7c85] group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[14px] text-slate-700 font-medium leading-tight pt-0.5">
                      {ing}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Allergens */}
            <div className="bg-[#ffebf0] p-6 rounded-[24px] border border-[#ff3b6a]/20 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-[0.04]">
                <Flame size={100} className="text-[#ff3b6a]" />
              </div>
              <h3 className="text-sm font-extrabold text-[#ff3b6a] uppercase tracking-wider mb-4 relative z-10 flex items-center gap-2">
                 Allergen Alert
              </h3>
              <div className="flex flex-wrap gap-2 relative z-10">
                <span className="px-3 py-1.5 bg-white text-[#ff3b6a] rounded-lg text-[11px] font-extrabold uppercase tracking-wider shadow-sm border border-[#ff3b6a]/10">
                  None Found
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Steps */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h3 className="text-xl font-heading font-extrabold text-[#1a1c29] mb-8">
                Step-by-Step Instructions
              </h3>
              
              <div className="space-y-6">
                {recipe.steps.map((step, i) => (
                  <div key={i} className="flex gap-5 group">
                    <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-[12px] bg-[#e6f2f1] text-[#0f7c85] font-extrabold text-sm border border-[#0f7c85]/20 group-hover:bg-[#0f7c85] group-hover:text-white transition-colors">
                      {i + 1}
                    </div>
                    <div className="flex-1 bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                      <h4 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Step {i + 1}</h4>
                      <p className="text-[15px] text-slate-700 leading-relaxed font-medium">
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
