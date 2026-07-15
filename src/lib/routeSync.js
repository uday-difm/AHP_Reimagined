/**
 * routeSync.js
 *
 * Route synchronization strategy:
 * - Build-time discovery is the single source of truth for WHICH routes exist (scanning src/app and writing to discovered-routes.json).
 * - Production runtime sync (instrumentation.js) reads directly from the compile-time imported discovered-routes.json snapshot
 *   and pushes it to the database on cold starts, completely bypassing filesystem reads which are unreliable on serverless.
 * - Development runtime sync attempts live filesystem scans and falls back to discovered-routes.json if the scan is empty.
 */
import path from "path";
import fs from "fs";
import prisma from "./prisma.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const prebuiltRoutes = require("./discovered-routes.json");

const SITE_ID = process.env.SITE_ID || "AHP";

const EXCLUDED_PREFIXES = [
  "/dashboard",
  "/crm",
  "/api",
  "/preview",
  "/maintenance",
  "/all-played-quiz",
  "/yourmove",
  "/login",
  "/forgot-password",
  "/reset-password",
];

function slugToTitle(slug) {
  if (slug === "/") return "Home";

  const last = slug.split("/").filter(Boolean).pop() || "";

  if (last.startsWith("[") && last.endsWith("]")) {
    const parent = slug.split("/").filter(Boolean).slice(-2, -1)[0] || "";
    const name = parent.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return `${name} Detail`.trim();
  }

  return last
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function discoverPageDirs(dir, found = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }

  const hasPage = entries.some(
    (e) => e.isFile() && (e.name === "page.js" || e.name === "page.jsx")
  );

  if (hasPage) {
    found.push(dir);
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      discoverPageDirs(path.join(dir, entry.name), found);
    }
  }

  return found;
}

function dirToSlug(dir, appDir) {
  const relative = path.relative(appDir, dir).replace(/\\/g, "/");
  return relative === "" ? "/" : `/${relative}`;
}

export async function syncRoutes() {
  try {
    let routes = [];
    const isProd = process.env.NODE_ENV === "production";

    if (isProd) {
      routes = prebuiltRoutes || [];
      console.log(`[${SITE_ID} Startup] Production mode: Loaded ${routes.length} pre-built routes from discovered-routes.json`);
    } else {
      const appDir = path.join(process.cwd(), "src", "app");
      const pageDirs = discoverPageDirs(appDir);

      if (pageDirs.length > 0) {
        routes = pageDirs
          .map((dir) => dirToSlug(dir, appDir))
          .filter((slug) => !EXCLUDED_PREFIXES.some((prefix) => slug.startsWith(prefix)))
          .map((slug) => ({
            slug,
            title: slugToTitle(slug),
            isDynamic: slug.includes("["),
          }));
      } else {
        routes = prebuiltRoutes || [];
        if (routes.length > 0) {
          console.warn(`[${SITE_ID} Startup] Live route discovery found 0 pages — falling back to discovered-routes.json`);
        }
      }
    }

    // Ensure site exists
    const isAHP = SITE_ID === "AHP" || SITE_ID === "AHealthPlace";
    await prisma.site.upsert({
      where: { id: SITE_ID },
      update: {},
      create: {
        id: SITE_ID,
        name: isAHP ? "A Health Place" : "Earth By Humans",
        domain: isAHP ? "ahealthplace.com" : "earthbyhumans.com",
        isActive: true,
      },
    });

    let synced = 0;
    for (const route of routes) {
      try {
        await prisma.page.upsert({
          where: { siteId_slug: { siteId: SITE_ID, slug: route.slug } },
          update: {
            title: route.title,
            isManagedBySync: true,
            isDiscovered: true,
          },
          create: {
            siteId: SITE_ID,
            slug: route.slug,
            title: route.title,
            status: "PUBLISHED",
            isManagedBySync: true,
            isDiscovered: true,
            isHardcoded: !route.isDynamic,
            publishedAt: new Date(),
          },
        });
        synced++;
      } catch (upsertErr) {
        const errMsg = upsertErr.message || "";
        if (errMsg.includes("Lock wait timeout") || errMsg.includes("deadlock") || errMsg.includes("1205")) {
          console.warn(`[${SITE_ID} Startup] ⚠️ Lock wait timeout/deadlock on upserting route ${route.slug}. Skipping this route (handled by concurrent sync).`);
        } else {
          throw upsertErr;
        }
      }
    }

    const activeSlugs = routes.map((r) => r.slug);
    let deleteCount = 0;
    try {
      const deleteResult = await prisma.page.deleteMany({
        where: {
          siteId: SITE_ID,
          isDiscovered: true,
          slug: {
            notIn: activeSlugs,
          },
        },
      });
      deleteCount = deleteResult.count;
    } catch (delErr) {
      const delMsg = delErr.message || "";
      if (delMsg.includes("Lock wait timeout") || delMsg.includes("deadlock") || delMsg.includes("1205")) {
        console.warn(`[${SITE_ID} Startup] ⚠️ Lock wait timeout/deadlock on cleaning up obsolete pages. Skipping cleanup (concurrent instance active).`);
      } else {
        console.error(`[${SITE_ID} Startup] ⚠️ Failed to delete obsolete pages:`, delErr.message);
      }
    }

    console.log(
      `[${SITE_ID} Startup] ✅ Auto-discovered and synced ${synced} routes to global backend.`
    );
    if (deleteCount > 0) {
      console.log(
        `[${SITE_ID} Startup] 🗑️ Cleaned up ${deleteCount} obsolete pages from database.`
      );
    }
  } catch (err) {
    console.error(`[${SITE_ID} Startup] ⚠️ Route sync failed:`, err.message);
  }
}
