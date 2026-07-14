/**
 * instrumentation.js
 *
 * Next.js runs this file ONCE on server startup (both dev and prod).
 * Dynamically imports and runs route synchronization only in Node.js runtime,
 * completely bypassing Edge compiler checks.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV === "development") {
    try {
      const { syncRoutes } = await import("./lib/routeSync.js");
      await syncRoutes();
    } catch (err) {
      console.error("[AHP Startup] Failed to load routeSync module:", err);
    }
  }
}
