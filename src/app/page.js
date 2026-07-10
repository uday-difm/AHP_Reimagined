import CustomCursor from '@/components/CustomCursor';
import BackdropBlobs from '@/components/BackdropBlobs';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import WellnessShowcase from '@/components/WellnessShowcase';
import ArticlesGrid from '@/components/ArticlesGrid';
import BlogCategorySlider from '@/components/BlogCategorySlider';
import CommunityEvents from '@/components/CommunityEvents';
import ServicesBanner from '@/components/ServicesBanner';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import AdSlot from '@/components/AdSlot';

export default function Home() {
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
        <Marquee />
        <Hero />
        <AdSlot zone="homepage-hero-bottom" />
        <ArticlesGrid />
        <AdSlot zone="homepage-articles-bottom" />
        <BlogCategorySlider />
        <WellnessShowcase />
        <AdSlot zone="homepage-about-bottom" />
        <CommunityEvents />
        <AdSlot zone="homepage-events-bottom" />
        <ServicesBanner />
        <Newsletter />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}

