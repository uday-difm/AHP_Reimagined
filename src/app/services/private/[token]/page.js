import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ServiceDetailView from "@/components/ServiceDetailView";
import DOMPurify from "isomorphic-dompurify";

export const dynamic = 'force-dynamic'; // Prevent static generation for private token links

export async function generateMetadata({ params }) {
  const { token } = await params;
  const service = await prisma.service.findFirst({
    where: { accessToken: token, status: "ACTIVE", visibility: "PRIVATE" },
    select: { title: true, description: true }
  });

  if (!service) {
    return { 
      title: "Private Service Not Found",
      robots: { index: false, follow: false }
    };
  }

  const cleanDescription = service.description ? DOMPurify.sanitize(service.description, { ALLOWED_TAGS: [] }).substring(0, 160) : "";

  return {
    title: `${service.title} | Private Service | A Health Place`,
    description: cleanDescription,
    robots: {
      index: false,
      follow: false,
    }
  };
}

export default async function PrivateServicePage({ params }) {
  const { token } = await params;

  const dbService = await prisma.service.findFirst({
    where: { 
      accessToken: token, 
      status: "ACTIVE",
      visibility: "PRIVATE",
    },
    include: {
      featuredImage: true,
    }
  });

  if (!dbService) {
    notFound();
  }

  // Parse faqs and includes
  let faqs = [];
  let includes = [];
  if (dbService.faqs) {
    try {
      const parsed = typeof dbService.faqs === "string" ? JSON.parse(dbService.faqs) : dbService.faqs;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        faqs = parsed.faqs || [];
        includes = parsed.includes || [];
      } else if (Array.isArray(parsed)) {
        faqs = parsed;
      }
    } catch (e) {
      console.error("Failed to parse service faqs:", e);
    }
  }

  const serviceData = {
    ...dbService,
    faqs,
    includes,
  };

  return <ServiceDetailView service={serviceData} />;
}
