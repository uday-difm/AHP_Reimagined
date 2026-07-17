import { Worker } from "bullmq";
import { redis } from "../redis";
import { emailService } from "../../services/email.service";
import prisma from "../prisma";

let worker = null;

export function startSystemEmailWorker() {
  if (worker) return worker; // idempotent guard

  worker = new Worker(
    "system-email",
    async (job) => {
      const { siteId, to, subject, text, html } = job.data;
      
      const { transporter, fromEmail } = await emailService.getTransporterForSite(siteId);

      await transporter.sendMail({
        from: `"System Alerts" <${fromEmail}>`,
        to,
        subject,
        text,
        html,
      });
    },
    { connection: redis, concurrency: 5 } // Lower concurrency for system emails
  );

  worker.on("failed", (job, err) => {
    console.error(`[SystemEmailWorker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
