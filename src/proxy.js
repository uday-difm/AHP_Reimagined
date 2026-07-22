import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// In-memory cache for middleware settings and redirects (30s TTL)
const middlewareCache = {
  settings: {},   // key: siteId, value: { data: ws, expiresAt: number }
  redirects: {},  // key: siteId_source, value: { data: rule, expiresAt: number }
};
const CACHE_TTL_MS = process.env.NODE_ENV === "development" ? 0 : 30000;

/** Path prefixes that should never be blocked by maintenance mode */
const SKIP_PREFIXES = [
  "/api/",
  "/_next",
  "/dashboard",
  "/crm",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/maintenance",
  "/preview"
];

/** Static file extensions to skip checks for */
const STATIC_EXTENSIONS = [
  ".js",
  ".css",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".webp",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".json",
  ".txt",
  ".xml",
];

function shouldSkipMaintenanceCheck(pathname) {
  if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }
  if (STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
    return true;
  }
  if (pathname === "/favicon.ico") return true;
  return false;
}

export async function proxy(request) {
  const origin = request.headers.get("origin") || "*";
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 1. Always inject x-pathname header so the layout and other components can read the current route path
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  let response = NextResponse.next({ request: { headers: requestHeaders } });

  // --------------- Private Services SEO Guard ---------------
  if (pathname.startsWith("/services/private/")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  // --------------- CORS handling (API routes only) ---------------
  if (pathname.startsWith("/api/")) {
    if (request.method === "OPTIONS") {
      const preflightHeaders = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, x-site-id, x-integration-key, x-requested-with, ngrok-skip-browser-warning",
        "Access-Control-Max-Age": "86400",
      };
      return new NextResponse(null, {
        status: 204,
        headers: preflightHeaders,
      });
    }

    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-site-id, x-integration-key, x-requested-with, ngrok-skip-browser-warning"
    );
    return response;
  }

  // Determine siteId from request, or fall back to environment variable configuration
  const siteId =
    request.headers.get("x-site-id") ||
    url.searchParams.get("siteId") ||
    process.env.SITE_ID ||
    process.env.NEXT_PUBLIC_SITE_ID ||
    "infinium";

// --------------- Admin/CRM Auth Guard ---------------
  const ADMIN_PATHS = ["/dashboard", "/crm", "/preview"];
  const isDashboardPath = ADMIN_PATHS.some((p) => pathname.startsWith(p)) && !pathname.startsWith("/dashboard/login");
  if (isDashboardPath) {
    let token = null;
    try {
      const { getToken } = await import("next-auth/jwt");
      token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: process.env.NODE_ENV === "production" ? "__Secure-dashboard-session-token" : "dashboard-session-token",
        secureCookie: process.env.NODE_ENV === "production"
      });
    } catch (err) {
      console.error("[Middleware] JWT verification error:", err);
    }

    if (!token || token.globalRole === "USER" || token.globalRole === "VISITOR" || !token.globalRole) {
      const loginUrl = new URL("/dashboard/login", url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // --------------- Parallelized Maintenance & Redirect Checks ---------------
  const checkMaintenance = !shouldSkipMaintenanceCheck(pathname);
  const checkRedirect = !pathname.startsWith("/api/") &&
                        !pathname.startsWith("/_next") &&
                        !pathname.startsWith("/maintenance") &&
                        !isDashboardPath;

  if (checkMaintenance || checkRedirect) {
    const now = Date.now();
    const settingsCacheKey = siteId;
    const redirectCacheKey = `${siteId}_${pathname}`;

    // Determine if we need to fetch settings
    let settingsPromise = null;
    let cachedSettings = middlewareCache.settings[settingsCacheKey];
    if (checkMaintenance && (!cachedSettings || cachedSettings.expiresAt < now)) {
      settingsPromise = prisma.globalSettings.findUnique({
        where: { siteId },
        select: { websiteSettings: true }
      }).catch(err => { console.error("Maintenance check failed:", err.message); return null; });
    }

    // Determine if we need to fetch redirect
    let redirectPromise = null;
    let cachedRedirect = middlewareCache.redirects[redirectCacheKey];
    if (checkRedirect && (!cachedRedirect || cachedRedirect.expiresAt < now)) {
      const formattedSource = pathname.trim().startsWith("/") ? pathname.trim() : `/${pathname.trim()}`;
      redirectPromise = prisma.redirect.findUnique({
        where: { siteId_source: { siteId, source: formattedSource } }
      }).catch(err => { console.error("Redirect check failed:", err.message); return null; });
    }

    if (settingsPromise || redirectPromise) {
      console.log(`[Middleware] Fetching updates in parallel: settings=${!!settingsPromise}, redirect=${!!redirectPromise}`);
      try {
        const [settingsResult, redirectResult] = await Promise.all([settingsPromise, redirectPromise]);

        if (settingsPromise) {
          const ws = settingsResult?.websiteSettings;
          middlewareCache.settings[settingsCacheKey] = {
            data: ws || null,
            expiresAt: now + CACHE_TTL_MS
          };
          cachedSettings = middlewareCache.settings[settingsCacheKey];
        }

        if (redirectPromise) {
          const rule = redirectResult;
          middlewareCache.redirects[redirectCacheKey] = {
            data: rule || null,
            expiresAt: now + CACHE_TTL_MS
          };
          cachedRedirect = middlewareCache.redirects[redirectCacheKey];
        }
      } catch (err) {
        console.error("Parallel fetch failed in middleware:", err.message);
      }
    } else {
      console.log(`[Middleware] Cache hit for settings & redirect. Skipping fetch.`);
    }

    // Handle Maintenance Mode
    if (checkMaintenance && cachedSettings?.data) {
      const ws = cachedSettings.data;
      if (ws.maintenanceMode === true) {
        const maintenanceUrl = new URL("/maintenance", url);
        if (ws.maintenanceMessage) {
          maintenanceUrl.searchParams.set("message", ws.maintenanceMessage);
        }
        if (ws.maintenanceImage) {
          maintenanceUrl.searchParams.set("image", ws.maintenanceImage);
        }
        return NextResponse.redirect(maintenanceUrl);
      }
    }

    // Handle Redirects
    if (checkRedirect && cachedRedirect?.data) {
      const rule = cachedRedirect.data;
      console.log(`[Middleware] Evaluating redirect for ${pathname} -> target: ${rule.target}, type: ${rule.type}`);
      if (rule.target && rule.target !== pathname) {
        const redirectUrl = new URL(rule.target, url);
        const status = parseInt(rule.type) || 301;
        console.log(`[Middleware] Executing redirect to ${redirectUrl.toString()} with status ${status}`);
        return NextResponse.redirect(redirectUrl, status);
      }
    } else if (checkRedirect) {
       console.log(`[Middleware] No active redirect found for ${pathname}`);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // API routes (with CORS handling)
    "/api/:path*",
    // All page routes (for maintenance, redirects, auth guard)
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
