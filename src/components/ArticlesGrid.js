'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/Button';
import AdSlot from '@/components/AdSlot';
import Book from './Book';
import Scene from './Scene';

function proxyUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `/api/media/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

function getSeasonFromDate(dateStr) {
  if (!dateStr) return 'LATEST ISSUE';
  const d = new Date(dateStr);
  const month = d.getMonth();
  const year = d.getFullYear();
  let season = 'WINTER';
  if (month >= 2 && month <= 4) season = 'SPRING';
  else if (month >= 5 && month <= 7) season = 'SUMMER';
  else if (month >= 8 && month <= 10) season = 'FALL';
  return `${season} ${year}`;
}

const magazines = [
  {
    id: 1,
    category: 'Sleep',
    badgeClass: 'bg-[var(--color-badge-blue-bg)] text-[var(--color-badge-blue-text)]',
    title: 'The Sleep Revolution',
    desc: 'Diving into physical sleep quality, REM cycles, and how daily brain recovery shapes cognitive health.',
    img: '/images/mag_sleep.png',
  },
  {
    id: 2,
    category: 'Nutrition',
    badgeClass: 'bg-[var(--color-badge-yellow-bg)] text-[var(--color-badge-yellow-text)]',
    title: 'Holistic Nutrition',
    desc: 'Understanding gut-brain axis pathways, balanced meal preparations, and clean biophilic diets.',
    img: '/images/mag_nutrition.png',
  },
  {
    id: 3,
    category: 'Strength',
    badgeClass: 'bg-[var(--color-badge-red-bg)] text-[var(--color-badge-red-text)]',
    title: 'The Strength Within',
    desc: 'Certified clinical routines, posture alignment standards, and functional energy maintenance guides.',
    img: '/images/mag_strength.png',
  },
  {
    id: 4,
    category: 'Mental Health',
    badgeClass: 'bg-[var(--color-badge-purple-bg)] text-[var(--color-badge-purple-text)]',
    title: 'Digital Detox',
    desc: 'Setting boundaries with tech to eliminate micro-anxiety loops and restore daily cognitive clarity.',
    img: '/images/mag_detox.png',
  },
];

export default function ArticlesGrid() {
  const cardRefs = useRef([]);
  const [latestIssue, setLatestIssue] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMagazines = async () => {
      try {
        const res = await fetch("/api/magazine");
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((mag) => ({
            season: getSeasonFromDate(mag.magazine_date),
            title: mag.magazine_title,
            slug: mag.magazine_slug,
            img: mag.magazine_cover_image || '/images/mag_sleep.png',
            backImg: mag.magazine_back_image || '/back.jpg',
            spineImg: mag.magazine_spine_image || '/spine.jpg',
            contents: mag.magazine_tags ? mag.magazine_tags.split(',').map(t => t.trim()) : [],
            description: mag.magazine_description,
            introduction: mag.magazine_introduction || '',
            magazineId: mag.magazine_id || '',
            timestamp: new Date(mag.magazine_date).getTime()
          }));
          const allIssues = mapped;
          if (allIssues.length > 0) {
            setLatestIssue(allIssues[0]);
            setRecentIssues(allIssues.slice(0, 3));
          }
        }
      } catch (err) {
        console.error("Failed to load magazines:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMagazines();
  }, []);

  const handleMouseMove = (e, index) => {
    const card = cardRefs.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    const px = (x / width) - 0.5;
    const py = (y / height) - 0.5;

    const maxTilt = 10;
    const tiltX = -py * maxTilt;
    const tiltY = px * maxTilt;

    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
  };

  const handleMouseLeave = (index) => {
    const card = cardRefs.current[index];
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
  };

  return (
    <section id="articles" className="projects-section pt-16 pb-[100px] bg-white rounded-t-[40px] shadow-[0_-20px_40px_rgba(0,0,0,0.01)] relative overflow-hidden">
      <div className="container mx-auto px-4">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">

          {/* Left Column — 3D Book & Title (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center text-center lg:items-start lg:text-left reveal-slide">
            <span className="section-tag text-xs font-extrabold tracking-[3px] text-accent uppercase mb-2 bg-[#0f7c85]/10 px-3.5 py-1.5 rounded-full w-max">
              DIGITAL ISSUES
            </span>
            <h2 className="font-heading font-extrabold text-3xl md:text-5xl text-primary tracking-[-1px] leading-[1.15] mb-4">
              Latest Magazine
            </h2>
            <p className="text-secondary text-base md:text-lg leading-relaxed max-w-sm mb-8">
              Step into our latest featured edition containing clinically reviewed blueprints, expert columns, and mindfulness guides.
            </p>

            {/* 3D Book Container - Removed Link wrapper so it can be freely dragged */}
            <div className="block mb-8">
              <div className="flex justify-center lg:justify-start cursor-grab active:cursor-grabbing">
                <Scene
                  frontUrl={latestIssue && latestIssue.img ? proxyUrl(latestIssue.img) : ""}
                  backUrl={latestIssue && latestIssue.backImg ? proxyUrl(latestIssue.backImg) : null}
                  spineUrl={latestIssue && latestIssue.spineImg ? proxyUrl(latestIssue.spineImg) : null}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Button
                href={latestIssue ? `/magazine/${latestIssue.slug}` : "/blogs"}
                variant="primary"
                className="!text-xs !py-3.5 !px-7 font-extrabold bg-[#0F766E] text-white hover:bg-[#0a524c]"
              >
                Read Edition →
              </Button>
              <Button
                href="/publication"
                variant="white"
                className="!text-xs !py-3.5 !px-7 font-extrabold"
              >
                Explore Archive
              </Button>
            </div>
          </div>

          {/* Middle Column — Editorial Greeting & Spread Stack (5 cols) */}
          <div className="lg:col-span-5 reveal-fade flex flex-col">
            <div className="bg-bg-light rounded-[32px] p-5 sm:p-8 border border-slate-200/60 shadow-[0_12px_40px_rgba(0,0,0,0.02)] flex flex-col gap-8 h-full justify-between hover:border-[#0f7c85]/20 transition-all duration-300">

              {/* Header Details */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/50 pb-5">
                  <div>
                    <span className="text-xs font-extrabold text-[#0f7c85] uppercase tracking-[1.5px] block mb-1">FEATURED EDITION</span>
                    <h3 className="font-heading font-extrabold text-2xl text-primary tracking-tight">
                      {latestIssue ? (latestIssue.magazineId || latestIssue.season) : "Spring 2024 Issue"}
                    </h3>
                  </div>
                  <Button
                    href={latestIssue ? `/magazine/${latestIssue.slug}` : "/blogs/the-mindfulness-issue"}
                    variant="primary"
                    className="!text-xs !py-3 !px-6 !rounded-xl font-extrabold shadow-sm hover:shadow-[0_6px_20px_rgba(15,124,133,0.2)]"
                  >
                    View Latest
                  </Button>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-secondary font-bold text-sm">Dear Readers,</span>
                  <p className="text-secondary text-sm leading-relaxed">
                    {latestIssue ? (latestIssue.introduction || latestIssue.description || `Welcome to the ${latestIssue.season} Edition of A Health Place Magazine.`) : "Welcome to the Spring 2024 Edition of A Health Place Magazine. This issue explores the powerful somatic resets, circadian sleep guidelines, and neuroscience-backed habits designed to quiet stress loops and ground your mental clarity."}
                  </p>
                </div>
              </div>

              {/* Fan-Out Spreads Preview Stack */}
              <div className="flex flex-col items-center gap-4 py-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Hover to fan out recent editions
                </span>

                <div className="spread-stack-container">
                  {/* Left */}
                  <div className="spread-card spread-card-left border border-slate-100">
                    <Image
                      src={recentIssues[1] ? proxyUrl(recentIssues[1].img) : (latestIssue ? proxyUrl(latestIssue.img) : "/images/mag_mindfulness.png")}
                      alt={recentIssues[1] ? recentIssues[1].title : "Magazine Cover"}
                      fill
                      sizes="150px"
                      className="object-cover"
                      unoptimized={true}
                    />
                  </div>

                  {/* Right */}
                  <div className="spread-card spread-card-right border border-slate-100">
                    <Image
                      src={recentIssues[2] ? proxyUrl(recentIssues[2].img) : "/images/ayurveda.png"}
                      alt={recentIssues[2] ? recentIssues[2].title : "Magazine Cover"}
                      fill
                      sizes="150px"
                      className="object-cover"
                      unoptimized={true}
                    />
                  </div>

                  {/* Center (Most Recent) */}
                  <div className="spread-card spread-card-center border-2 border-white shadow-lg">
                    <Image
                      src={recentIssues[0] ? proxyUrl(recentIssues[0].img) : "/images/physical_health.png"}
                      alt={recentIssues[0] ? recentIssues[0].title : "Magazine Cover"}
                      fill
                      sizes="150px"
                      className="object-cover"
                      unoptimized={true}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column — Ad Card (3 cols) */}
          <div className="lg:col-span-3 reveal-fade h-full flex flex-col justify-stretch">
            <AdSlot zone="homepage-hero-bottom" layout="card" />
          </div>

        </div>
      </div>
    </section>
  );
}
