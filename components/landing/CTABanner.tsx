import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Plane } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left - Image */}
            <div className="relative h-64 lg:h-auto min-h-[320px] overflow-hidden">
              <Image
                src="/cta-landscape.png"
                alt="Paysage paradisiaque de Madagascar"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/80 lg:to-card/60 hidden lg:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent lg:hidden" />
            </div>

            {/* Right - Content */}
            <div className="relative p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6">
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-0" />

              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                  <Plane className="w-3.5 h-3.5" />
                  Partez à l'aventure
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                  Ouvrez la Porte de
                  <br />
                  <span className="text-primary">Votre Prochain Voyage</span>
                </h2>

                <p className="text-muted-foreground text-sm sm:text-base max-w-md leading-relaxed">
                  Que vous cherchiez l'aventure, la détente ou la découverte
                  culturelle, notre équipe crée un itinéraire qui vous
                  ressemble. Commencez votre voyage dès maintenant.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/devis/nouveau"
                    className={
                      buttonVariants({ variant: "default", size: "lg" }) +
                      " px-8 font-semibold shadow-lg hover:shadow-xl transition-all"
                    }
                  >
                    Créer Mon Voyage
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                  <Link
                    href="/contact"
                    className={
                      buttonVariants({ variant: "outline", size: "lg" }) +
                      " px-8 font-semibold"
                    }
                  >
                    Nous Contacter
                  </Link>
                </div>

                {/* Mini-stats */}
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex -space-x-2">
                    {["RA", "SM", "JW", "OC"].map((initials, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-card bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold"
                      >
                        {initials}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">+2800</span>{" "}
                    voyageurs satisfaits
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
