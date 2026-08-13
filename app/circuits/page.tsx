import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/Button";
import { FavoriteButton } from "@/components/favori/FavoriteButton";
import { getUserFavoriteCircuitIds } from "@/lib/favoris-utils";
import { formatCurrency } from "@/lib/format";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
      take: CIRCUITS_PER_PAGE,
      skip,
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
      orderBy: { titre: "asc" },
    }),
    prisma.circuit.count(),
    auth.api.getSession({ headers: await headers() }),
  ]);

  const totalPages = Math.ceil(total / CIRCUITS_PER_PAGE);
  const favoriteIds = await getUserFavoriteCircuitIds(session?.user.id);

  return (
    <main className="max-w-7xl mx-auto py-12 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Nos Circuits de Voyage
        </h1>
        <p className="text-muted-foreground mt-2">
          Découvrez nos itinéraires phares et laissez-vous inspirer pour créer
          votre voyage sur-mesure.
        </p>
        {total > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            {total} circuit{total > 1 ? "s" : ""} disponible
            {total > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {circuits.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Aucun circuit n&apos;est disponible pour le moment.
            </p>
            <Link
              href="/devis/nouveau"
              className={buttonVariants({ variant: "default" })}
            >
              Demander un devis sur-mesure
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {circuits.map((circuit) => (
              <Card
                key={circuit.id}
                className="overflow-hidden flex flex-col justify-between hover:shadow-lg transition"
              >
                <div>
                  <div className="h-48 bg-muted relative overflow-hidden">
                    {circuit.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={circuit.images[0].url}
                        alt={circuit.titre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Pas d&apos;image
                      </div>
                    )}
                    {circuit.region && (
                      <Badge className="absolute top-3 left-3 bg-black/70 text-white hover:bg-black/80">
                        {circuit.region.nom}
                      </Badge>
                    )}
                    <div className="absolute top-3 right-3">
                      <FavoriteButton
                        circuitId={circuit.id}
                        initialIsFavori={favoriteIds.has(circuit.id)}
                        size="sm"
                      />
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-xl">{circuit.titre}</CardTitle>
                      {circuit.theme && (
                        <Badge variant="outline">{circuit.theme.nom}</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {circuit.dureeJours
                        ? `${circuit.dureeJours} jours`
                        : "Durée flexible"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {circuit.description || "Aucune description fournie."}
                    </p>
                  </CardContent>
                </div>
                <div className="p-6 flex items-center justify-between mt-4 border-t pt-4">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      À partir de
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {circuit.prixEstime
                        ? formatCurrency(circuit.prixEstime)
                        : "Sur devis"}
                    </span>
                  </div>
                  <Link
                    href={`/circuits/${circuit.slug}`}
                    className={buttonVariants({ variant: "default" })}
                  >
                    Voir le circuit
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              className="flex items-center justify-center gap-2 pt-4"
              aria-label="Pagination des circuits"
            >
              <Link
                href={`/circuits?page=${currentPage - 1}`}
                aria-disabled={currentPage <= 1}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  currentPage <= 1 && "pointer-events-none opacity-50",
                )}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Précédent
              </Link>

              <span className="text-sm text-muted-foreground px-3">
                Page {currentPage} sur {totalPages}
              </span>

              <Link
                href={`/circuits?page=${currentPage + 1}`}
                aria-disabled={currentPage >= totalPages}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  currentPage >= totalPages && "pointer-events-none opacity-50",
                )}
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
