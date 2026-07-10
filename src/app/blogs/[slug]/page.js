'use client';

import React, { use, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdSlot from '@/components/AdSlot';

const ARTICLES_DB = {
  'ayurvedic-secrets-for-better-digestion': {
    title: 'Ayurvedic Secrets for Better Digestion',
    category: 'Ayurveda',
    author: 'Dr. Ananya Sen, BAMS',
    reviewer: 'Dr. Ramesh Nair, Ayurvedic Specialist',
    date: 'June 3, 2026',
    readTime: '6 min read',
    img: '/images/ayurveda.png',
    intro: 'In Ayurveda, digestion is considered the cornerstone of overall vitality. Known as "Agni" or the metabolic fire, a balanced digestive tract is crucial for converting nutrition into life force.',
    body: [
      {
        heading: 'Understanding Agni: Your Inner Metabolic Fire',
        text: 'According to Ayurvedic texts, Agni is the primary agent of life, color, strength, health, nourishment, and luster. When Agni is balanced, it supports immune defense and cell rejuvenation. When it is weak, undigested food compiles into a metabolic byproduct called "Ama," which triggers inflammation and fatigue throughout the biological systems.',
      },
      {
        heading: 'Simple Rituals to Kindle Your Agni',
        text: 'To maintain a strong Agni, Ayurveda recommends drinking warm water with freshly squeezed ginger in the morning. Additionally, chewing a small slice of ginger with a pinch of rock salt about fifteen minutes before lunch stimulates salivary enzymes and prepares stomach acids for optimal digestion.',
      },
      {
        heading: 'Dosha-Specific Dietary Adjustments',
        text: 'Every individual has a unique constitution or Dosha profile (Vata, Pitta, or Kapha). Vata types thrive on warm, oily, and cooked foods like spiced stews. Pitta types require cooling elements like sweet fruits and leafy vegetables, avoiding excess hot spices. Kapha types benefit from warm, light, and dry meals with stimulating spices like mustard seed and black pepper.',
      },
    ],
    quote: 'Let food be your medicine, and let it be warm, cooked, and consumed with full awareness.',
  },
  'how-ai-is-changing-healthcare': {
    title: 'How AI is Changing Healthcare',
    category: 'Modern Health',
    author: 'Sarah Jenkins, Healthcare Analyst',
    reviewer: 'Dr. David Cho, MD',
    date: 'June 24, 2026',
    readTime: '8 min read',
    img: '/images/disease.png',
    intro: 'Artificial intelligence is no longer a futuristic laboratory concept. Today, deep learning algorithms, computer vision, and machine learning models are active players in modern clinical diagnostics.',
    body: [
      {
        heading: 'Accelerated Diagnostics and Imaging Precision',
        text: 'AI algorithms excel at visual pattern recognition. Radiologists now utilize deep learning tools to screen MRIs and chest scans, identifying micro-anomalies and oncology markers at speeds and accuracy rates that supplement human diagnostics. This partnership reduces error thresholds and expedites treatment pathways.',
      },
      {
        heading: 'Robotic Surgery and Minimally Invasive Precision',
        text: 'In surgical units, AI-assisted robotic arms translate complex physical actions into sub-millimeter incisions. These systems adjust in real-time to micro-movements of tissue, minimizing blood loss, reducing post-operative pain, and decreasing hospital residency times for patients.',
      },
      {
        heading: 'Predictive Care Management and Wellness Trackers',
        text: 'Beyond surgery, machine learning parses vast clinical histories to predict patient readmissions, intensive care escalations, and insurance claims. These models allow hospital administrators to allocate critical resources proactively and assist doctors in preventative patient wellness monitoring.',
      },
    ],
    quote: 'The intersection of computer science and clinical medicine represents the most significant diagnostic leap since the X-ray.',
  },
  'breathwork-vs-meditation-for-anxiety': {
    title: 'Breathwork vs. Meditation for Anxiety',
    category: 'Holistic',
    author: 'Marcus Thorne, Mindfulness Coach',
    reviewer: 'Dr. Clara Vance, Clinical Psychologist',
    date: 'February 11, 2026',
    readTime: '5 min read',
    img: '/images/holistic.png',
    intro: 'When anxiety peaks, choosing the correct mindfulness practice makes all the difference. Understanding the physical distinction between breath control and quiet sitting is key to soothing the nervous system.',
    body: [
      {
        heading: 'Breathwork: The Somatic Reset Switch',
        text: 'Breathwork acts as a direct link to the autonomic nervous system. By consciously altering inhalation-exhalation ratios—such as prolonging the exhale—you stimulate the vagus nerve and initiate the parasympathetic "rest and digest" branch. Techniques like Box Breathing or 4-7-8 breathing can lower heart rates in under ninety seconds.',
      },
      {
        heading: 'Meditation: The Cognitive Observational Practice',
        text: 'Where breathwork is active and physical, meditation is an exercise in cognitive observation. By practicing Vipassana or mindfulness meditation, you learn to observe racing thoughts without physical reactivity. This breaks the cognitive loop of worry, fostering long-term resilience to stress triggers.',
      },
      {
        heading: 'How to Combine Them for Peak Nervous Balance',
        text: 'For individuals suffering from acute, somatic anxiety, sitting in silent meditation can sometimes feel aggravating. In these instances, starting with five minutes of active breathwork to discharge neural tension, followed by ten minutes of silent observation, offers the most balanced mindfulness routine.',
      },
    ],
    quote: 'Breath is the bridge that connects the physical body with the conscious mind.',
  },
  'exercise-for-better-mental-health': {
    title: 'Exercise for Better Mental Health',
    category: 'Mental Health',
    author: 'Dr. Elena Rostova, Neuroscientist',
    reviewer: 'Dr. Joshua Stern, Psychiatrist',
    date: 'June 22, 2026',
    readTime: '7 min read',
    img: '/images/hero_exercise.png',
    intro: 'The benefits of exercise go far beyond physical strength. Regular cardiovascular workouts trigger structural changes in the brain, improving focus, memory, and baseline mood.',
    body: [
      {
        heading: 'BDNF: The Miracle Grow for Brain Cells',
        text: 'Cardiovascular exercise triggers the release of Brain-Derived Neurotrophic Factor (BDNF), a protein that supports neuron survival, growth, and synaptic plasticity. This process of neurogenesis directly improves hippocampal volume, combating cognitive decline and boosting stress management.',
      },
      {
        heading: 'Dopamine, Endorphins, and Mood Balance',
        text: 'Physical workouts trigger a balanced cocktail of neurotransmitters: endorphins to block pain receptors and dopamine to establish rewards and satisfaction. This biochemical shift helps manage clinical depression symptoms, providing an immediate elevation in mood and daily focus.',
      },
      {
        heading: 'Finding the Right Exercise Dose',
        text: 'You do not need to run marathons to harvest these neurological dividends. Studies show that thirty minutes of moderate aerobic activity—like brisk walking or swimming—three to four times a week is sufficient to significantly reduce baseline cortisol and anxiety levels.',
      },
    ],
    quote: 'Physical movement is one of the most powerful and accessible anti-depressants available to humans.',
  },
  'how-inactivity-impacts-physical-health': {
    title: 'How Inactivity Impacts Physical Health',
    category: 'Physical Health',
    author: 'Liam Carter, DPT',
    reviewer: 'Dr. Michael Chen, MD',
    date: 'April 20, 2026',
    readTime: '6 min read',
    img: '/images/physical_health.png',
    intro: 'The modern sedentary lifestyle is a leading contributor to chronic physical complications. Extended sitting impacts bone density, cardiovascular health, and joint mobility.',
    body: [
      {
        heading: 'The Metabolic Slowdown of Prolonged Sitting',
        text: 'When the body remains inactive for long stretches, muscle contractions pause, causing fat-clearing enzymes like lipoprotein lipase to decline. This metabolic deceleration makes it harder for the body to manage blood sugar and process fats, increasing cardiovascular health risks.',
      },
      {
        heading: 'Joint Stiffness, Fascia Congestion, and Pain',
        text: 'Lack of movement causes joint fluid to dry up and muscle fibers to tighten. The surrounding connective tissue, or fascia, thickens in response to static postures, contributing to lower back pain, neck strain, and limited shoulder mobility. Movement is literally the lubricant of the musculoskeletal system.',
      },
      {
        heading: 'Easy Strategies to Combat Inactivity Daily',
        text: 'The solution is simple: introduce movement snacks. Setting a timer to stand up and stretch for two minutes every hour, taking walking meetings, and dedicating ten minutes to functional mobility drills in the morning can reverse the adverse effects of a desk-bound workday.',
      },
    ],
    quote: 'Our bodies were designed to move. Motion is lotion for the joints and lifeforce for the cardiovascular system.',
  },
  'when-is-the-right-time-for-hospice-care': {
    title: 'When Is the Right Time for Hospice Care?',
    category: 'Hospice Care',
    author: 'Dr. Julian Vance, Palliative Director',
    reviewer: 'Dr. Sarah Patel, Geriatric MD',
    date: 'June 15, 2026',
    readTime: '9 min read',
    img: '/images/hero_hospice.png',
    intro: 'Navigating end-of-life decisions requires compassion, honesty, and professional support. Hospice care shifts focus from curative treatments to comfort and quality of life.',
    body: [
      {
        heading: 'Recognizing the Transition Points in Care',
        text: 'Hospice care is recommended when a patient has a progressive, terminal condition with a life expectancy of six months or less, as certified by a physician. Key indicators include frequent hospitalizations, rapid decline in activities of daily living, and a decision by the patient to pause exhausting medical procedures.',
      },
      {
        heading: 'Comfort, Pain Management, and Family Counseling',
        text: 'A common misconception is that entering hospice means giving up. Instead, it represents a commitment to pain management, symptom control, and emotional support. Hospice teams include doctors, nurses, social workers, and chaplains, providing holistic comfort for both the patient and their immediate family members.',
      },
      {
        heading: 'Starting the Conversation with Empathy',
        text: 'Discussing hospice is best done early, before a medical crisis occurs. Approaching the topic with open questions—like asking what type of comfort and quality of life the patient desires in their final stages—fosters honest, warm family consensus and respects the patient’s dignity.',
      },
    ],
    quote: 'Hospice is not about adding days to life, but about adding life, comfort, and dignity to the remaining days.',
  },
  'the-sleep-revolution': {
    title: 'The Sleep Revolution',
    category: 'Digital Journal',
    author: 'Dr. Jonathan Reed, Sleep Medicine',
    reviewer: 'Dr. Ramesh Nair, Ayurvedic Specialist',
    date: 'Winter 2023 Edition',
    readTime: '8 min read',
    img: '/images/mag_sleep.png',
    intro: 'Sleep is the ultimate biological restorative process. This edition explores the neuroscience of deep sleep and practical behavioral steps to optimize recovery.',
    body: [
      {
        heading: 'The Cleansing Mechanism of Glymphatic Rhythms',
        text: 'During deep sleep, the brain initiates a metabolic self-cleaning cycle known as the glymphatic system. Cerebrospinal fluid rushes through brain tissue, clearing metabolic waste like amyloid-beta proteins. Sleep deprivation actively stunts this process, accelerating cognitive fatigue.',
      },
      {
        heading: 'Optimizing Circadian Entrainment and Sleep Environment',
        text: 'Our biological clocks are governed by daylight exposure. Getting ten minutes of direct sunlight before 9:00 AM suppresses melatonin secretion, setting a night-time sleep timer. A dark, quiet room cooled to 65°F (18°C) further assists the body in sliding into long, restorative deep sleep phases.',
      },
    ],
    quote: 'Quality sleep is the foundational pillar of physical healing, memory consolidation, and long-term neuroprotection.',
  },
  'holistic-nutrition': {
    title: 'Holistic Nutrition',
    category: 'Digital Journal',
    author: 'Catherine Brody, RDN',
    reviewer: 'Dr. Michael Chen, MD',
    date: 'Fall 2023 Edition',
    readTime: '7 min read',
    img: '/images/mag_nutrition.png',
    intro: 'Holistic nutrition looks beyond caloric spreadsheets. This edition dives into raw foods, gut health, and natural digestion optimization.',
    body: [
      {
        heading: 'The Micro-Biome: Your Second Brain',
        text: 'Our gut houses trillions of bacterial cells that manufacture over 90% of our serotonin. Consuming a diverse diet rich in prebiotic fibers and fermented foods directly nourishes these gut cultures, improving mood regulation, reducing systematic inflammation, and optimizing nutrient absorption.',
      },
      {
        heading: 'Mindful Eating and Dietary Diversity',
        text: 'Eating under stress causes blood to divert from the stomach to the limbs, halting enzyme production. Chewing slowly, avoiding screens during meals, and eating within consistent windows supports optimal digestion and prevents metabolic spikes.',
      },
    ],
    quote: 'Nutrition is not just about what you eat; it is about what your body is able to digest, absorb, and utilize.',
  },
  'the-strength-within': {
    title: 'The Strength Within',
    category: 'Digital Journal',
    author: 'Daniel Vance, CSCS',
    reviewer: 'Dr. David Cho, MD',
    date: 'Summer 2023 Edition',
    readTime: '6 min read',
    img: '/images/mag_strength.png',
    intro: 'Building strength is about functional longevity. This issue covers structural alignment, joint stability, and progressive endurance routines.',
    body: [
      {
        heading: 'The Role of Resistance Training in Longevity',
        text: 'Starting at age thirty, adults experience natural muscle mass loss. Resistance exercises and functional weight lifts offset this decline, supporting bone density, maintaining joint alignment, and reducing metabolic indicators associated with high-pressure lifestyles.',
      },
      {
        heading: 'Mobility, Balance, and Core Stabilization',
        text: 'True physical strength is built on stability. Incorporating daily core stabilization drills and dynamic mobility movements improves muscle coordination, prevents clinical lower back injuries, and increases athletic performance.',
      },
    ],
    quote: 'Strength is not about lifting heavy in the gym; it is about moving freely, painlessly, and with absolute stability throughout life.',
  },
  'digital-detox': {
    title: 'Digital Detox',
    category: 'Digital Journal',
    author: 'Marcus Thorne, Mindfulness Coach',
    reviewer: 'Dr. Clara Vance, Clinical Psychologist',
    date: 'Spring 2023 Edition',
    readTime: '5 min read',
    img: '/images/mag_detox.png',
    intro: 'Our attention spans are commodity structures. Setting micro-boundaries with screens is vital to lower stress levels and restore focus.',
    body: [
      {
        heading: 'The Neurological Costs of Screen Multitasking',
        text: 'Rapid task-switching across tabs and social apps triggers constant micro-doses of cortisol. This continuous cognitive stimulation exhaust our prefrontal cortex, leading to brain fog, elevated baseline anxiety, and reduced attention spans.',
      },
      {
        heading: 'Practical Guidelines for Digital Boundaries',
        text: 'To restore balance, implement digital-free zones: keeping screens out of the bedroom, scheduling device-free lunches, and setting app limits after 8:00 PM. These boundaries allow your nervous system to fully decompress.',
      },
    ],
    quote: 'Attention is the ultimate currency. To reclaim your attention is to reclaim your peace of mind and intentional living.',
  },
  'the-mindfulness-issue': {
    title: 'The Mindfulness Issue',
    category: 'Digital Journal',
    author: 'Catherine Brody, RDN & Marcus Thorne',
    reviewer: 'Dr. Clara Vance, Clinical Psychologist',
    date: 'Spring 2024 Edition',
    readTime: '9 min read',
    img: '/images/mag_mindfulness.png',
    images: [
      '/images/mag_mindfulness.png',
      '/images/holistic.png',
      '/images/ayurveda.png'
    ],
    intro: 'Ancient meditative wisdom meets modern neuroscience. This featured edition explores cognitive health, gut pathways, and deliberate daily living.',
    body: [
      {
        heading: 'The Neuroscience of Intention and Focus',
        text: 'Meditation has been shown to reduce cortical thinning in critical sensory processing areas and shrink the amygdala, the brain’s fear center. Developing daily habits of reflection directly lowers blood pressure and increases neural clarity.',
      },
      {
        heading: 'Integrating Calm into Modern Routines',
        text: 'Mindfulness is not about sitting in lotus pose for hours. It is the simple practice of returning your attention to the present moment. Whether washing dishes, walking in nature, or typing emails, slowing down and noting sensory inputs reduces stress hormones.',
      },
    ],
    quote: 'True mindfulness is not escaping from the noise of the world; it is finding silence within the noise itself.',
  },
};

export default function ArticlePage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { slug } = params;
  const article = ARTICLES_DB[slug];

  const [activeCursor, setActiveCursor] = useState(false);

  if (!article) {
    return (
      <div className="min-h-screen bg-bg-light flex flex-col justify-between">
        <Header />
        <main className="container flex-grow flex flex-col items-center justify-center py-20 text-center">
          <h1 className="font-heading font-extrabold text-[44px] text-primary mb-4">Article Not Found</h1>
          <p className="text-secondary mb-8">The requested guide or magazine edition does not exist.</p>
          <Link href="/" className="btn-primary bg-primary text-white px-7 py-3 rounded-full font-bold text-sm border border-primary hover:bg-transparent hover:text-primary transition-all duration-300">
            Back to Home
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Render digital magazine view for Digital Journals (Magazines)
  if (article.category === 'Digital Journal') {
    const letterBody = article.letterBody || `Welcome to the ${article.date || "latest edition"} of A Health Place! This featured journal focuses on practical ways to improve everyday health, mindfulness, and bodily wellbeing.

In this edition, we explore the core principles of ${article.title.toLowerCase()} and key scientific insights to improve your daily recovery. We hope these insights inspire healthier choices and support your wellness journey.`;

    return (
      <div className="min-h-screen bg-bg-light relative">
        <Header />

        <main className="pt-[140px] pb-20">
          <div className="container mx-auto max-w-5xl px-4">
            {/* Breadcrumb */}
            <div className="breadcrumb flex items-center gap-2 text-[12px] text-muted font-semibold uppercase tracking-[1px] mb-8">
              <Link href="/" className="hover:text-accent transition-colors">Home</Link>
              <span>•</span>
              <Link href="/publication" className="hover:text-accent transition-colors">
                {article.category}
              </Link>
              <span>•</span>
              <span className="text-secondary truncate">{article.title}</span>
            </div>

            {/* Top Section: Sidebar + Letter */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12 items-start">
              {/* Left Sidebar (w-[180px]) */}
              <div className="md:col-span-3 flex flex-col gap-4 max-w-[180px] mx-auto md:mx-0">
                <div className="relative w-[180px] h-[240px] rounded-xl overflow-hidden shadow-md border border-slate-200 bg-white">
                  <Image
                    src={article.img}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <a
                  href={article.magCloudLink || "https://www.magcloud.com/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[180px] bg-[#d92128] hover:bg-[#b81b21] text-white text-[11px] font-bold py-3 px-2 rounded-lg text-center tracking-wide shadow-sm transition-all duration-300 block leading-snug no-underline"
                >
                  FIND OUT MORE ON
                  <span className="block text-[13px] font-extrabold uppercase mt-0.5">MagCloud</span>
                </a>
              </div>

              {/* Right Letter */}
              <div className="md:col-span-9 text-left font-serif text-[15px] md:text-[16px] leading-[1.8] text-slate-700 bg-white/40 p-6 md:p-8 rounded-3xl border border-white/60">
                <h3 className="font-heading font-extrabold text-primary text-[16px] mb-4">
                  {article.letterTitle || "Dear Readers,"}
                </h3>
                <div className="whitespace-pre-line space-y-4">
                  {letterBody}
                </div>
                <div className="mt-6 border-t border-slate-200/50 pt-4">
                  <p className="font-bold text-primary mb-0.5">Warm regards,</p>
                  <p className="font-semibold text-accent">{article.letterSignature || "A Health Place Team"}</p>
                </div>
              </div>
            </div>

            {/* Large Digital Magazine Viewer (Iframe) */}
            <div className="w-full bg-white rounded-3xl border border-slate-200/60 p-4 shadow-lg mb-12">
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:h-[650px] rounded-2xl overflow-hidden bg-slate-100">
                <iframe
                  src={article.iframeUrl || "https://heyzine.com/flip-book/42436f6d2e6b.html"}
                  title={`${article.title} Digital Reader`}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  allow="clipboard-write"
                />
              </div>
            </div>

            {/* Back button */}
            <div className="text-center">
              <Link 
                href="/publication" 
                className="inline-flex items-center gap-2 bg-primary hover:bg-accent text-white font-bold px-6 py-3 rounded-full text-sm shadow-md transition-all duration-300 no-underline"
              >
                ← Back to Publications
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Related articles suggestion
  const relatedSlugs = Object.keys(ARTICLES_DB)
    .filter(key => key !== slug && ARTICLES_DB[key].category === article.category)
    .slice(0, 3);

  const fallbackSlugs = Object.keys(ARTICLES_DB)
    .filter(key => key !== slug)
    .slice(0, 3);

  const displayedRelated = relatedSlugs.length > 0 ? relatedSlugs : fallbackSlugs;

  return (
    <div className="min-h-screen bg-bg-light relative">
      <Header />

      <main className="pt-[140px] pb-20">
        <div className="container  mx-auto">
          {/* Breadcrumb */}
          <div className="breadcrumb flex items-center gap-2 text-[12px] text-muted font-semibold uppercase tracking-[1px] mb-6">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <span>•</span>
            <Link href={article.category.includes('Journal') ? '/publication' : '/#articles'} className="hover:text-accent transition-colors">
              {article.category}
            </Link>
            <span>•</span>
            <span className="text-secondary truncate">{article.title}</span>
          </div>

          {/* Heading */}
          <div className="article-header mb-10 text-left">
            <span className="inline-block bg-accent/10 border border-accent/20 text-accent font-bold text-[10px] uppercase tracking-[1.5px] px-3.5 py-1.5 rounded-full mb-4">
              {article.category}
            </span>
            <h1 className="font-heading font-extrabold text-[36px] md:text-[54px] text-primary leading-[1.1] tracking-[-1.5px] mb-6">
              {article.title}
            </h1>

            {/* Byline */}
            <div className="flex flex-wrap items-center gap-6 border-y border-slate-200/60 py-4.5 text-[13px] text-secondary">
              <div>
                <span className="text-muted font-medium">Written by</span> <span className="font-bold text-primary">{article.author}</span>
              </div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
              <div>
                <span className="text-muted font-medium">Medically Reviewed by</span> <span className="font-bold text-primary">{article.reviewer}</span>
              </div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
              <div>
                <span className="font-semibold text-accent-green">{article.date}</span>
              </div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full ml-auto hidden md:block" />
              <div className="text-muted font-semibold uppercase tracking-[0.5px] hidden md:block">
                {article.readTime}
              </div>
            </div>
          </div>

          {/* Featured Image(s) */}
          {article.images && article.images.length >= 3 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {article.images.slice(0, 3).map((imgUrl, index) => (
                <div 
                  key={index} 
                  className="article-image-wrapper relative w-full h-[240px] md:h-[380px] rounded-[24px] overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.05)] border border-white/60 transition-transform duration-500 hover:scale-[1.02]"
                >
                  <Image
                    src={imgUrl}
                    alt={`${article.title} - Preview ${index + 1}`}
                    fill
                    priority={index === 0}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="article-image-wrapper relative w-full h-[260px] sm:h-[450px] rounded-[32px] overflow-hidden shadow-[0_20px_48px_rgba(0,0,0,0.06)] border border-white/60 mb-12">
              <Image
                src={article.img}
                alt={article.title}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            </div>
          )}

          <AdSlot zone="article-body-top" />

          {/* Article Body */}
          <article className="article-body-content max-w-[740px] mx-auto">
            {/* Intro */}
            <p className="text-[17px] md:text-[19px] leading-relaxed text-primary font-medium mb-10 border-l-3 border-accent pl-5">
              {article.intro}
            </p>

            <AdSlot zone="article-body-inline" layout="float" />

            {/* Structured Paragraphs */}
            <div className="flex flex-col gap-10 text-[15px] md:text-[16px] leading-[1.8] text-secondary">
              {article.body.map((section, idx) => (
                <div key={idx} className="section-block flex flex-col gap-3">
                  <h3 className="font-heading font-extrabold text-[20px] md:text-[22px] text-primary tracking-[-0.5px]">
                    {section.heading}
                  </h3>
                  <p>{section.text}</p>
                </div>
              ))}
            </div>

            {/* Blockquote Quote */}
            {article.quote && (
              <blockquote className="my-12 py-3 border-y border-accent/20 flex flex-col gap-2">
                <span className="font-serif italic text-[20px] md:text-[24px] text-center text-accent leading-relaxed pl-0">
                  &ldquo;{article.quote}&rdquo;
                </span>
              </blockquote>
            )}
          </article>

          <AdSlot zone="article-body-bottom" />

          {/* Related Articles Divider */}
          <div className="border-t border-slate-200 mt-20 pt-16">
            <div className="flex justify-between items-end mb-10">
              <div>
                <span className="text-[11px] font-bold tracking-[2px] text-accent uppercase block mb-1">HEALTH INTEGRITY</span>
                <h3 className="font-heading font-extrabold text-2xl md:text-3xl text-primary tracking-[-0.5px]">Related Reads</h3>
              </div>
              <Link href="/" className="text-accent font-bold text-sm hover:underline flex items-center gap-1">
                All Guides <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayedRelated.map((key, i) => {
                const item = ARTICLES_DB[key];
                return (
                  <Link
                    key={key}
                    href={`/blogs/${key}`}
                    className="group cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.01)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.03)]"
                  >
                    <div className="relative w-full h-[140px] rounded-xl overflow-hidden mb-4">
                      <Image
                        src={item.img}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1.5">{item.category}</span>
                    <h4 className="font-heading font-bold text-[14.5px] text-primary leading-snug group-hover:text-accent transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer className="pt-0 pb-20" />
    </div>
  );
}
