import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Sparkles, ArrowRight, ShieldCheck, Star } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border/40">
      {/* Fond décoratif doux et minimaliste */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          
          {/* Badge d'introduction */}
          <Badge
            variant="secondary"
            className="px-4 py-1.5 text-xs font-semibold tracking-wide uppercase rounded-full border border-primary/20 bg-background shadow-xs text-foreground flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            Créateur de voyages sur mesure à Madagascar
          </Badge>

          {/* Titre Principal */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Concevez l'aventure <br className="hidden sm:inline" />
            <span className="text-primary font-serif italic font-normal">qui vous ressemble</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl font-normal leading-relaxed">
            De la mythique Allée des Baobabs aux Tsingy de Bemaraha, co-créez votre itinéraire idéal avec nos conseillers spécialistes locaux.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full sm:w-auto">
            <Link
              href="/devis/nouveau"
              className={buttonVariants({ variant: "default", size: "lg" }) + " w-full sm:w-auto px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"}
            >
              Demander un devis sur mesure
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/circuits"
              className={buttonVariants({ variant: "outline", size: "lg" }) + " w-full sm:w-auto px-8 py-6 text-base font-semibold"}
            >
              Découvrir nos itinéraires
            </Link>
          </div>

          {/* Statistiques / Preuves sociales */}
          <div className="grid grid-cols-3 gap-6 sm:gap-12 pt-10 border-t border-border/50 w-full max-w-xl text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" />
                <span className="font-bold text-lg text-foreground">4.9 / 5</span>
              </div>
              <p className="text-xs text-muted-foreground">Satisfactions voyageurs</p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-lg text-foreground">100%</span>
              <p className="text-xs text-muted-foreground">Itinéraires personnalisés</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-primary">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-bold text-lg text-foreground">Local</span>
              </div>
              <p className="text-xs text-muted-foreground">Expertise & assistance 24/7</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
