'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { ChevronDown, BookOpen, PenTool, Target, PlayCircle, Activity, Heart, Brain, Calendar, Mail, FileText, Info, HelpCircle, ArrowRight, Users, Bell, UserCircle } from 'lucide-react';
import Search from '@/components/Search';
import Marquee from '@/components/Marquee';

function proxyUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `/api/media/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState([]);

  // Load notifications + read state
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('viewed_notifications') || '[]');
    setReadIds(stored);
    fetch('/api/crm/push/active')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data?.notifications)) {
          setNotifications(data.data.notifications);
        }
      })
      .catch(err => console.error('Error loading active website notifications:', err));
  }, []);

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const markAsRead = (id) => {
    const updated = [...new Set([...readIds, id])];
    setReadIds(updated);
    localStorage.setItem('viewed_notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => n.id);
    setReadIds(updated);
    localStorage.setItem('viewed_notifications', JSON.stringify(updated));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="relative p-2.5 rounded-full hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer text-[#374151]"
      >
        <Bell className="w-5 h-5 text-[#374151]" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-[-50px] sm:right-0 mt-3 w-[290px] sm:w-[340px] bg-white rounded-2xl border border-[#E6EEF0] shadow-[0_12px_35px_rgba(0,0,0,.08)] z-[10001] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#E6EEF0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-sm">Website Announcements</h4>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] font-semibold text-[#0F766E] hover:underline border-none bg-transparent cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No recent announcements</p>
          ) : (
            <div className="divide-y divide-[#E6EEF0] max-h-72 overflow-y-auto">
              {notifications.map(n => {
                const isRead = readIds.includes(n.id);
                return (
                  <div
                    key={n.id}
                    className={`px-4 py-3 text-left transition-colors ${isRead ? 'bg-white' : 'bg-[#f0faf9]'}`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Unread dot */}
                      <div className="mt-1 shrink-0">
                        {!isRead
                          ? <span className="block w-2 h-2 rounded-full bg-[#0F766E]" />
                          : <span className="block w-2 h-2 rounded-full bg-slate-200" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-tight ${isRead ? 'font-medium text-slate-600' : 'font-bold text-slate-900'}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                        <div className="flex justify-between items-center mt-2 gap-2">
                          <span className="text-[9px] text-slate-400">
                            {n.sentAt ? new Date(n.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            {n.url && (
                              <a href={n.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#0F766E] font-semibold hover:underline">
                                Read →
                              </a>
                            )}
                            {!isRead && (
                              <button
                                onClick={() => markAsRead(n.id)}
                                className="text-[10px] text-slate-400 hover:text-slate-700 font-medium border-none bg-transparent cursor-pointer"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UserProfileDropdown() {
  return (
    <Link
      href="/account"
      className="relative p-2.5 rounded-full hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer text-[#374151]"
      title="My Account"
    >
      <UserCircle className="w-5 h-5 text-[#374151]" />
    </Link>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [dynamicBlogs, setDynamicBlogs] = useState([]);
  const [dynamicPublications, setDynamicPublications] = useState([]);
  const [dynamicQuizzes, setDynamicQuizzes] = useState([]);
  const [navItems, setNavItems] = useState([]);
  const [headerConfig, setHeaderConfig] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  const menuType = headerConfig?.menuType || 'main';

  const toggleExpand = (label) => {
    setExpandedItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  useEffect(() => {
    // Fetch recent blogs
    fetch('/api/posts?limit=4')
      .then(res => res.json())
      .then(data => {
        if (data?.data?.posts) setDynamicBlogs(data.data.posts);
      })
      .catch(err => console.error("Error fetching blogs for header:", err));

    // Fetch recent publications
    fetch('/api/magazine?limit=4')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDynamicPublications(data);
      })
      .catch(err => console.error("Error fetching publications for header:", err));

    // Fetch active quizzes
    fetch('/api/quizzes/types')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDynamicQuizzes(data);
      })
      .catch(err => console.error("Error fetching quizzes for header:", err));

    // Fetch header builder settings
    fetch('/api/header')
      .then(res => res.json())
      .then(data => {
        if (data?.success && data.data?.header) {
          setHeaderConfig(data.data.header);
        }
      })
      .catch(err => console.error("Error fetching header builder settings:", err));
  }, []);

  // Fetch navigation items whenever menuType changes
  useEffect(() => {
    fetch(`/api/navigation/${menuType}`)
      .then(res => res.json())
      .then(data => {
        if (data?.success && Array.isArray(data.data?.items)) {
          setNavItems(data.data.items);
        }
      })
      .catch(err => console.error(`Error fetching navigation for ${menuType}:`, err));
  }, [menuType]);

  // Body and HTML scroll locking when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('hb-no-scroll');
      document.documentElement.classList.add('hb-no-scroll');
    } else {
      document.body.classList.remove('hb-no-scroll');
      document.documentElement.classList.remove('hb-no-scroll');
    }
    return () => {
      document.body.classList.remove('hb-no-scroll');
      document.documentElement.classList.remove('hb-no-scroll');
    };
  }, [menuOpen]);

  const defaultItems = [
    { label: "Home", url: "/", children: [] },
    { label: "Resources", url: "#", children: [] },
    { label: "Services", url: "/services", children: [] },
    {
      label: "About",
      url: "#",
      children: [
        { label: "About Us", url: "/about" },
        { label: "Contact", url: "/contact" }
      ]
    }
  ];

  // We only skip items that match the exact default labels and default URLs,
  // to prevent duplicating Home, Services, Resources, and About dropdowns.
  const isDefaultLink = (item) => {
    if (!item?.label) return false;
    const labelLower = item.label.toLowerCase().trim();
    const url = item.url || '';

    if (labelLower === 'home' && (url === '/' || url === '')) return true;
    if (labelLower === 'services' && url === '/services') return true;
    if (labelLower === 'resources' && url === '#') return true;
    if ((labelLower === 'about' || labelLower === 'about us') && (url === '#' || url === '/about')) return true;
    if (labelLower === 'contact' && url === '/contact') return true;

    return false;
  };

  const customItems = Array.isArray(navItems) ? navItems.filter(item => !isDefaultLink(item)) : [];
  const displayItems = [...defaultItems, ...customItems];

  const announcementBarEnabled = headerConfig?.announcementBar?.enabled ?? true;
  const topOffset = announcementBarEnabled ? '40px' : '0px';
  const positionClass = headerConfig?.sticky !== false ? 'fixed' : 'absolute';

  const isTransparent = headerConfig?.transparent ?? false;
  const bgClass = isTransparent ? 'bg-white/30 backdrop-blur-lg' : 'bg-white';
  const bgStyle = isTransparent ? { WebkitBackdropFilter: 'blur(48px)', top: topOffset } : { top: topOffset };

  const borderClass = headerConfig?.borderBottom !== false ? 'border-b border-[#E6EEF0]' : '';

  const shadowMap = { none: 'shadow-none', small: 'shadow-xs', medium: 'shadow-md', large: 'shadow-lg' };
  const shadowClass = shadowMap[headerConfig?.shadowSize || 'small'] || 'shadow-sm';

  const heightMap = { small: 'h-16', medium: 'h-20', large: 'h-24' };
  const heightClass = heightMap[headerConfig?.paddingY || 'medium'] || 'h-20';

  const logoType = headerConfig?.logoType || 'image';
  const logoUrl = headerConfig?.logoUrl || '/images/Logo-web.png';
  const logoText = headerConfig?.logoText || 'A Health Place';
  const logoWidth = headerConfig?.logoWidth || 360;
  const logoHeight = headerConfig?.logoHeight || 100;

  const mobileMenuEnabled = headerConfig?.mobileMenu?.enabled !== false;
  const mobileStyle = headerConfig?.mobileMenu?.layout || 'drawer';

  return (
    <>
      <Marquee />
      {/* Header */}
      <header
        className={`${positionClass} left-0 w-full flex items-center ${heightClass} ${bgClass} ${borderClass} ${shadowClass} z-[9000]`}
        style={bgStyle}
      >
        <div className="header-container flex justify-between items-center w-full mx-auto px-6 md:px-10">
          <a href="/" className="logo-link flex items-center shrink-0 min-w-[140px] md:min-w-[180px]">
            {logoType === 'image' ? (
              <img
                src={logoUrl}
                alt={`${logoText} Logo`}
                width={logoWidth}
                height={logoHeight}
                suppressHydrationWarning
                className="logo-img w-auto object-contain block transition-transform duration-300 hover:scale-[1.03]"
                style={{ maxHeight: heightClass === 'h-16' ? '36px' : heightClass === 'h-24' ? '68px' : '52px' }}
              />
            ) : (
              <span className="font-heading font-black text-xl text-primary hover:text-accent transition-colors">
                {logoText}
              </span>
            )}
          </a>

          {/* Desktop Nav - Mega Menu */}
          <nav className="nav-desktop hidden lg:flex items-center gap-2 xl:gap-4 flex-1 justify-center relative">
            {displayItems.map((item, index) => {
              const isResources = item.label.toLowerCase() === 'resources';
              if (isResources) {
                return (
                  <div key={index} className="relative group px-2 xl:px-3 py-6 -my-6">
                    <button className="flex items-center gap-1 text-[15px] font-semibold text-secondary hover:text-[#0F766E] group-hover:text-[#0F766E] py-2 px-3 transition-colors border-none bg-transparent cursor-pointer">
                      {item.label} <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                    </button>

                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                      <div className="bg-white rounded-2xl border border-[#E6EEF0] p-8 w-[850px] shadow-[0_12px_35px_rgba(0,0,0,.08)] flex gap-8">
                        {/* Featured Publication */}
                        {dynamicPublications.length > 0 && (
                          <div className="w-[30%] bg-slate-50/50 rounded-xl p-4 border border-[#E6EEF0]/80 flex flex-col">
                            <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider mb-3">Latest Publication</span>
                            <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden mb-4 shadow-sm border border-slate-100">
                              <img
                                src={dynamicPublications[0].magazine_cover_image ? proxyUrl(dynamicPublications[0].magazine_cover_image) : '/images/mag_sleep.png'}
                                alt={dynamicPublications[0].magazine_title}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <h4 className="font-bold text-[#0F766E] text-lg mb-1 leading-tight line-clamp-1" title={dynamicPublications[0].magazine_title}>
                              {dynamicPublications[0].magazine_title}
                            </h4>
                            <p className="text-xs text-[#374151] mb-5 leading-relaxed line-clamp-2" title={dynamicPublications[0].magazine_description}>
                              {dynamicPublications[0].magazine_description}
                            </p>
                            <Link href={`/magazine/${dynamicPublications[0].magazine_slug}`} className="mt-auto inline-block bg-[#0F766E] hover:bg-[#0a524c] text-white text-center py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm">
                              Read Now &rarr;
                            </Link>
                          </div>
                        )}

                        {/* Links Grid */}
                        <div className="w-[70%] flex gap-6">
                          {/* Publications */}
                          {dynamicPublications.length > 0 && (
                            <div className="flex-1 flex flex-col text-left">
                              <div className="flex items-center gap-2 mb-3">
                                <BookOpen className="w-5 h-5 text-[#0F766E]" />
                                <h4 className="font-bold text-[#0F766E] text-base">Publications</h4>
                              </div>
                              <ul className="space-y-3 mb-4 flex-1">
                                {dynamicPublications.slice(0, 4).map((pub) => (
                                  <li key={pub.id || pub.magazine_slug}>
                                    <Link href={`/magazine/${pub.magazine_slug}`} className="text-sm text-[#374151] hover:text-[#0F766E] hover:font-medium transition-colors block line-clamp-1" title={pub.magazine_title}>
                                      {pub.magazine_title}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                              <Link href="/publication" className="inline-block mt-auto text-[13px] font-bold text-[#0F766E] hover:text-[#0a524c]">View all Publications &rarr;</Link>
                            </div>
                          )}

                          {/* Blogs */}
                          {dynamicBlogs.length > 0 && (
                            <div className="flex-1 flex flex-col text-left">
                              <div className="flex items-center gap-2 mb-3">
                                <PenTool className="w-5 h-5 text-[#0F766E]" />
                                <h4 className="font-bold text-[#0F766E] text-base">Blogs</h4>
                              </div>
                              <ul className="space-y-3 mb-4 flex-1">
                                {dynamicBlogs.slice(0, 4).map((blog) => (
                                  <li key={blog.id || blog.slug}>
                                    <Link href={`/blogs/${blog.slug}`} className="text-sm text-[#374151] hover:text-[#0F766E] hover:font-medium transition-colors block line-clamp-1" title={blog.title}>
                                      {blog.title}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                              <Link href="/blogs" className="inline-block mt-auto text-[13px] font-bold text-[#0F766E] hover:text-[#0a524c]">View all Blogs &rarr;</Link>
                            </div>
                          )}

                          {/* Quizzes */}
                          {dynamicQuizzes && dynamicQuizzes.length > 0 && (
                            <div className="flex-1 flex flex-col text-left">
                              <div className="flex items-center gap-2 mb-3">
                                <Target className="w-5 h-5 text-[#0F766E]" />
                                <h4 className="font-bold text-[#0F766E] text-base">Quizzes</h4>
                              </div>
                              <ul className="space-y-3 mb-4 flex-1">
                                {dynamicQuizzes.slice(0, 4).map((quiz) => (
                                  <li key={quiz.slug}>
                                    <Link href={`/quizzes/${quiz.slug}`} className="text-sm text-[#374151] hover:text-[#0F766E] hover:font-medium transition-colors block line-clamp-1" title={quiz.title}>
                                      {quiz.title}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                              <Link href="/quizzes" className="inline-block mt-auto text-[13px] font-bold text-[#0F766E] hover:text-[#0a524c]">View all Quizzes &rarr;</Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              const hasChildren = Array.isArray(item.children) && item.children.length > 0;
              if (!hasChildren) {
                return (
                  <Link
                    key={index}
                    href={item.url}
                    className="text-[15px] font-semibold text-secondary hover:text-[#0F766E] py-2 px-3 transition-colors"
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <div key={index} className="relative group px-2 xl:px-3 py-6 -my-6">
                  <button className="flex items-center gap-1 text-[15px] font-semibold text-secondary hover:text-[#0F766E] group-hover:text-[#0F766E] py-2 px-3 transition-colors border-none bg-transparent cursor-pointer">
                    {item.label} <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                  </button>

                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                    <div className="bg-white rounded-2xl border border-[#E6EEF0] p-4 w-[240px] shadow-[0_12px_35px_rgba(0,0,0,.08)]">
                      <ul className="space-y-1">
                        {item.children.map((child, cIdx) => (
                          <li key={cIdx}>
                            <Link
                              href={child.url}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#374151] hover:text-[#0F766E] hover:bg-[#ECFEFF] transition-colors"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Actions wrapper */}
          <div className="flex items-center gap-2 lg:gap-3 z-[10000]">
            <Search />
            <NotificationBell />
            {isAuthenticated && <UserProfileDropdown />}

            <div className="hidden lg:flex items-center">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="text-[13px] font-semibold text-red-500 hover:text-red-600 transition-colors py-2.5 px-2 border-none bg-transparent cursor-pointer">
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login" className="bg-[#0F766E] hover:bg-[#0d655e] text-white px-6 py-2.5 rounded-full text-[13px] font-semibold transition-colors shadow-sm">
                  Login
                </Link>
              )}
              {headerConfig?.ctaText && (
                <Link
                  href={headerConfig.ctaLink || "/contact"}
                  className="bg-[#0F766E] hover:bg-[#0d655e] text-white px-5 py-2.5 rounded-full text-[13px] font-semibold transition-colors shadow-sm ml-2"
                >
                  {headerConfig.ctaText}
                </Link>
              )}
            </div>

            {/* Hamburger Menu Button */}
            {mobileMenuEnabled && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`lg:hidden relative w-12 h-12 rounded-full flex justify-center items-center cursor-pointer z-[10000] shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-500 border ${menuOpen ? 'bg-accent border-accent shadow-[0_6px_24px_rgba(15,124,133,0.15)]' : 'bg-white/90 border-[var(--color-border)]/80 hover:scale-105 hover:border-accent hover:shadow-[0_6px_24px_rgba(31,185,251,0.12)]'
                  }`}
                aria-label="Toggle Menu"
              >
                <div className="w-5 h-3.5 relative">
                  <span className={`w-[20px] h-[2px] rounded-sm transition-all duration-500 absolute left-0 ${menuOpen ? 'bg-white rotate-45 top-1/2 -translate-y-1/2' : 'bg-primary top-0'}`} />
                  <span className={`w-[20px] h-[2px] rounded-sm transition-all duration-500 absolute left-0 top-1/2 -translate-y-1/2 ${menuOpen ? 'opacity-0 scale-x-0' : 'bg-primary'}`} />
                  <span className={`w-[20px] h-[2px] rounded-sm transition-all duration-500 absolute left-0 ${menuOpen ? 'bg-white -rotate-45 top-1/2 -translate-y-1/2' : 'bg-primary bottom-0'}`} />
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Universal Hamburger Menu Overlay */}
        {mobileMenuEnabled && (
          <>
            {mobileStyle === 'dropdown' ? (
              /* Top Overlay Dropdown */
              <div
                className={`absolute top-full left-0 w-full bg-white/98 backdrop-blur-2xl border-b border-[#E6EEF0] shadow-2xl z-[8999] flex flex-col transition-all duration-300 ease-in-out transform origin-top`}
                style={{
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? 'scaleY(1)' : 'scaleY(0)',
                  visibility: menuOpen ? 'visible' : 'hidden'
                }}
              >
                <div className="py-8 px-6 overflow-y-auto max-h-[70vh]">
                  <nav className="flex flex-col gap-3">
                    {displayItems.map((item, idx) => {
                      const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                      if (hasChildren) {
                        const isExpanded = expandedItems[item.label];
                        return (
                          <div key={idx} className="w-full flex flex-col">
                            <button
                              onClick={() => toggleExpand(item.label)}
                              className="w-full flex justify-between items-center font-heading font-extrabold text-xl text-primary hover:text-accent py-2 border-none bg-transparent cursor-pointer text-left"
                            >
                              <span>{item.label}</span>
                              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            {isExpanded && (
                              <div className="pl-4 flex flex-col gap-2 mt-1 border-l border-[#E6EEF0]">
                                {item.children.map((child, cIdx) => (
                                  <a
                                    key={cIdx}
                                    href={child.url}
                                    onClick={() => setMenuOpen(false)}
                                    className="font-heading font-bold text-base text-secondary hover:text-accent py-1 block text-left"
                                  >
                                    {child.label}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <a
                          key={idx}
                          href={item.url}
                          onClick={() => setMenuOpen(false)}
                          className="font-heading font-extrabold text-xl text-primary hover:text-accent py-2 transition-all block text-left"
                        >
                          {item.label}
                        </a>
                      );
                    })}
                    {isAuthenticated ? (
                      <>
                        <button
                          onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                          className="font-heading font-extrabold text-xl text-red-500 hover:text-red-600 py-2 transition-all text-left border-none bg-transparent cursor-pointer"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <a
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="font-heading font-extrabold text-xl text-primary hover:text-accent py-2 transition-all block text-left"
                      >
                        Login
                      </a>
                    )}
                    {headerConfig?.ctaText && (
                      <div className="mt-4 pt-4 border-t border-[#E6EEF0]">
                        <a
                          href={headerConfig.ctaLink || "/contact"}
                          onClick={() => setMenuOpen(false)}
                          className="font-heading font-extrabold text-sm text-white bg-[#0F766E] hover:bg-[#0d655e] text-center px-5 py-3 rounded-full transition-all block w-full"
                        >
                          {headerConfig.ctaText}
                        </a>
                      </div>
                    )}
                  </nav>
                </div>
              </div>
            ) : (
              /* Slide-over Side Drawer */
              <>
                {/* Overlay Backdrop */}
                <div
                  onClick={() => setMenuOpen(false)}
                  className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[10001] transition-opacity duration-300 ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                    }`}
                />
                {/* Drawer Panel */}
                <div
                  className={`fixed top-0 right-0 h-full w-full max-w-xs bg-white z-[10002] shadow-2xl flex flex-col p-6 transition-transform duration-300 ease-in-out transform ${menuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                  {/* Header inside drawer */}
                  <div className="flex items-center justify-between pb-6 border-b border-[#E6EEF0] mb-6">
                    <a href="/" className="logo-link flex items-center shrink-0">
                      {logoType === 'image' ? (
                        <img
                          src={logoUrl}
                          alt={`${logoText} Logo`}
                          width={logoWidth}
                          height={logoHeight}
                          suppressHydrationWarning
                          className="logo-img w-auto object-contain block"
                          style={{ maxHeight: '40px' }}
                        />
                      ) : (
                        <span className="font-heading font-black text-xl text-primary hover:text-accent transition-colors">
                          {logoText}
                        </span>
                      )}
                    </a>
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="p-1 rounded-full hover:bg-slate-100 border-none bg-transparent cursor-pointer"
                    >
                      <div className="w-5 h-5 relative flex items-center justify-center">
                        <span className="w-[18px] h-[2px] bg-primary rotate-45 absolute" />
                        <span className="w-[18px] h-[2px] bg-primary -rotate-45 absolute" />
                      </div>
                    </button>
                  </div>

                  {/* Scrollable menu links */}
                  <nav className="flex-1 overflow-y-auto flex flex-col gap-4 text-left">
                    {displayItems.map((item, idx) => {
                      const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                      if (hasChildren) {
                        const isExpanded = expandedItems[item.label];
                        return (
                          <div key={idx} className="w-full flex flex-col">
                            <button
                              onClick={() => toggleExpand(item.label)}
                              className="w-full flex justify-between items-center font-heading font-extrabold text-2xl text-primary hover:text-accent py-1 border-none bg-transparent cursor-pointer text-left"
                            >
                              <span>{item.label}</span>
                              <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            {isExpanded && (
                              <div className="pl-4 flex flex-col gap-2.5 mt-2 border-l border-[#E6EEF0]">
                                {item.children.map((child, cIdx) => (
                                  <a
                                    key={cIdx}
                                    href={child.url}
                                    onClick={() => setMenuOpen(false)}
                                    className="font-heading font-bold text-lg text-secondary hover:text-accent py-0.5 block text-left"
                                  >
                                    {child.label}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <a
                          key={idx}
                          href={item.url}
                          onClick={() => setMenuOpen(false)}
                          className="font-heading font-extrabold text-2xl text-primary hover:text-accent py-1 block text-left"
                        >
                          {item.label}
                        </a>
                      );
                    })}
                    <div className="border-t border-[#E6EEF0] pt-4 mt-2 flex flex-col gap-4">
                      {isAuthenticated ? (
                        <>
                          <button
                            onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                            className="font-heading font-extrabold text-2xl text-red-500 hover:text-red-600 py-1 text-left border-none bg-transparent cursor-pointer"
                          >
                            Logout
                          </button>
                        </>
                      ) : (
                        <a
                          href="/login"
                          onClick={() => setMenuOpen(false)}
                          className="font-heading font-extrabold text-2xl text-primary hover:text-accent py-1 block"
                        >
                          Login
                        </a>
                      )}
                    </div>
                    {headerConfig?.ctaText && (
                      <a
                        href={headerConfig.ctaLink || "/contact"}
                        onClick={() => setMenuOpen(false)}
                        className="font-heading font-extrabold text-base text-white bg-[#0F766E] hover:bg-[#0d655e] text-center px-5 py-3 rounded-full transition-all block mt-6 w-full"
                      >
                        {headerConfig.ctaText}
                      </a>
                    )}
                  </nav>
                </div>
              </>
            )}
          </>
        )}
      </header>
    </>
  );
}
