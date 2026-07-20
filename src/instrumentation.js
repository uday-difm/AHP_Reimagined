import { PHASE_PRODUCTION_BUILD } from "next/constants";

/**
 * instrumentation.js
 *
 * NOTE ON DEPLOYMENT: This app is designed to run as ONE persistent Next.js
 * process (`next start`), not serverless functions. Both web serving and 
 * background email job processing happen in this same process, started here.
 * Requires a reachable REDIS_URL.
 *
 * Next.js runs this file on server startup (both dev and prod cold 
 * starts). Route sync should run here on real runtime cold starts, but 
 * NOT during `next build` — the build's static-generation phase also 
 * bootstraps this file, and scripts/generate-routes.js already handles 
 * the build-time sync explicitly. Running both concurrently causes 
 * MySQL lock-wait-timeout collisions on the Page table.
 */
let workerStarted = false;

export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD
  ) {
    try {
      const { syncRoutes } = await import("./lib/routeSync.js");
      await syncRoutes();
    } catch (err) {
      console.error("[Startup] Failed to load routeSync module:", err);
    }

    if (!workerStarted) {
      workerStarted = true;
      try {
        const { startEmailWorker } = await import("./lib/queues/emailWorker.js");
        startEmailWorker();
        console.log("[Startup] Email campaign worker started in-process.");
        
        const { startWebhookWorker } = await import("./lib/queues/webhookWorker.js");
        startWebhookWorker();
        console.log("[Startup] Webhook worker started in-process.");
        
        const { startSystemEmailWorker } = await import("./lib/queues/systemEmailWorker.js");
        startSystemEmailWorker();
        console.log("[Startup] System email worker started in-process.");

        const { startBackupWorker } = await import("./lib/queues/backupWorker.js");
        startBackupWorker();
        console.log("[Startup] Backup worker started in-process.");

        // Schedule automated daily + weekly backups for all active sites
        const { scheduleAutomatedBackups } = await import("./lib/queues/backupQueue.js");
        const { default: prisma } = await import("./lib/prisma.js");
        const sites = await prisma.site.findMany({ select: { id: true } });
        for (const site of sites) {
          await scheduleAutomatedBackups(site.id);
        }
        console.log(`[Startup] Automated backups scheduled for ${sites.length} site(s).`);
      } catch (err) {
        console.error("[Startup] Failed to start background workers:", err);
      }
    }
  }
}
