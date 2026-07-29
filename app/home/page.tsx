// app/home/page.tsx
import Hero from "@/components/landing/Hero";
import WhyUs from "@/components/landing/WhyUs";
import CircuitsPreview from "@/components/landing/CircuitsPreview";
import Temoignages from "@/components/landing/Temoignages";
import FAQ from "@/components/landing/FAQ";
import CTABanner from "@/components/landing/CTABanner";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <CircuitsPreview />
        <WhyUs />
        <Temoignages />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
