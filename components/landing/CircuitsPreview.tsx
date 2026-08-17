import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { FavoriteButton } from "@/components/favori/FavoriteButton";
import { getUserFavoriteCircuitIds } from "@/lib/favoris-utils";
import { ArrowRight, Clock, MapPin, Star, Route } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export default async function CircuitsPreview() {
  const session = await auth.api.getSession({ headers: await headers() });
  const favoriteIds = await getUserFavoriteCircuitIds(session?.user.id);

  const circuits = await prisma.circuit.findMany({
    take: 4,
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-primary">
              Inspiration de voyage
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Circuits Choisis Juste Pour Vous
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
              Des itinéraires d&apos;exception entièrement personnalisables
              selon vos préférences et la durée de votre séjour.
            </p>
          </div>

          <Link
            href="/circuits"
            className={
              buttonVariants({ variant: "default", size: "sm" }) +
              " shrink-0 self-start sm:self-auto shadow-md"
            }
          >
            Voir Tous les Circuits
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        {/* Circuits Grid */}
        {circuits.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                Aucun circuit n'est affiché pour le moment.
              </p>
              <Link
                href="/devis/nouveau"
                className={buttonVariants({ variant: "default", size: "sm" })}
              >
                Créer mon devis sur mesure
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {circuits.map((circuit, index) => (
              <div key={circuit.id} className="group relative">
                <Link href={`/circuits/${circuit.slug}`}>
                  <Card className="overflow-hidden bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-52 w-full overflow-hidden bg-muted">
                      {circuit.images[0] ? (
                        <Image
                          src={circuit.images[0].url}
                          alt={circuit.titre}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          priority={index === 0}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                          Image à venir
                        </div>
                      )}

                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                      {/* Featured badge */}
                      {index === 0 && (
                        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-0 text-[10px] px-2.5 py-1 shadow-md">
                          À la une
                        </Badge>
                      )}

                      {/* Region badge */}
                      {circuit.region && (
                        <Badge className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md text-white border-0 text-[10px] px-2 py-0.5">
                          <MapPin className="w-3 h-3 mr-1" />
                          {circuit.region.nom}
                        </Badge>
                      )}

                      {/* Heart icon */}
                      <div className="absolute top-3 right-3 z-10">
                        <FavoriteButton
                          circuitId={circuit.id}
                          initialIsFavori={favoriteIds.has(circuit.id)}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <CardHeader className="p-4 pb-2 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        {circuit.theme ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-medium"
                          >
                            {circuit.theme.nom}
                          </Badge>
                        ) : (
                          <div />
                        )}
                        <div className="flex items-center gap-0.5 text-amber-500">
                          <Star className="w-3 h-3 fill-amber-500" />
                          <span className="text-[11px] font-semibold text-foreground">
                            4.9
                          </span>
                        </div>
                      </div>

                      <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {circuit.titre}
                      </CardTitle>

                      <p className="text-lg font-bold text-foreground mt-1">
                        {circuit.prixEstime
                          ? formatCurrency(circuit.prixEstime)
                          : "Sur devis"}
                        <span className="text-[11px] font-normal text-muted-foreground ml-1">
                          /personne
                        </span>
                      </p>
                    </CardHeader>

                    {/* Footer */}
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center gap-3 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
                        {circuit.dureeJours && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {circuit.dureeJours}j
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Route className="w-3 h-3" /> Étapes
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Madagascar
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
