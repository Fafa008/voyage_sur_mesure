import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
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
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-foreground leading-[1.1]">
                Là Où Les Rêves{" "}
                <br className="hidden sm:inline" />
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
              Découvrez des circuits d'exception à Madagascar.
              Parcourez des paysages époustouflants et vivez votre prochaine
              grande aventure avec nos conseillers spécialistes locaux.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Link
                href="/devis/nouveau"
                className={
                  buttonVariants({ variant: "default", size: "lg" }) +
                  " px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                }
              >
                Demander un devis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href="/circuits"
                className={
                  buttonVariants({ variant: "outline", size: "lg" }) +
                  " px-8 py-6 text-base font-semibold"
                }
              >
                Voir les circuits
              </Link>
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
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-[3/4]">
              <Image
                src="/hero-baobabs.png"
                alt="Allée des Baobabs au coucher du soleil à Madagascar"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            {/* Floating Card (Featured Circuit) */}
            <div className="absolute -bottom-6 -left-4 sm:left-4 lg:-left-8 max-w-[260px] bg-card border border-border/60 rounded-xl shadow-xl p-4 backdrop-blur-sm">
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
                  <p className="text-lg font-extrabold text-primary leading-tight">
                    890€
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
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />{" "}
                  4.9
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
