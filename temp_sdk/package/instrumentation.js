/**
 * @yourcompany/global-backend-next — Auto-Sync Instrumentation
 *
 * This file is the Next.js Instrumentation Hook for the Global Backend SDK.
 * It automatically syncs the frontend's page routes to the backend CMS
 * every time the Next.js server starts (dev or production).
 *
 * ── Setup (one-time, per frontend project) ───────────────────────────────
 *
 *  1. Create `src/instrumentation.js` (or `instrumentation.ts`) in your
 *     Next.js project root with this single line:
 *
 *       export { register } from "@yourcompany/global-backend-next/instrumentation";
 *
 *  2. Make sure these env vars are set in your `.env` / `.env.local`:
 *
 *       NEXT_PUBLIC_CMS_BASE_URL=http://localhost:3000
 *       NEXT_PUBLIC_SITE_ID=your_site_id
 *       CMS_INTEGRATION_KEY=your_integration_key
 *
 *  3. That's it. Every `npm run dev` or `npm start` will auto-sync routes.
 *
 * ── How it works ─────────────────────────────────────────────────────────
 *
 *  Next.js calls `register()` once per server process start, before any
 *  request is served. This function scans the `src/app` (or `app`) directory
 *  for all `page.js / page.jsx / page.tsx` files, builds a route manifest,
 *  and POSTs it to `/api/integrations/next-sync/manifest` on the backend.
 *
 *  - Skips dynamic routes (e.g. [slug], [...params])
 *  - Removes Next.js route groups (e.g. (marketing), (auth))
 *  - Non-blocking: a sync failure logs a warning but never crashes the server
 *  - De-duplicates: uses a module-level flag so it only runs once per process
 * ─────────────────────────────────────────────────────────────────────────
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ── Helpers ───────────────────────────────────────────────────────────────

function getAppRouterPath(cwd) {
  const srcApp = path.join(cwd, "src", "app");
  const rootApp = path.join(cwd, "app");
  if (fs.existsSync(srcApp)) return { absolute: srcApp, relative: "src/app" };
  if (fs.existsSync(rootApp)) return { absolute: rootApp, relative: "app" };
  return null;
}

function findPages(dir, baseAbsolute, routesList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const folderName = file.toLowerCase();
      // Skip scanning admin, auth, and system directories
      if (
        folderName === "admin" ||
        folderName === "crm" ||
        folderName === "login" ||
        folderName === "forgot-password" ||
        folderName === "reset-password" ||
        folderName === "preview" ||
        folderName === "maintenance"
      ) {
        return;
      }
      findPages(fullPath, baseAbsolute, routesList);
    } else if (
      file.toLowerCase().startsWith("page.") &&
      (file.endsWith(".js") || file.endsWith(".jsx") || file.endsWith(".tsx"))
    ) {
      const relativeFilePath = path
        .relative(process.cwd(), fullPath)
        .replace(/\\/g, "/");

      const routeFolder = path
        .relative(baseAbsolute, dir)
        .replace(/\\/g, "/");

      let slug =
        "/" +
        routeFolder
          .split("/")
          .filter(
            (seg) => seg && !seg.startsWith("(") && !seg.endsWith(")")
          )
          .join("/");

      if (slug === "//" || slug === "") slug = "/";

      // Skip dynamic routes ([slug], [...params])
      if (slug.includes("[") && slug.includes("]")) return;

      // Skip administrative / system routes
      const lowerSlug = slug.toLowerCase();
      if (
        lowerSlug === "/login" ||
        lowerSlug === "/forgot-password" ||
        lowerSlug === "/reset-password" ||
        lowerSlug === "/maintenance" ||
        lowerSlug.startsWith("/admin") ||
        lowerSlug.startsWith("/crm") ||
        lowerSlug.startsWith("/preview")
      ) {
        return;
      }

      let title = slug === "/" ? "Home" : slug.split("/").pop();
      if (title) {
        title = title.replace(/[\[\]\.\+]/g, "");
        title = title.charAt(0).toUpperCase() + title.slice(1);
      }

      routesList.push({
        slug,
        path: relativeFilePath,
        type: "static",
        title: title || "New Page",
      });
    }
  });
  return routesList;
}

// ── Core sync function ────────────────────────────────────────────────────

async function runSync() {
  const CMS_BASE_URL =
    process.env.NEXT_PUBLIC_CMS_BASE_URL || "http://localhost:3000";
  const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID;
  const INTEGRATION_KEY = process.env.CMS_INTEGRATION_KEY;

  if (!SITE_ID) {
    console.warn(
      "[CMS SDK] ⚠️  Auto-sync skipped: NEXT_PUBLIC_SITE_ID is not set."
    );
    return;
  }

  const cwd = process.cwd();
  const appPath = getAppRouterPath(cwd);

  if (!appPath) {
    console.warn(
      "[CMS SDK] ⚠️  Auto-sync skipped: could not find src/app or app directory."
    );
    return;
  }

  const routes = findPages(appPath.absolute, appPath.absolute);

  if (routes.length === 0) {
    console.log("[CMS SDK] ℹ️  Auto-sync: no static routes found.");
    return;
  }

  const syncEndpoint = `${CMS_BASE_URL.replace(/\/$/, "")}/api/integrations/next-sync/manifest`;

  const payload = {
    siteId: SITE_ID,
    source: "sdk-instrumentation",
    generatedAt: new Date().toISOString(),
    routes,
  };

  try {
    const res = await fetch(syncEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(INTEGRATION_KEY ? { "x-integration-key": INTEGRATION_KEY } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }

    const result = data.data || data;
    console.log(
      `[CMS SDK] ✅ Route sync complete — ` +
        `${result.created?.length ?? 0} created, ` +
        `${result.updated?.length ?? 0} updated, ` +
        `${result.deleted?.length ?? 0} removed ` +
        `(${routes.length} routes for site: ${SITE_ID})`
    );
  } catch (err) {
    // Non-fatal — never crash the frontend server over a sync failure
    console.warn(`[CMS SDK] ⚠️  Route sync failed (non-fatal): ${err.message}`);
  }
}

// ── Next.js Instrumentation Hook ─────────────────────────────────────────

let _syncRan = false;

/**
 * Next.js `register()` hook — called automatically once per server process.
 *
 * Re-export this from your `src/instrumentation.js`:
 *   export { register } from "@yourcompany/global-backend-next/instrumentation";
 */
async function register() {
  // Only run in the Node.js runtime (not Edge), and only once per process
  if (
    process.env.NEXT_RUNTIME !== "nodejs" &&
    process.env.NEXT_RUNTIME !== undefined
  ) {
    return;
  }

  if (_syncRan) return;
  _syncRan = true;

  // Small delay so the server settles before hitting the backend
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await runSync();
}

module.exports = { register, runSync };
