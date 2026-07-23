'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import QuizIcon from '@/components/quiz/QuizIcon';
import SaveRecipeButton from '@/components/recipes/SaveRecipeButton';

const getQuizEmoji = (slug = "") => {
  const s = String(slug).toLowerCase();
  if (s.includes("sleep")) return "🌙";
  if (s.includes("stress") || s.includes("burnout")) return "🧠";
  if (s.includes("dosha") || s.includes("ayurveda") || s.includes("body-type")) return "🌿";
  if (s.includes("nutrition") || s.includes("diet") || s.includes("gut")) return "🥗";
  return "📋";
};

const DEFAULT_CONTENT = {
  enabled: true,
  headline: 'Know your body,\none quiz at a time.',
  subtext:
    'Our clinically informed quizzes help you understand your health from the inside out — covering sleep, stress, nutrition, and Ayurvedic wellness. Start free, go deeper with a free account.',
  badges: ['Clinically Informed', 'Personalised Insights', 'Private & Secure'],
  heroTag: 'Daily Wellness Quiz',
  heroTitle: 'Test yourself today.',
  heroBody:
    'Take a quick 5-minute assessment and discover actionable insights about your sleep, stress, nutrition, or Ayurvedic body type — all backed by clinical research.',
  heroPrimaryLabel: 'Browse All Quizzes',
  heroPrimaryLink: '/quizzes',
  heroSecondaryLabel: 'Start Now →',
  heroSecondaryLink: '/quizzes/sleep-quality',
  quickCards: [
    {
      tag: 'Daily Quiz',
      icon: '🌅',
      desc: 'A fresh 5-question wellness check, updated every day.',
      link: '/quizzes/sleep-quality',
    },
    {
      tag: 'Stress Check',
      icon: '🧠',
      desc: 'Measure your mental load and unlock targeted breathing guides.',
      link: '/quizzes/stress-burnout',
    },
    {
      tag: 'Nutrition IQ',
      icon: '🥗',
      desc: 'Rate your diet quality and get personalised food insights.',
      link: '/quizzes/nutrition-gut',
    },
  ],
  snapshot: {
    title: "Your Today's Wellness Snapshot",
    sleep: 78,
    stress: 62,
    nutrition: 72,
    hydration: 48,
    score: 72,
  },
  healthyBite: {
    title: 'Healthy Bite of the Day',
    recipeName: 'Quinoa & Avocado Power Bowl',
    image: '/images/healthy_bite.png',
    points: ['High in Protein', 'Gut Friendly', 'Quick & Easy'],
    recipeLink: '/recipes/demo',
    time: '15 mins',
    calories: '320 kcal',
  },
  wellnessTip: {
    title: 'Daily Wellness Tip',
    quote: 'A 10-minute walk after meals can improve digestion and boost your energy.',
    linkText: 'Learn more →',
    linkUrl: '/blogs/benefits-of-walking',
  },
  popularQuizzes: [
    {
      title: 'Sleep Quality Assessment',
      duration: '5 min',
      image: '/images/physical_health.png',
      link: '/quizzes/sleep-quality',
    },
    {
      title: 'Stress & Mental Wellness Check',
      duration: '5 min',
      image: '/images/ayurveda.png',
      link: '/quizzes/stress-burnout',
    },
    {
      title: 'Nutrition & Diet Evaluation',
      duration: '5 min',
      image: '/images/mag_mindfulness.png',
      link: '/quizzes/nutrition-gut',
    },
    {
      title: 'Ayurvedic Body Type Quiz',
      duration: '5 min',
      image: '/images/dosha-body-type.png',
      link: '/quizzes/dosha-body-type',
    },
  ],
  progressTracker: {
    title: 'Track Your Progress',
    chartValues: [30, 45, 58, 80],
    btnLabel: 'Go to Dashboard →',
    btnLink: '/quizzes/dashboard',
  },
};

export default function WellnessShowcase({ content }) {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  // State for dynamically loaded active quizzes
  const [dbQuizzes, setDbQuizzes] = useState([]);

  useEffect(() => {
    fetch('/api/quizzes/types')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (data && data.length > 0) {
          const fallbackImages = {
            'sleep-quality': '/images/physical_health.png',
            'stress-burnout': '/images/ayurveda.png',
            'nutrition-gut': '/images/mag_mindfulness.png',
            'dosha-body-type': '/images/dosha-body-type.png',
          };
          const mapped = data.map(q => ({
            title: q.title,
            duration: `${q.estimatedMinutes || 5} min`,
            image: q.imageUrl || fallbackImages[q.slug] || '/images/dosha-body-type.png',
            link: `/quizzes/${q.slug}`
          }));
          setDbQuizzes(mapped);
        }
      })
      .catch(err => console.error('Error loading db popular quizzes:', err));
  }, []);

  const [latestRecipe, setLatestRecipe] = useState(null);
  const [approvedRecipes, setApprovedRecipes] = useState([]);
  const [showMoreRecipes, setShowMoreRecipes] = useState(false);
  const [quote, setQuote] = useState({ text: 'Loading healthy inspiration...', author: '' });

  useEffect(() => {
    fetch('/api/recipes?status=Approved')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.data?.recipes?.length > 0) {
          setApprovedRecipes(data.data.recipes);
          setLatestRecipe(data.data.recipes[0]);
        }
      })
      .catch(err => console.error('Error loading community recipes:', err));

    fetch('https://dummyjson.com/quotes/random')
      .then(res => res.json())
      .then(data => {
        if (data && data.quote) {
          setQuote({ text: data.quote, author: data.author });
        }
      })
      .catch(err => {
        console.error("Error fetching quote:", err);
        setQuote({ text: 'Let food be thy medicine and medicine be thy food.', author: 'Hippocrates' });
      });
  }, []);

  // Merge dynamic content with defaults
  const cmsQuizzes = content?.popularQuizzes?.length > 0 ? content.popularQuizzes : DEFAULT_CONTENT.popularQuizzes;

  // Use database quizzes if present, padded/backed up by CMS/default quizzes if less than 4
  let displayQuizzes = [...dbQuizzes];
  if (displayQuizzes.length < 4) {
    const defaultQuizzesToPad = cmsQuizzes.filter(
      dq => !displayQuizzes.some(dbq => dbq.link === dq.link)
    );
    displayQuizzes = [...displayQuizzes, ...defaultQuizzesToPad].slice(0, 4);
  } else {
    displayQuizzes = displayQuizzes.slice(0, 4);
  }

  const c = {
    ...DEFAULT_CONTENT,
    ...content,
    quickCards: content?.quickCards?.length > 0 ? content.quickCards : DEFAULT_CONTENT.quickCards,
    snapshot: { ...DEFAULT_CONTENT.snapshot, ...content?.snapshot },
    healthyBite: content?.healthyBite?.recipeName ? {
      ...content.healthyBite,
      id: content.healthyBite.id || (content.healthyBite.recipeLink ? content.healthyBite.recipeLink.split('/').pop() : null)
    } : latestRecipe ? {
      title: 'Healthy Bite of the Day',
      recipeName: latestRecipe.title,
      image: latestRecipe.imageUrl || DEFAULT_CONTENT.healthyBite.image,
      points: latestRecipe.tags && latestRecipe.tags.length > 0 ? latestRecipe.tags.map(t => t.name).slice(0, 3) : ['High in Protein', 'Gut Friendly', 'Quick & Easy'],
      recipeLink: `/recipes/${latestRecipe.id}`,
      time: latestRecipe.cookingTime ? `${latestRecipe.cookingTime} mins` : '15 mins',
      calories: latestRecipe.calories ? `${latestRecipe.calories} kcal` : '320 kcal',
      id: latestRecipe.id,
    } : DEFAULT_CONTENT.healthyBite,
    wellnessTip: { ...DEFAULT_CONTENT.wellnessTip, ...content?.wellnessTip },
    popularQuizzes: displayQuizzes,
    progressTracker: { ...DEFAULT_CONTENT.progressTracker, ...content?.progressTracker },
  };

  if (c.enabled === false) return null;

  const hasRecipeData = !!(content?.healthyBite?.recipeName || latestRecipe);

  // Render headline with \n → <br />
  const headlineLines = (c.headline || '').split('\n');

  // Overall Score Circular Progress Calculations
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((c.snapshot.score || 0) / 100) * circumference;

  // Render customized SVG path for the progress tracker line chart
  const getChartPath = (values) => {
    if (!values || values.length === 0) return '';
    const width = 180;
    const height = 60;
    const maxVal = Math.max(...values, 100);
    const points = values.map((val, idx) => {
      const x = (idx / (values.length - 1)) * width + 10;
      const y = height - (val / maxVal) * (height - 20) - 10;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  return (
    <section id="wellness-dashboard" className="py-20 bg-slate-50/50 rounded-b-[40px] border-b border-slate-100">
      <div className="container mx-auto px-4">

        {/* Full-width Hero Background with Text Overlay */}
        <div className="relative w-full rounded-[40px] overflow-hidden mb-16 bg-[#f9f9f9] mt-6 md:mt-10">
          <img
            src="/images/quiz.png"
            alt="Wellness Background"
            className="absolute inset-0 w-full h-full object-cover object-[right_25%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-white/40 md:hidden pointer-events-none" />

          {/* Foreground text content */}
          <div className="relative z-10 px-8 py-16 md:px-12 lg:px-16 md:py-20 max-w-2xl space-y-6 reveal-slide">
            <h2 className="main-heading text-primary mb-2">
              {headlineLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < headlineLines.length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p className="description text-secondary max-w-lg">
              {c.subtext}
            </p>

            {/* Header Badges List */}
            <div className="flex flex-wrap gap-3.5 pt-2">
              {(c.badges || DEFAULT_CONTENT.badges).map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-full text-xs font-bold text-slate-700 shadow-xs">
                  {idx === 0 && (
                    <svg className="w-3.5 h-3.5 text-[#0f7c85]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                  )}
                  {idx === 1 && (
                    <svg className="w-3.5 h-3.5 text-[#0f7c85]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  )}
                  {idx === 2 && (
                    <svg className="w-3.5 h-3.5 text-[#0f7c85]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  )}
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 1: Hero Quiz & 3 Quick Cards ────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 mt-12 gap-4">
          <div>
            <h3 className="section-heading text-[#1a1c29]">Community Kitchen</h3>
            <p className="description text-slate-500 mt-1">Discover, share, and enjoy healthy recipes from the community.</p>
          </div>
          <Link href="/recipes/submit" className="bg-[#ff3b6a] hover:bg-[#e02d58] text-white font-bold text-sm md:text-base py-2.5 px-6 rounded-full transition-all shadow-md flex items-center gap-2 hover:-translate-y-0.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add Your Recipe
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* Healthy Bite Hero Card (2 cols) */}
          <div
            className="lg:col-span-2 rounded-[32px] p-0 flex flex-col md:flex-row relative overflow-hidden h-auto md:h-[360px] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group transition-all duration-300 hover:-translate-y-1"
          >
            {/* Image side */}
            <div className="relative w-full md:w-1/2 h-56 md:h-full bg-slate-100 overflow-hidden shrink-0">
              {c.healthyBite.image && (
                <img
                  src={c.healthyBite.image}
                  alt={c.healthyBite.recipeName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-white/90" />
            </div>

            {/* Content side */}
            <div className="p-8 md:p-10 flex-1 flex flex-col justify-center z-10 bg-white">
              <span className="text-[#0f7c85] font-extrabold text-xs uppercase tracking-[2px] mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff7373] animate-pulse inline-block" />
                {c.healthyBite.title}
              </span>
              <h3 className="text-primary font-heading font-extrabold text-2xl md:text-3xl leading-tight tracking-tight mb-4 group-hover:text-[#0f7c85] transition-colors">
                {c.healthyBite.recipeName}
              </h3>

              <div className="flex flex-wrap gap-2 mb-6">
                {(Array.isArray(c.healthyBite.points) ? c.healthyBite.points : typeof c.healthyBite.points === 'string' ? c.healthyBite.points.split(',').map(p => p.trim()) : []).map((pt, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-[#0f7c85]/10 text-[#0f7c85] text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                    {pt}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center mt-auto">
                <Link
                  href={c.healthyBite.recipeLink}
                  className="bg-[#0f7c85] hover:bg-[#0c646b] text-white font-bold text-xs py-3 px-6 rounded-[12px] transition-all duration-300 no-underline shadow-sm w-full sm:w-auto text-center flex items-center justify-center gap-2"
                >
                  View Recipe <span className="text-lg leading-none">→</span>
                </Link>
                <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5"><QuizIcon name="⏱️" className="w-4 h-4 opacity-70" /> {c.healthyBite.time}</span>
                  <span className="flex items-center gap-1.5"><QuizIcon name="🔥" className="w-4 h-4 opacity-70" /> {c.healthyBite.calories}</span>
                </div>
              </div>
            </div>

            {/* Top right floating button */}
            {c.healthyBite.id && (
              <div className="absolute top-6 right-6 z-20">
                <SaveRecipeButton recipeId={c.healthyBite.id} className="w-10 h-10 rounded-full" />
              </div>
            )}
          </div>

          {/* View More Recipes Dropdown Column */}
          <div className="flex flex-col justify-start reveal-slide min-w-0 h-full">
            <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
              <button
                onClick={() => setShowMoreRecipes(!showMoreRecipes)}
                className="w-full flex items-center justify-between gap-4 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-[#ffe8ef] to-[#ffd1de] text-[#ff3b6a] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                  </div>
                  <div>
                    <h4 className="text-slate-800 font-heading font-extrabold text-[16px] leading-snug group-hover:text-[#ff3b6a] transition-colors">View More Recipes</h4>
                    <p className="text-[#ff3b6a] font-extrabold text-[10px] uppercase tracking-widest mt-0.5">Community Approved</p>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 transition-transform duration-300 ${showMoreRecipes ? 'rotate-180 bg-[#ff3b6a]/10 text-[#ff3b6a]' : 'group-hover:bg-slate-100'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </div>
              </button>

              {/* Dropdown Content */}
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showMoreRecipes ? 'max-h-[300px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2 overflow-y-auto max-h-[250px] pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                  {approvedRecipes.slice(1).length > 0 ? approvedRecipes.slice(1).map((recipe, idx) => (
                    <Link
                      key={idx}
                      href={`/recipes/${recipe.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group/item"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100 shadow-inner">
                        {recipe.imageUrl ? (
                          <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">🍲</div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 justify-center">
                        <span className="text-sm font-bold text-slate-800 truncate group-hover/item:text-[#0f7c85] transition-colors">{recipe.title}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><QuizIcon name="⏱️" className="w-3 h-3" /> {recipe.cookingTime}m</span>
                          <span className="text-[10px] text-slate-300">•</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{recipe.difficulty}</span>
                        </div>
                      </div>
                      <div className="ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity -translate-x-2 group-hover/item:translate-x-0 duration-300">
                        <svg className="w-4 h-4 text-[#0f7c85]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                      </div>
                    </Link>
                  )) : (
                    <div className="text-sm font-medium text-slate-500 p-6 text-center bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                      More recipes coming soon!<br />
                      <span className="text-[11px] text-slate-400 mt-1 block">Share yours today!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quote Block below recipes */}
            <div className="mt-4 flex-1 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-[24px] p-6 shadow-sm relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.714 4.076-7.857 7.747-8.109l.236 1.45c-2.333.256-4.664 2.15-5.042 5.05H22V21h-7.983zm-11 0v-7.391c0-5.714 4.076-7.857 7.747-8.109l.236 1.45c-2.333.256-4.665 2.15-5.042 5.05H11V21H3.017z" /></svg>
              </div>
              <div className="relative z-10">
                <h4 className="text-emerald-600 font-extrabold text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Healthy Inspiration
                </h4>
                <p className="text-slate-700 italic font-medium text-[14px] leading-relaxed mb-3">&quot;{quote.text}&quot;</p>
                <p className="text-emerald-700/80 font-bold text-xs">— {quote.author || "Unknown"}</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
