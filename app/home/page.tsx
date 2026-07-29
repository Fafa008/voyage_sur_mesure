// app/home/page.tsx
import { Suspense } from "react";
import Hero from "@/components/landing/Hero";
import WhyUs from "@/components/landing/WhyUs";
import CircuitsPreview from "@/components/landing/CircuitsPreview";
import Temoignages from "@/components/landing/Temoignages";
import FAQ from "@/components/landing/FAQ";
import CTABanner from "@/components/landing/CTABanner";
import Footer from "@/components/landing/Footer";

/**
 * Skeleton affiché pendant le chargement de CircuitsPreview (streaming RSC).
 * Évite le blocage de toute la page si la requête Prisma est lente.
 */
function CircuitsSkeleton() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background border-b border-border/40">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header skeleton */}
        <div className="space-y-3">
          <div className="h-3 w-28 bg-muted rounded animate-pulse" />
          <div className="h-8 w-72 bg-muted rounded animate-pulse" />
          <div className="h-4 w-96 bg-muted rounded animate-pulse" />
        </div>
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/60 bg-card overflow-hidden animate-pulse"
            >
              <div className="h-52 bg-muted" />
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-muted rounded" />
                  <div className="h-4 w-8 bg-muted rounded" />
                </div>
                <div className="h-5 w-3/4 bg-muted rounded" />
                <div className="h-6 w-1/2 bg-muted rounded" />
                <div className="h-px w-full bg-border/40" />
                <div className="flex gap-3">
                  <div className="h-3 w-12 bg-muted rounded" />
                  <div className="h-3 w-12 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        {/*
          Suspense permet le streaming RSC :
          - Hero s'affiche immédiatement
          - CircuitsPreview (async, requête DB) streame dès qu'elle est prête
          - L'utilisateur ne voit pas une page blanche pendant le fetch
        */}
        <Suspense fallback={<CircuitsSkeleton />}>
          <CircuitsPreview />
        </Suspense>
        <WhyUs />
        <Temoignages />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
