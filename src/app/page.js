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

export default async function Home() {

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

