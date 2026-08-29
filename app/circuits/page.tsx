import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { FavoriteButton } from "@/components/favori/FavoriteButton";

import { getUserFavoriteCircuitIds } from "@/lib/favoris-utils";
import { PriceDisplay } from "@/components/currency/PriceDisplay";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
} from "lucide-react";

import { cn } from "@/lib/utils";

// Revalidation ISR : la page est re-générée en arrière-plan toutes les heures
export const revalidate = 3600;

const CIRCUITS_PER_PAGE = 12;

interface CircuitsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function CircuitsPage({
  searchParams,
}: CircuitsPageProps) {
  const { page } = await searchParams;

  const currentPage = Math.max(1, parseInt(page ?? "1", 10));
  const skip = (currentPage - 1) * CIRCUITS_PER_PAGE;

  // Toutes les requêtes indépendantes en parallèle
  const [circuits, total, session] = await Promise.all([
    prisma.circuit.findMany({
      where: { deletedAt: null },
      take: CIRCUITS_PER_PAGE,
      skip,

      select: {
        id: true,
        titre: true,
        slug: true,
        description: true,
        dureeJours: true,
        prixEstime: true,

        theme: {
          select: {
            id: true,
            nom: true,
          },
        },

        region: {
          select: {
            id: true,
            nom: true,
          },
        },

        images: {
          select: {
            id: true,
            url: true,
          },
          take: 1,
          orderBy: {
            ordre: "asc",
          },
        },
      },

      orderBy: {
        titre: "asc",
      },
    }),

    prisma.circuit.count({ where: { deletedAt: null } }),

    auth.api.getSession({
      headers: await headers(),
    }),
  ]);

  const totalPages = Math.ceil(total / CIRCUITS_PER_PAGE);

  const favoriteIds = await getUserFavoriteCircuitIds(session?.user.id);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* =====================================================
          HEADER
          ===================================================== */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Nos Circuits de Voyage
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Découvrez nos itinéraires phares et laissez-vous inspirer pour créer
          votre voyage sur-mesure.
        </p>

        {total > 0 && (
          <div className="mt-4 inline-flex rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            {total} circuit{total > 1 ? "s" : ""} disponible
            {total > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* =====================================================
          EMPTY STATE
          ===================================================== */}
      {circuits.length === 0 ? (
        <Card className="border-border bg-card py-12 text-center">
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Aucun circuit n&apos;est disponible pour le moment.
            </p>

            <Link
              href="/devis/nouveau"
              className={buttonVariants({
                variant: "default",
              })}
            >
              Demander un devis sur-mesure
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* =================================================
              CIRCUITS
              ================================================= */}
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {circuits.map((circuit) => (
              <Card
                key={circuit.id}
                className="
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

                  transition-shadow
                  duration-300

                  hover:border-border
                  hover:shadow-[0_18px_45px_rgba(0,0,0,0.10)]

                  dark:shadow-[0_8px_30px_rgba(0,0,0,0.20)]
                  dark:hover:shadow-[0_18px_45px_rgba(0,0,0,0.30)]
                "
              >
                {/* =================================================
                    IMAGE
                    ================================================= */}
                <div className="relative p-2.5 pb-0">
                  <div
                    className="
                      relative
                      h-[230px]
                      overflow-hidden
                      rounded-[16px]
                      bg-muted
                    "
                  >
                    {circuit.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={circuit.images[0].url}
                        alt={circuit.titre}
                        className="
                          h-full
                          w-full
                          object-cover
                          transition-transform
                          duration-500
                          group-hover:scale-[1.04]
                        "
                      />
                    ) : (
                      <div
                        className="
                          flex
                          h-full
                          w-full
                          items-center
                          justify-center
                          bg-muted
                          text-sm
                          text-muted-foreground
                        "
                      >
                        Pas d&apos;image
                      </div>
                    )}

                    {/* Dégradé léger */}
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

                    {/* =================================================
                        REGION
                        ================================================= */}
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
                          border-white/30
                          bg-black/55
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

                    {/* =================================================
                        FAVORI
                        ================================================= */}
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

                    {/* =================================================
                        DUREE
                        ================================================= */}
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

                {/* =================================================
                    CARD CONTENT
                    ================================================= */}
                <CardContent
                  className="
                    flex
                    flex-1
                    flex-col
                    px-4
                    pb-4
                    pt-4
                  "
                >
                  {/* =================================================
                      TITRE + PRIX
                      ================================================= */}
                  <div className="flex items-start justify-between gap-4">
                    <h2
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
                    </h2>

                    <div className="shrink-0 text-right">
                      <PriceDisplay
                        amount={circuit.prixEstime?.toString()}
                        fallback="Sur devis"
                        label="À partir de"
                        size="md"
                      />
                    </div>
                  </div>

                  {/* =================================================
                      THEME
                      ================================================= */}
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
                        "
                      >
                        {circuit.theme.nom}
                      </span>
                    </div>
                  )}

                  {/* =================================================
                      DESCRIPTION
                      ================================================= */}
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

                  {/* =================================================
                      BOUTON VOIR LE CIRCUIT
                      ================================================= */}
                  <Link
                    href={`/circuits/${encodeURIComponent(circuit.slug)}`}
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

                      transition-colors
                      duration-200

                      hover:bg-primary/90

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

          {/* =================================================
              PAGINATION
              ================================================= */}
          {totalPages > 1 && (
            <nav
              className="
                flex
                items-center
                justify-center
                gap-2
                pt-6
              "
              aria-label="Pagination des circuits"
            >
              {/* Précédent */}
              <Link
                href={`/circuits?page=${currentPage - 1}`}
                aria-disabled={currentPage <= 1}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    size: "sm",
                  }),
                  currentPage <= 1 && "pointer-events-none opacity-50",
                )}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Précédent
              </Link>

              {/* Page actuelle */}
              <span
                className="
                  px-3
                  text-sm
                  text-muted-foreground
                "
              >
                Page {currentPage} sur {totalPages}
              </span>

              {/* Suivant */}
              <Link
                href={`/circuits?page=${currentPage + 1}`}
                aria-disabled={currentPage >= totalPages}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    size: "sm",
                  }),
                  currentPage >= totalPages && "pointer-events-none opacity-50",
                )}
              >
                Suivant
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
