import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Clock,
  Users,
  CheckCircle2,
  Route,
} from "lucide-react";
import { SearchBar } from "@/components/search";
export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/40">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 -z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/8 blur-[150px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-secondary/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 md:pt-16 md:pb-10">
        {/* Main Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-primary">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Trouvez votre voyage idéal
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
                Là Où Les Rêves <br className="hidden sm:inline" />
                Deviennent Des{" "}
                <span className="text-primary font-serif italic font-normal relative">
                  Destinations
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-primary/30"
                    viewBox="0 0 200 12"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 8C20 3 60 1 100 5C140 9 180 4 198 2"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
            </div>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Découvrez des circuits d&apos;exception à Madagascar. Parcourez
              des paysages époustouflants et vivez votre prochaine grande
              aventure avec nos conseillers spécialistes locaux.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Button
                size="lg"
                className="group px-8 py-6 text-base font-semibold rounded-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                nativeButton={false}
                render={<Link href="/devis/nouveau" />}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Créer mon voyage sur mesure
                <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-base font-semibold rounded-full border-2 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                nativeButton={false}
                render={<Link href="/circuits" />}
              >
                Explorer les circuits
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Circuits Vérifiés
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                Approuvé par +500 Voyageurs
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Meilleur Prix Garanti
              </span>
            </div>
          </div>

          {/* Right Column - Hero Image + Floating Card */}
          <div className="relative order-1 lg:order-2">
            <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[3/2] lg:aspect-[3/2]" style={{ position: 'relative' }}>
              <Image
                src="/hero-baobabs.png"
                alt="Allée des Baobabs au coucher du soleil à Madagascar"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 50vw, 50vw"
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            {/* Floating Card (Featured Circuit) */}
            <div className="absolute -bottom-6 -left-4 sm:left-4 lg:-left-8 max-w-[260px] bg-card rounded-xl shadow-lg p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-muted">
                  <Image
                    src="/hero-baobabs.png"
                    alt="Circuit Baobabs"
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-foreground truncate">
                    Allée des Baobabs
                  </h3>
                  <p className="text-lg font-bold text-primary leading-tight">
                    890 000 MGA
                    <span className="text-[10px] font-normal text-muted-foreground ml-1">
                      /personne
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 8 jours
                </span>
                <span className="flex items-center gap-1">
                  <Route className="w-3 h-3" /> 5 étapes
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> 4.9
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modular SearchBar */}
        <div className="mt-14 relative z-10">
          <SearchBar variant="hero" />
        </div>
      </div>
    </section>
  );
}
