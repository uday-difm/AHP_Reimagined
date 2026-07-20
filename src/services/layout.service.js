/**
 * Layout service — fetches global settings, navigation, and footer data
 * directly from the database for the infinium frontend, avoiding local HTTP requests.
 */
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const FALLBACK = {
  siteName: "A Health Place",
  logoUrl: "/images/Logo-web.png",
  footerLogoUrl: "/images/Logo-web.png",
  faviconUrl: "/favicon.ico",
  tagline: "Building Wellness into Your Life",
  navigation: [],
  footerLinks: [],
  copyright: `© ${new Date().getFullYear()} A Health Place. All rights reserved.`,
};

/**
 * Fetch all layout data from DB in parallel.
 * Wrapped with unstable_cache to run exactly once per build/revalidation period,
 * drastically reducing database connections during static generation of hundreds of pages.
 */
const fetchLayoutData = async () => {
  const siteId = process.env.NEXT_PUBLIC_SITE_ID || "AHP";
  try {
    const [site, settings, legalPages] = await Promise.all([
      prisma.site.findUnique({
        where: { id: siteId },
        select: { isActive: true, deletedAt: true }
      }),
      prisma.globalSettings.findUnique({
        where: { siteId },
        select: { 
          websiteSettings: true,
          header: true,
          footer: true,
          navigation: true,
          compliance: true,
          analytics: true,
          securityControls: true,
          emailSettings: true,
          ctaConfig: true,
          scripts: true,
          performanceConfig: true,
          adSettings: true
        }
      }),
      prisma.legalPage.findMany({
        where: { siteId, deletedAt: null },
        select: { title: true, type: true }
      }).catch(() => [])
    ]);

    const isActive = site ? (site.isActive && !site.deletedAt) : false;
    const ws = settings?.websiteSettings || {};
    const header = settings?.header || {};
    const footer = settings?.footer || {};
    const navigation = settings?.navigation || {};
    const navItems = navigation.main || [];
    const adSettings = settings?.adSettings || {};

    const dbLogoUrl = header.logoUrl || ws.logoUrl;
    const dbFooterLogoUrl = footer.logoUrl || (footer.columns && footer.columns[0]?.logoUrl) || dbLogoUrl;

    const mappedLegalLinks = (legalPages || []).map(page => {
      let slugType = page.type;
      if (page.type === "privacy") slugType = "privacy-policy";
      else if (page.type === "terms") slugType = "terms-of-use";
      else if (page.type === "cookies") slugType = "cookie-policy";
      
      return {
        label: page.title,
        url: `/legal/${slugType}`
      };
    });

    const baseFooterLinks = footer.links || footer.items || [];
    const footerLinks = baseFooterLinks.length > 0 ? [...baseFooterLinks] : [
      { label: "About", url: "/about" },
      { label: "Contact Us", url: "/contact" }
    ];

    mappedLegalLinks.forEach(link => {
      if (!footerLinks.some(fl => fl.url === link.url || fl.label.toLowerCase() === link.label.toLowerCase())) {
        footerLinks.push(link);
      }
    });

    const securityControls = settings?.securityControls || {};
    const publicSecurityControls = {
      recaptchaSiteKey: securityControls.recaptchaSiteKey || null
    };

    const emailSettings = settings?.emailSettings || {};
    const oneSignalAppId = emailSettings.oneSignalAppId || null;
    const novuWorkflowId = emailSettings.novuWorkflowId || null;

    return {
      siteName: ws.title || FALLBACK.siteName,
      logoUrl: dbLogoUrl || FALLBACK.logoUrl,
      footerLogoUrl: dbFooterLogoUrl || FALLBACK.footerLogoUrl,
      tagline: ws.tagline || FALLBACK.tagline,
      faviconUrl: ws.favicon || FALLBACK.faviconUrl,
      titleTemplate: ws.titleTemplate || null,
      description: ws.description || null,
      ogImageUrl: ws.ogImageUrl || null,
      navigation: navItems,
      footerLinks,
      footerColumns: footer.columns || [],
      copyright: footer.copyright || FALLBACK.copyright,
      isActive,
      maintenanceMode: ws.maintenanceMode === true,
      maintenanceMessage: ws.maintenanceMessage || "We are currently undergoing scheduled maintenance. Please check back shortly.",
      analytics: settings?.analytics || null,
      securityControls: publicSecurityControls,
      oneSignalAppId,
      novuWorkflowId,
      adSettings,
      rawSettings: {
        isActive,
        websiteSettings: ws,
        ctaConfig: settings?.ctaConfig || null,
        compliance: settings?.compliance || null,
        analytics: settings?.analytics || null,
        securityControls: publicSecurityControls,
        oneSignalAppId,
        novuWorkflowId,
        adSettings,
        scripts: settings?.scripts || null,
        performanceConfig: settings?.performanceConfig || null
      },
    };
  } catch (err) {
    console.error("fetchLayoutData failed, using fallback:", err);
    return {
      ...FALLBACK,
      isActive: true,
      maintenanceMode: false,
      maintenanceMessage: "",
    };
  }
};

export const getLayoutData = unstable_cache(
  fetchLayoutData,
  ['global-layout-data'],
  { revalidate: 3600, tags: ['layout'] }
);
