import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ServiceDetailView from "@/components/ServiceDetailView";
import DOMPurify from "isomorphic-dompurify";

export const revalidate = 60; // ISR: revalidate at most every 60 seconds

export async function generateStaticParams() {
  const services = await prisma.service.findMany({
    where: { 
      status: "ACTIVE", 
      visibility: "PUBLIC",
      slug: { not: null }
    },
    select: { slug: true },
  });

  return services.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = await prisma.service.findFirst({
    where: { slug, status: "ACTIVE", visibility: "PUBLIC" },
    select: { title: true, description: true, featuredImage: { select: { secureUrl: true, url: true } } }
  });

  if (!service) {
    return { title: "Service Not Found" };
  }

  const cleanDescription = service.description ? DOMPurify.sanitize(service.description, { ALLOWED_TAGS: [] }).substring(0, 160) : "";

  return {
    title: `${service.title} | A Health Place`,
    description: cleanDescription,
    openGraph: {
      title: `${service.title} | A Health Place`,
      description: cleanDescription,
      images: service.featuredImage?.secureUrl || service.featuredImage?.url ? [service.featuredImage.secureUrl || service.featuredImage.url] : [],
    },
  };
}

export default async function PublicServicePage({ params }) {
  const { slug } = await params;

  const dbService = await prisma.service.findFirst({
    where: { 
      slug, 
      status: "ACTIVE",
      visibility: "PUBLIC",
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
