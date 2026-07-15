import prisma from "@/lib/prisma";
import { emailService } from "./email.service";

export const campaignService = {
  async getTemplates(siteId) {
    return prisma.emailTemplate.findMany({
      where: { siteId },
      orderBy: { createdAt: "desc" }
    });
  },

  async createTemplate(siteId, data) {
    const { name, subject, htmlContent, designJson } = data;
    return prisma.emailTemplate.create({
      data: {
        siteId,
        name,
        subject,
        htmlContent,
        designJson,
      }
    });
  },

  async updateTemplate(siteId, id, data) {
    const { name, subject, htmlContent, designJson } = data;
    // Verify ownership before updating
    const existing = await prisma.emailTemplate.findFirst({ where: { id, siteId } });
    if (!existing) throw new Error("Template not found");
    return prisma.emailTemplate.update({
      where: { id },
      data: { name, subject, htmlContent, designJson }
    });
  },

  async deleteTemplate(siteId, id) {
    // Verify ownership before deleting
    const existing = await prisma.emailTemplate.findFirst({ where: { id, siteId } });
    if (!existing) throw new Error("Template not found");
    return prisma.emailTemplate.delete({ where: { id } });
  },

  async getCampaigns(siteId) {
    return prisma.emailCampaign.findMany({
      where: { siteId },
      include: {
        list: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  },

  async createCampaign(siteId, data) {
    const { name, subject, body, listId, scheduledAt } = data;
    return prisma.emailCampaign.create({
      data: {
        siteId,
        name,
        subject,
        body,
        // Allow null listId for draft campaigns not yet assigned to a list
        listId: listId || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt ? "scheduled" : "draft",
      }
    });
  },

  async deleteCampaign(siteId, id) {
    return prisma.emailCampaign.delete({
      where: { id, siteId }
    });
  },

  async sendTestEmail(siteId, campaignId, targetEmail) {
    const campaign = await prisma.emailCampaign.findFirst({
      where: { id: campaignId, siteId }
    });
    if (!campaign) throw new Error("Campaign not found");

    const { transporter, fromEmail } = await emailService.getTransporterForSite(siteId);

    await transporter.sendMail({
      from: `"Global Backend" <${fromEmail}>`,
      to: targetEmail,
      subject: `[TEST] ${campaign.subject}`,
      html: campaign.body
    });

    return { success: true };
  },

  async executeCampaign(siteId, campaignId) {
    const campaign = await prisma.emailCampaign.findFirst({
      where: { id: campaignId, siteId },
      include: {
        list: {
          include: {
            subscribers: {
              include: {
                subscriber: true
              }
            }
          }
        }
      }
    });
    if (!campaign) throw new Error("Campaign not found");
    if (!campaign.list) throw new Error("Campaign list not selected or empty");

    const { transporter, fromEmail } = await emailService.getTransporterForSite(siteId);

    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: "sending" }
    });

    const members = campaign.list.subscribers;
    let sentCount = 0;
    let failedCount = 0;

    for (const member of members) {
      const sub = member.subscriber;
      if (sub.status !== "active") continue;

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
        sentCount++;
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
        failedCount++;
      }
    }

    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: failedCount > 0 && sentCount === 0 ? "failed" : "sent",
        sentAt: new Date()
      }
    });

    return { success: true, sentCount, failedCount };
  },

  async updateCampaign(siteId, id, data) {
    const existing = await prisma.emailCampaign.findFirst({ where: { id, siteId } });
    if (!existing) throw new Error("Campaign not found");

    const allowedFields = ["name", "subject", "body", "listId", "scheduledAt", "status"];
    const updateData = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        if (key === "scheduledAt") {
          updateData[key] = data[key] ? new Date(data[key]) : null;
        } else if (key === "listId") {
          updateData[key] = data[key] || null;
        } else {
          updateData[key] = data[key];
        }
      }
    }
    return prisma.emailCampaign.update({ where: { id }, data: updateData, include: { list: { select: { name: true } } } });
  },

  async getCampaignAnalytics(siteId, id) {
    const campaign = await prisma.emailCampaign.findFirst({
      where: { id, siteId },
      include: {
        list: { select: { name: true, _count: { select: { subscribers: true } } } },
        logs: {
          include: { subscriber: { select: { email: true, name: true } } },
          orderBy: { sentAt: "desc" },
          take: 50,
        },
      },
    });
    if (!campaign) throw new Error("Campaign not found");

    const logs = campaign.logs;
    const totalLogs = logs.length;
    const sent    = logs.filter(l => ["sent", "opened", "clicked"].includes(l.status)).length;
    const failed  = logs.filter(l => l.status === "failed").length;
    const opened  = logs.filter(l => l.openedAt  !== null).length;
    const clicked = logs.filter(l => l.clickedAt !== null).length;

    return {
      campaign,
      stats: {
        totalLogs,
        sent,
        failed,
        opened,
        clicked,
        deliveryRate: totalLogs > 0 ? Math.round((sent  / totalLogs) * 100) : 0,
        openRate:     sent    > 0 ? Math.round((opened  / sent)     * 100) : 0,
        clickRate:    sent    > 0 ? Math.round((clicked / sent)     * 100) : 0,
      },
      recentLogs: logs.slice(0, 20),
    };
  },

  async duplicateCampaign(siteId, id) {
    const existing = await prisma.emailCampaign.findFirst({ where: { id, siteId } });
    if (!existing) throw new Error("Campaign not found");
    return prisma.emailCampaign.create({
      data: {
        siteId,
        name:    `Copy of ${existing.name}`,
        subject: existing.subject,
        body:    existing.body,
        listId:  existing.listId,
        status:  "draft",
      },
      include: { list: { select: { name: true } } },
    });
  },
};
