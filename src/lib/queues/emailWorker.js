import { Worker } from "bullmq";
import { redis } from "../redis";
import prisma from "../prisma";
import { emailService } from "../../services/email.service";

let worker = null;

export function startEmailWorker() {
  if (worker) return worker; // idempotent guard

  worker = new Worker(
    "email-campaign",
    async (job) => {
      const { campaignId, subscriberId } = job.data;
      
      const campaign = await prisma.emailCampaign.findUnique({
        where: { id: campaignId }
      });
      if (!campaign) throw new Error(`Campaign ${campaignId} not found`);

      const sub = await prisma.subscriber.findUnique({
        where: { id: subscriberId }
      });
      if (!sub) throw new Error(`Subscriber ${subscriberId} not found`);
      if (sub.status !== "active") return;

      const { transporter, fromEmail } = await emailService.getTransporterForSite(campaign.siteId);

      try {
        await transporter.sendMail({
          from: `"Global Backend" <${fromEmail}>`,
          to: sub.email,
          subject: campaign.subject,
          html: campaign.body
        });

        await prisma.campaignLog.upsert({
          where: {
            campaignId_subscriberId: {
              campaignId,
              subscriberId: sub.id,
            },
          },
          update: {
            status: "sent",
            sentAt: new Date(),
            errorMessage: null,
          },
          create: {
            campaignId,
            subscriberId: sub.id,
            status: "sent",
            sentAt: new Date(),
          },
        });
      } catch (err) {
        await prisma.campaignLog.upsert({
          where: {
            campaignId_subscriberId: {
              campaignId,
              subscriberId: sub.id,
            },
          },
          update: {
            status: "failed",
            errorMessage: err.message,
          },
          create: {
            campaignId,
            subscriberId: sub.id,
            status: "failed",
            errorMessage: err.message,
          },
        });
        throw err; // Ensure BullMQ registers failure
      }
    },
    { connection: redis, concurrency: 10 }
  );

  worker.on("completed", async (job) => {
    try {
      const campaignId = job.data.campaignId;
      // Check if all active subscribers for this campaign have a log entry
      const campaign = await prisma.emailCampaign.findUnique({
        where: { id: campaignId },
        include: { list: { include: { subscribers: { include: { subscriber: true } } } } }
      });
      
      if (!campaign || !campaign.list) return;
      
      const activeMembers = campaign.list.subscribers.filter(m => m.subscriber.status === "active");
      const totalActive = activeMembers.length;
      
      const logCount = await prisma.campaignLog.count({
        where: { campaignId }
      });

      if (logCount >= totalActive && campaign.status !== "sent") {
        await prisma.emailCampaign.update({
          where: { id: campaignId },
          data: { status: "sent", sentAt: new Date() }
        });
      }
    } catch (err) {
      console.error(`[EmailWorker] Error on job completed for job ${job.id}:`, err.message);
    }
  });

  worker.on("failed", (job, err) => {
    console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
