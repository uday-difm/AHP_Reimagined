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

export default async function Home() {
  const wellnessBannerContent = await getWellnessBannerContent();

  return (
    <>
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
