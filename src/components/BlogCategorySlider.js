'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import AdSlot from '@/components/AdSlot';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function BlogCategorySlider() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback data for when there are no published blogs yet
  const fallbackBlogs = [
    {
      title: 'Physical Health',
      tag: 'BODY VITALITY',
      desc: 'Guides on sleep quality, cardiovascular health, physical fitness, and daily preventative routines.',
      img: '/images/hero_exercise.png',
      link: '/blogs?filter=Physical%20Health',
      badgeClass: 'bg-[var(--color-badge-blue-bg)] text-[var(--color-badge-blue-text)]',
    },
    {
      title: 'Mental Health',
      tag: 'COGNITIVE CALM',
      desc: 'Insights into stress resilience, anxiety reduction, mindful practices, and neurological health.',
      img: '/images/holistic.png',
      link: '/blogs?filter=Mental%20Health',
      badgeClass: 'bg-[var(--color-badge-purple-bg)] text-[var(--color-badge-purple-text)]',
    },
    {
      title: 'Holistic Ayurveda',
      tag: 'ANCIENT WISDOM',
      desc: 'Integrating natural remedies, agni balancing, herbal vetting, and dosha-specific lifestyle guidelines.',
      img: '/images/ayurveda.png',
      link: '/blogs?filter=Holistic%20Ayurveda',
      badgeClass: 'bg-[var(--color-badge-green-bg)] text-[var(--color-badge-green-text)]',
    },
    {
      title: 'Insurance Mappings',
      tag: 'HEALTH POLICY',
      desc: 'Demystifying clinical documentation, wellness code mappings, and policy claim options.',
      img: '/images/disease.png',
      link: '/blogs?filter=Insurance%20Mappings',
      badgeClass: 'bg-[var(--color-badge-yellow-bg)] text-[var(--color-badge-yellow-text)]',
    },
    {
      title: 'Nutrition & Diet',
      tag: 'FUEL & ENERGY',
      desc: 'Learn about meal prep, balanced diets, clean biophilic eating, and clinical nutrition guidelines.',
      img: '/images/mag_nutrition.png',
      link: '/blogs?filter=Nutrition',
      badgeClass: 'bg-[var(--color-badge-yellow-bg)] text-[var(--color-badge-yellow-text)]',
    },
    {
      title: 'Fitness & Training',
      tag: 'STRENGTH & MOTION',
      desc: 'Discover exercise routines, posture corrections, energy maintenance, and active training protocols.',
      img: '/images/mag_strength.png',
      link: '/blogs?filter=Fitness',
      badgeClass: 'bg-[var(--color-badge-red-bg)] text-[var(--color-badge-red-text)]',
    },
    {
      isAd: true,
      zone: 'homepage-articles-bottom',
    },
    {
      title: 'Alternative Care',
      tag: 'NATURAL REMEDIES',
      desc: 'Explore alternative therapies, biophilic setups, and herbal supplement vetting protocols.',
      img: '/images/holistic.png',
      link: '/blogs?filter=Alternative',
      badgeClass: 'bg-[var(--color-badge-green-bg)] text-[var(--color-badge-green-text)]',
    },
    {
      title: 'Digital Wellness',
      tag: 'MINDFUL FOCUS',
      desc: 'Insights on reducing screen fatigue, setting tech boundaries, and restoring daily focus.',
      img: '/images/mag_detox.png',
      link: '/blogs?filter=Mental%20Health',
      badgeClass: 'bg-[var(--color-badge-purple-bg)] text-[var(--color-badge-purple-text)]',
    }
  ];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("/api/posts?limit=8");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && data.data.posts && data.data.posts.length > 0) {
            const fetchedBlogs = data.data.posts.map(p => ({
              title: p.title,
              tag: p.categories?.[0]?.name || 'WELLNESS',
              desc: p.excerpt || 'Read our latest insights and wellness guides.',
              img: p.featuredImage?.url || p.featuredImage?.secureUrl || '/images/default-blog.png',
              link: `/blogs/${p.slug}`,
              badgeClass: 'bg-[var(--color-badge-blue-bg)] text-[var(--color-badge-blue-text)]',
            }));
            
            // Insert Ad slot at index 6 if there are enough blogs
            if (fetchedBlogs.length > 5) {
              fetchedBlogs.splice(6, 0, { isAd: true, zone: 'homepage-articles-bottom' });
            } else if (fetchedBlogs.length > 0) {
              fetchedBlogs.push({ isAd: true, zone: 'homepage-articles-bottom' });
            }
            
            setBlogs(fetchedBlogs);
          } else {
            // Use fallback if no published blogs found
            setBlogs(fallbackBlogs);
          }
        } else {
          setBlogs(fallbackBlogs);
        }
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
        setBlogs(fallbackBlogs);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);


  return (
    <section id="timeline" className="timeline-section py-[100px] bg-bg-timeline rounded-t-[40px] relative overflow-hidden">
      <div className="container relative px-6 md:px-8">
        {/* Section Title */}
        <div className="section-title-center text-center max-w-[600px] mx-auto mb-16 reveal-slide">

          <h2 className="section-heading text-primary mb-4">Latest Blogs</h2>
          <p className="description text-secondary">Browse our articles by topic to find medically verified guides and insights.</p>
        </div>

        {/* Swiper Slider Wrapper with side paddings for arrows */}
        <div className="reveal-scale relative px-12 md:px-14">

          {/* Left Arrow */}
          <button className="swiper-timeline-prev absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full border border-slate-200/60 bg-white/90 text-primary hover:border-accent hover:text-accent flex items-center justify-center transition-all duration-300 active:scale-95 shadow-sm cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            loop={blogs && blogs.length > 4}
            speed={500}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{ clickable: true, dynamicBullets: true }}
            navigation={{
              nextEl: '.swiper-timeline-next',
              prevEl: '.swiper-timeline-prev',
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 4,
              },
            }}
            className="timeline-swiper !pb-14"
          >
            {blogs.map((cat, i) => (
              <SwiperSlide key={i} className="h-full flex">
                {cat.isAd ? (
                  <AdSlot zone={cat.zone} layout="blogCard" className="h-full w-full" />
                ) : (
                  <Link
                    href={cat.link}
                    className="group bg-white rounded-[24px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100/50 flex flex-col justify-between hover:shadow-[0_16px_40px_rgba(31,185,251,0.08)] hover:scale-[1.02] transition-all duration-300 h-full w-full no-underline"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <span className={`text-[9.5px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${cat.badgeClass}`}>{cat.tag}</span>
                      </div>
                      <h4 className="card-title text-primary group-hover:text-accent transition-colors mt-2 line-clamp-2">{cat.title}</h4>
                      <p className="text-sm text-secondary mt-1 line-clamp-3">{cat.desc}</p>
                    </div>

                    <div className="relative mt-6 h-[120px] w-full rounded-xl overflow-hidden shadow-sm">
                      <Image
                        src={cat.img}
                        alt={cat.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 25vw"
                        unoptimized={true}
                      />
                    </div>
                  </Link>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Right Arrow */}
          <button className="swiper-timeline-next absolute right-0 md:right-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full border border-slate-200/60 bg-white/90 text-primary hover:border-accent hover:text-accent flex items-center justify-center transition-all duration-300 active:scale-95 shadow-sm cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>


        </div>
      </div>
    </section>
  );
}
