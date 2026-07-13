import { redirect } from "next/navigation";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { requireAuth } from "@/lib/requireAuth";
import { getSiteForUser } from "@/lib/getSiteForUser";

export const dynamic = "force-dynamic";

export default async function Layout({ children }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  if (pathname.includes("/dashboard/login")) {
    return (
      <DashboardLayout siteId={null} sites={[]}>
        {children}
      </DashboardLayout>
    );
  }

  const user = await requireAuth();

  if (!user) {
    redirect("/dashboard/login");
  }

  const siteId = process.env.NEXT_PUBLIC_SITE_ID || process.env.SITE_ID || "infinium";
  const connectedSiteId = siteId;
  let sites = [];
  const connectedSite = await prisma.site.findUnique({
    where: { id: connectedSiteId, deletedAt: null },
    select: { id: true, name: true }
  });
  if (connectedSite) {
    sites = [connectedSite];
  }

  return (
    <DashboardLayout siteId={siteId} sites={sites}>
      {children}
    </DashboardLayout>
  );
}

