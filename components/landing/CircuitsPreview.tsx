// CircuitsPreview – version alignée sur le design de CircuitsPage
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { FavoriteButton } from "@/components/favori/FavoriteButton";
import { getUserFavoriteCircuitIds } from "@/lib/favoris-utils";
import { PriceDisplay } from "@/components/currency/PriceDisplay";
import { ArrowRight, Clock3, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function CircuitsPreview() {
  const session = await auth.api.getSession({ headers: await headers() });
  const favoriteIds = await getUserFavoriteCircuitIds(session?.user.id);

  const circuits = await prisma.circuit.findMany({
    where: { deletedAt: null },
    take: 4,
    select: {
      id: true,
      titre: true,
      slug: true,
      description: true,
      dureeJours: true,
      prixEstime: true,
      theme: { select: { id: true, nom: true } },
      region: { select: { id: true, nom: true } },
      images: {
        select: { id: true, url: true },
        take: 1,
        orderBy: { ordre: "asc" },
      },
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
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "shrink-0 self-start sm:self-auto shadow-md",
            )}
          >
            Voir Tous les Circuits
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        {/* Grille de cartes */}
        {circuits.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                Aucun circuit n&apos;est affiché pour le moment.
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
              <Card
                key={circuit.id}
                className={`
                  group
                  flex
                  h-full
                  flex-col
                  overflow-hidden
                  rounded-[22px]
                  border-border/60
                  bg-card
                  p-0

                  shadow-[0_8px_30px_rgba(0,0,0,0.06)]

                  transition-all
                  duration-300

                  hover:border-border
                  hover:shadow-[0_18px_45px_rgba(0,0,0,0.10)]
                  hover:-translate-y-0.5

                  dark:shadow-[0_8px_30px_rgba(0,0,0,0.20)]
                  dark:hover:shadow-[0_18px_45px_rgba(0,0,0,0.30)]
                `}
              >
                {/* Bloc image */}
                <div className="relative p-2.5 pb-0">
                  <div className="relative h-[230px] overflow-hidden rounded-[16px] bg-muted">
                    {circuit.images[0] ? (
                      <Image
                        src={circuit.images[0].url}
                        alt={circuit.titre}
                        fill
                        priority={index === 0}
                        className="
                          object-cover
                          transition-transform
                          duration-500
                          group-hover:scale-[1.04]
                        "
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                        Pas d&apos;image
                      </div>
                    )}

                    {/* Dégradé léger en bas */}
                    <div
                      className="
                        pointer-events-none
                        absolute
                        inset-x-0
                        bottom-0
                        h-24
                        bg-gradient-to-t
                        from-black/30
                        to-transparent
                      "
                    />

                    {/* Badge région (en haut à gauche) */}
                    {circuit.region && (
                      <div
                        className="
                          absolute
                          left-3.5
                          top-3.5
                          flex
                          items-center
                          gap-1.5
                          rounded-lg
                          border
                          border-white/20
                          bg-black/60
                          px-2.5
                          py-1.5
                          text-xs
                          font-medium
                          text-white
                          shadow-sm
                          backdrop-blur-md
                        "
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        {circuit.region.nom}
                      </div>
                    )}

                    {/* Bouton favori (en haut à droite) */}
                    <div className="absolute right-3.5 top-3.5">
                      <div
                        className="
                          rounded-full
                          border
                          border-white/30
                          bg-black/40
                          p-1
                          shadow-sm
                          backdrop-blur-md
                        "
                      >
                        <FavoriteButton
                          circuitId={circuit.id}
                          initialIsFavori={favoriteIds.has(circuit.id)}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Durée (en bas à gauche) */}
                    {circuit.dureeJours && (
                      <div
                        className="
                          absolute
                          bottom-3.5
                          left-3.5
                          flex
                          items-center
                          gap-1.5
                          rounded-full
                          bg-black/50
                          px-3
                          py-1.5
                          text-xs
                          font-medium
                          text-white
                          backdrop-blur-md
                        "
                      >
                        <Clock3 className="h-3.5 w-3.5" />
                        {circuit.dureeJours} jour
                        {circuit.dureeJours > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contenu de la carte */}
                <CardContent className="flex flex-1 flex-col px-4 pb-4 pt-4">
                  {/* Titre + prix */}
                  <div className="flex items-start justify-between gap-4">
                    <h3
                      className="
                        min-w-0
                        flex-1
                        text-xl
                        font-semibold
                        leading-tight
                        tracking-tight
                        text-foreground
                      "
                    >
                      {circuit.titre}
                    </h3>

                    <div className="shrink-0 text-right">
                      <PriceDisplay
                        amount={circuit.prixEstime?.toString()}
                        fallback="Sur devis"
                        label="À partir de"
                        size="md"
                      />
                    </div>
                  </div>

                  {/* Thème */}
                  {circuit.theme && (
                    <div className="mt-2">
                      <span
                        className="
                          inline-flex
                          items-center
                          rounded-full
                          bg-primary/10
                          px-2.5
                          py-1
                          text-xs
                          font-medium
                          text-primary
                          hover:bg-primary/15
                          transition-colors
                          duration-200
                        "
                      >
                        {circuit.theme.nom}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  <p
                    className="
                      mt-3
                      min-h-[60px]
                      line-clamp-3
                      text-sm
                      leading-5
                      text-muted-foreground
                    "
                  >
                    {circuit.description || "Aucune description fournie."}
                  </p>

                  {/* Bouton Voir le circuit */}
                  <Link
                    href={`/circuits/${circuit.slug}`}
                    className="
                      mt-auto
                      flex
                      h-11
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-full

                      bg-primary
                      text-primary-foreground

                      text-sm
                      font-semibold

                      shadow-sm

                      transition-all
                      duration-200

                      hover:bg-primary/90
                      hover:shadow-md
                      hover:-translate-y-0.5

                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-primary
                      focus-visible:ring-offset-2

                      dark:focus-visible:ring-offset-background
                    "
                  >
                    Voir le circuit
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
