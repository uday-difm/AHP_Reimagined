import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { getSiteForUser } from "@/lib/getSiteForUser";
import CrmDashboardClient from "./CrmDashboardClient";

export default async function CrmDashboardPage() {
  const user = await requireAuth();
  const site = await getSiteForUser(user);

  if (!site) {
    return (
      <div className="p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Marketing CRM</h1>
        <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-250 rounded-xl text-sm max-w-md mx-auto">
          No active site configuration found. Please configure a site in the database first.
        </div>
      </div>
    );
  }

  // Pre-load default range = 30 days
  const range = 30;
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
    // 1. Total active subscribers
    prisma.subscriber.count({ where: { siteId: site.id } }),
    // 2. Total lists
    prisma.subscriberList.count({ where: { siteId: site.id } }),
    // 3. Total campaigns
    prisma.emailCampaign.count({ where: { siteId: site.id } }),
    // 4. Total push alerts
    prisma.pushNotification.count({ where: { siteId: site.id } }),
    // 5. Total leads in range
    prisma.lead.count({ where: { siteId: site.id, createdAt: { gte: dateLimit } } }),
    // 6. Total pageviews in range
    prisma.visitorLog.count({ where: { siteId: site.id, createdAt: { gte: dateLimit } } }),
    // 7. Recent 5 subscribers
    prisma.subscriber.findMany({
      where: { siteId: site.id },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    // 8. Recent 5 campaigns
    prisma.emailCampaign.findMany({
      where: { siteId: site.id },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Run traffic trends, campaign list, services, and leads all in parallel
  const [rawTrends, emailCampaigns, services, leads, wonLeadsCount] = await Promise.all([
    // (a) Traffic trends: grouped by day in MySQL — no raw log rows pulled to Node
    prisma.$queryRaw`
      SELECT DATE(createdAt) as day,
             COUNT(*) as pageViews,
             COUNT(DISTINCT visitorId) as uniqueVisitors
      FROM VisitorLog
      WHERE siteId = ${site.id} AND createdAt >= ${dateLimit}
      GROUP BY DATE(createdAt)
      ORDER BY day ASC
    `,
    // (b) Campaign list without logs — counts fetched per campaign below
    prisma.emailCampaign.findMany({
      where: { siteId: site.id, createdAt: { gte: dateLimit } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Services for pipeline priceMap
    prisma.service.findMany({
      where: { siteId: site.id, deletedAt: null },
      select: { title: true, price: true },
    }),
    // All leads in range for pipeline value (need serviceInterest per lead)
    prisma.lead.findMany({
      where: { siteId: site.id, createdAt: { gte: dateLimit } },
      select: { status: true, serviceInterest: true },
    }),
    // (c) Won leads count directly from DB instead of a JS loop
    prisma.lead.count({
      where: {
        siteId: site.id,
        createdAt: { gte: dateLimit },
        status: { in: ["won", "converted", "approved"] },
      },
    }),
  ]);

  // Build trendsList — fill in zero-value days for the full range so chart has no gaps
  const trafficTrendsMap = {};
  for (const row of rawTrends) {
    // MySQL DATE() returns a Date object via $queryRaw — convert to ISO date string
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

  // (b) Campaign performance — count log statuses per campaign with parallel counts
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

  // (c) Pipeline value — still needs per-lead serviceInterest for the price map
  const priceMap = {};
  services.forEach((s) => {
    const priceNum = parseFloat(String(s.price || "").replace(/[^0-9.]/g, ""));
    priceMap[s.title.toLowerCase()] = isNaN(priceNum) ? 500 : priceNum;
  });

  let totalPipelineValue = 0;
  leads.forEach((l) => {
    const interest = l.serviceInterest ? l.serviceInterest.toLowerCase() : "";
    totalPipelineValue += priceMap[interest] || 500;
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

  return (
    <CrmDashboardClient
      siteId={site.id}
      siteName={site.name}
      initialStats={statsPayload}
      initialTrends={trendsList}
      initialCampaignPerformance={campaignsPerf}
      recentSubscribers={JSON.parse(JSON.stringify(recentSubscribers))}
      recentCampaigns={JSON.parse(JSON.stringify(recentCampaigns))}
    />
  );
}
