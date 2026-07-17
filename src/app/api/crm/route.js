import { NextResponse } from "next/server";
import { checkSitePermission } from "@/lib/apiAuth";
import prisma from "@/lib/prisma";
import { handleApiError, apiSuccess } from "@/core/errors";

export async function GET(req) {
  const auth = await checkSitePermission(req, "EDITOR");
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const siteId = auth.siteId;
    const { searchParams } = new URL(req.url);
    const range = parseInt(searchParams.get("range") || "30", 10) || 30;
    const dateLimit = new Date(Date.now() - range * 24 * 60 * 60 * 1000);

    const [
      crmSubscribers,
      totalLists,
      totalCampaigns,
      totalPushes,
      crmLeads,
      totalPageViews,
      recentSubscribers,
      recentCampaigns,
    ] = await Promise.all([
      prisma.subscriber.count({ where: { siteId } }),
      prisma.subscriberList.count({ where: { siteId } }),
      prisma.emailCampaign.count({ where: { siteId } }),
      prisma.pushNotification.count({ where: { siteId } }),
      prisma.lead.count({ where: { siteId, createdAt: { gte: dateLimit } } }),
      prisma.visitorLog.count({ where: { siteId, createdAt: { gte: dateLimit } } }),
      prisma.subscriber.findMany({
        where: { siteId },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.emailCampaign.findMany({
        where: { siteId },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const [rawTrends, emailCampaigns, services, leads, wonLeadsCount] = await Promise.all([
      prisma.$queryRaw`
        SELECT DATE(createdAt) as day,
               COUNT(*) as pageViews,
               COUNT(DISTINCT visitorId) as uniqueVisitors
        FROM VisitorLog
        WHERE siteId = ${siteId} AND createdAt >= ${dateLimit}
        GROUP BY DATE(createdAt)
        ORDER BY day ASC
      `,
      prisma.emailCampaign.findMany({
        where: { siteId, createdAt: { gte: dateLimit } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.service.findMany({
        where: { siteId, deletedAt: null },
        select: { title: true, price: true },
      }),
      prisma.lead.findMany({
        where: { siteId, createdAt: { gte: dateLimit } },
        select: { status: true, serviceInterest: true },
      }),
      prisma.lead.count({
        where: {
          siteId,
          createdAt: { gte: dateLimit },
          status: { in: ["won", "converted", "approved"] },
        },
      }),
    ]);

    const trafficTrendsMap = {};
    for (const row of rawTrends) {
      if (!row.day) continue;
      const dayStr = new Date(row.day).toISOString().split("T")[0];
      trafficTrendsMap[dayStr] = {
        pageViews: Number(row.pageViews),
        uniqueVisitors: Number(row.uniqueVisitors),
      };
    }

    const trendsList = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayStr = d.toISOString().split("T")[0];
      trendsList.push({
        date: dayStr,
        pageViews: trafficTrendsMap[dayStr]?.pageViews ?? 0,
        uniqueVisitors: trafficTrendsMap[dayStr]?.uniqueVisitors ?? 0,
      });
    }

    const campaignsPerf = await Promise.all(
      emailCampaigns.map(async (c) => {
        const [totalSent, totalOpened, totalClicked] = await Promise.all([
          prisma.campaignLog.count({ where: { campaignId: c.id, status: "sent" } }),
          prisma.campaignLog.count({ where: { campaignId: c.id, status: "opened" } }),
          prisma.campaignLog.count({ where: { campaignId: c.id, status: "clicked" } }),
        ]);
        return {
          id: c.id,
          name: c.name,
          subject: c.subject,
          status: c.status,
          sentCount: totalSent,
          openRate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
          clickRate: totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0,
        };
      })
    );

    const priceMap = {};
    services.forEach((s) => {
      const priceNum = parseFloat(String(s.price || "").replace(/[^0-9.]/g, ""));
      priceMap[s.title.toLowerCase()] = isNaN(priceNum) ? 500 : priceNum;
    });

    let totalPipelineValue = 0;
    leads.forEach((l) => {
      if (l.serviceInterest && ["won", "converted", "approved"].includes(l.status)) {
        const interest = l.serviceInterest.toLowerCase();
        const extractedMatch = interest.match(/\$(\d+)/);
        if (extractedMatch) {
          totalPipelineValue += parseFloat(extractedMatch[1]);
        } else {
          let matchedPrice = null;
          for (const [title, price] of Object.entries(priceMap)) {
            if (interest.includes(title) || title.includes(interest)) {
              matchedPrice = price;
              break;
            }
          }
          totalPipelineValue += matchedPrice !== null ? matchedPrice : 500;
        }
      }
    });

    const statsPayload = {
      crmSubscribers,
      totalLists,
      totalCampaigns,
      totalPushes,
      crmLeads,
      totalPageViews,
      totalPipelineValue,
      conversionRate: leads.length > 0 ? Math.round((wonLeadsCount / leads.length) * 100) : 0,
    };

    return NextResponse.json(
      apiSuccess({
        stats: statsPayload,
        trends: trendsList,
        campaignsPerf,
        recentSubscribers,
        recentCampaigns,
      })
    );
  } catch (err) {
    return handleApiError(err);
  }
}
