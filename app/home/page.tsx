// app/home/page.tsx
import Hero from "@/components/landing/Hero";
import WhyUs from "@/components/landing/WhyUs";
import CircuitsPreview from "@/components/landing/CircuitsPreview";
import Temoignages from "@/components/landing/Temoignages";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <WhyUs />
        <CircuitsPreview />
        <Temoignages />
      </main>
      <Footer />
    </>
  );
}
