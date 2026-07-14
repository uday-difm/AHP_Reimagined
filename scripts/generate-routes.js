const fs = require("fs");
const path = require("path");

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

async function run() {
  console.log("🔍 Running route discovery script...");
  const appDir = path.join(process.cwd(), "src", "app");
  const pageDirs = discoverPageDirs(appDir);

  const routes = pageDirs
    .map((dir) => dirToSlug(dir, appDir))
    .filter(
      (slug) => !EXCLUDED_PREFIXES.some((prefix) => slug.startsWith(prefix))
    )
    .map((slug) => ({
      slug,
      title: slugToTitle(slug),
      isDynamic: slug.includes("["),
    }));

  const outputPath = path.join(process.cwd(), "src", "lib", "discovered-routes.json");
  
  // Create src/lib directory if it doesn't exist
  const libDir = path.dirname(outputPath);
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }

  if (routes.length === 0) {
    console.error("❌ ERROR: Route discovery failed! Found 0 routes. Failing build loudly.");
    process.exit(1);
  }

  fs.writeFileSync(outputPath, JSON.stringify(routes, null, 2));
  console.log(`✅ Successfully discovered and wrote ${routes.length} routes to ${outputPath}`);

  // Sync routes to the database during build
  if (!process.env.DATABASE_URL) {
    console.warn(`
========================================================================
⚠️  WARNING: DATABASE_URL is missing during build time!
------------------------------------------------------------------------
- Route sync to the database could NOT run during compilation.
- Syncing will fall back entirely to runtime (instrument://instrumentation.js)
  on Vercel cold starts.
- Please ensure "discovered-routes.json" is committed and up to date.
========================================================================
    `);
  } else {
    try {
      console.log("🗄️ Syncing routes to database during build...");
      // Prisma uses ts/esm config, so we dynamic import routeSync
      const { syncRoutes } = await import("../src/lib/routeSync.js");
      await syncRoutes();
    } catch (dbErr) {
      console.error(`
========================================================================
❌ ERROR: Database route sync failed during build!
------------------------------------------------------------------------
- Error: ${dbErr.message}
- Details: ${dbErr.stack || dbErr}
- The build will continue, and routes will attempt to sync at runtime instead.
========================================================================
      `);
    }
  }
}

run();
