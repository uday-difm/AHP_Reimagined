import CustomCursor from '@/components/CustomCursor';
import BackdropBlobs from '@/components/BackdropBlobs';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HomeQuizWidget from '@/components/HomeQuizWidget';
import ArticlesGrid from '@/components/ArticlesGrid';
import BlogCategorySlider from '@/components/BlogCategorySlider';
import CommunityEvents from '@/components/CommunityEvents';
import ServicesBanner from '@/components/ServicesBanner';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import HomepageAuthenticatedSections from '@/components/HomepageAuthenticatedSections';
import WellnessShowcase from '@/components/WellnessShowcase';
import prisma from '@/lib/prisma';

async function getWellnessBannerContent() {
  try {
    const siteId =
      process.env.NEXT_PUBLIC_SITE_ID || process.env.SITE_ID || 'infinium';
    const settings = await prisma.globalSettings.findUnique({
      where: { siteId },
      select: { websiteSettings: true },
    });
    const wellnessBanner = settings?.websiteSettings?.wellnessBanner ?? null;
    return wellnessBanner;
  } catch {
    return null;
  }
}

export async function generateMetadata() {
  const siteId = process.env.NEXT_PUBLIC_SITE_ID || process.env.SITE_ID || 'infinium';
  try {
    const page = await prisma.page.findFirst({
      where: { siteId, slug: '/', status: 'PUBLISHED', deletedAt: null },
      select: {
        seoTitle: true,
        seoDescription: true,
        canonicalUrl: true,
        ogImage: true,
      },
    });

    if (page) {
      return {
        ...(page.seoTitle && { title: page.seoTitle }),
        ...(page.seoDescription && { description: page.seoDescription }),
        ...(page.canonicalUrl && { alternates: { canonical: page.canonicalUrl } }),
        ...(page.ogImage && { openGraph: { images: [{ url: page.ogImage }] } }),
      };
    }
  } catch (err) {
    console.error('Error fetching homepage metadata:', err);
  }
  return {};
}

export default async function Home() {
  const wellnessBannerContent = await getWellnessBannerContent();
  
  const siteId = process.env.NEXT_PUBLIC_SITE_ID || process.env.SITE_ID || 'infinium';
  let jsonLd = null;
  try {
    const page = await prisma.page.findFirst({
      where: { siteId, slug: '/', status: 'PUBLISHED', deletedAt: null },
      select: { jsonLd: true },
    });
    if (page && page.jsonLd) {
      jsonLd = page.jsonLd;
    }
  } catch (err) {
    console.error('Error fetching homepage JSON-LD:', err);
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {/* Global Animation Utilities */}
      <CustomCursor />
      <ScrollReveal />
      <BackdropBlobs />

      {/* Persistent Navigation */}

      <Header />

      {/* Modular Page Sections */}

      <main className="w-full">
        <Hero />
        <ArticlesGrid />
        <BlogCategorySlider />
        <HomeQuizWidget />
        {/* Wellness Showcase — data driven from dashboard Settings → Homepage */}
        <WellnessShowcase content={wellnessBannerContent} />
        <HomepageAuthenticatedSections />
        <CommunityEvents />
        <ServicesBanner />
        <Newsletter />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
