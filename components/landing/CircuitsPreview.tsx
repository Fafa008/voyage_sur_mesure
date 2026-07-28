import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Clock, MapPin, Sparkles } from "lucide-react";

export default async function CircuitsPreview() {
  const circuits = await prisma.circuit.findMany({
    take: 3,
    include: {
      region: true,
      theme: true,
      images: { take: 1 },
    },
    orderBy: { id: "asc" },
  });

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background border-b border-border/40">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-primary">
              Inspiration de voyage
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Itinéraires à la une
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
              Des exemples d'itinéraires entièrement personnalisables selon vos préférences et la durée de votre séjour.
            </p>
          </div>

          <Link
            href="/circuits"
            className={buttonVariants({ variant: "outline", size: "sm" }) + " shrink-0 self-start sm:self-auto"}
          >
            Voir tous les circuits
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        {/* Grille de circuits */}
        {circuits.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">Aucun circuit n'est affiché pour le moment.</p>
              <Link href="/devis/nouveau" className={buttonVariants({ variant: "default", size: "sm" })}>
                Créer mon devis sur mesure
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {circuits.map((circuit) => (
              <Card
                key={circuit.id}
                className="group overflow-hidden border border-border/60 bg-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image avec Overlay & Badge */}
                  <div className="relative h-56 w-full overflow-hidden bg-muted">
                    {circuit.images[0] ? (
                      <img
                        src={circuit.images[0].url}
                        alt={circuit.titre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        Image à venir
                      </div>
                    )}
                    {circuit.region && (
                      <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white border-0 text-xs px-2.5 py-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {circuit.region.nom}
                      </Badge>
                    )}
                  </div>

                  {/* Contenu */}
                  <CardHeader className="space-y-2 p-6 pb-2">
                    <div className="flex items-center justify-between gap-2">
                      {circuit.theme ? (
                        <Badge variant="outline" className="text-[11px] font-medium">
                          {circuit.theme.nom}
                        </Badge>
                      ) : <div />}
                      {circuit.dureeJours && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {circuit.dureeJours} jours
                        </span>
                      )}
                    </div>

                    <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {circuit.titre}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6 pt-2">
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {circuit.description || "Un itinéraire exceptionnel à travers les plus beaux paysages."}
                    </p>
                  </CardContent>
                </div>

                {/* Footer de carte */}
                <div className="p-6 pt-0 border-t border-border/40 mt-4 flex items-center justify-between pt-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
                      À partir de
                    </span>
                    <span className="text-lg font-extrabold text-foreground">
                      {circuit.prixEstime ? `${circuit.prixEstime.toString()} €` : "Sur devis"}
                    </span>
                  </div>

                  <Link
                    href={`/circuits/${circuit.slug}`}
                    className={buttonVariants({ variant: "ghost", size: "sm" }) + " group-hover:translate-x-1 transition-transform"}
                  >
                    Découvrir →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
