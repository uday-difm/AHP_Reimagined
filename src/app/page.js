import CustomCursor from '@/components/CustomCursor';
import BackdropBlobs from '@/components/BackdropBlobs';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import ArticlesGrid from '@/components/ArticlesGrid';
import TimelineMarquee from '@/components/TimelineMarquee';
import CommunityEvents from '@/components/CommunityEvents';
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
        <Hero />
        <AdSlot zone="homepage-hero-bottom" />
        <ArticlesGrid />
        <AdSlot zone="homepage-articles-bottom" />
        <TimelineMarquee />
        <About />
        <AdSlot zone="homepage-about-bottom" />
        <CommunityEvents />
        <AdSlot zone="homepage-events-bottom" />
        <Newsletter />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}

