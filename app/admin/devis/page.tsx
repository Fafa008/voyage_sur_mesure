import { prisma } from "@/lib/prisma";
import { StatutDevis, Prisma } from "@prisma/client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { DeleteDevisButton } from "@/components/devis/DeleteDevisButton";
import { DevisFilters } from "@/components/devis/DevisFilters";
import { FileText, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { statutDevisColors, statutDevisLabels } from "@/lib/statut-config";
import { cn } from "@/lib/utils";

const DEVIS_PER_PAGE = 15;

interface AdminDevisPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    statut?: string;
  }>;
}

export default async function AdminDevisPage({
  searchParams,
}: AdminDevisPageProps) {
  const { page, search, statut } = await searchParams;

  const currentPage = Math.max(1, parseInt(page ?? "1", 10));
  const skip = (currentPage - 1) * DEVIS_PER_PAGE;

  // Build Prisma filter
  const where: Prisma.DevisWhereInput = { deletedAt: null };

  if (statut && Object.values(StatutDevis).includes(statut as StatutDevis)) {
    where.statut = statut as StatutDevis;
  }

  if (search && search.trim() !== "") {
    const term = search.trim();
    where.OR = [
      { user: { name: { contains: term, mode: "insensitive" } } },
      { user: { prenom: { contains: term, mode: "insensitive" } } },
      { user: { email: { contains: term, mode: "insensitive" } } },
      { circuit: { titre: { contains: term, mode: "insensitive" } } },
    ];
  }

  const [devisList, totalFiltered, totalOverall, devisEnCours, devisAvecReservation] =
    await Promise.all([
      prisma.devis.findMany({
        where,
        take: DEVIS_PER_PAGE,
        skip,
        include: {
          user: {
            select: { name: true, prenom: true, email: true },
          },
          circuit: {
            select: { titre: true, slug: true },
          },
          reservation: {
            select: { id: true },
          },
        },
        orderBy: { dateDemande: "desc" },
      }),
      prisma.devis.count({ where }),
      prisma.devis.count({ where: { deletedAt: null } }),
      prisma.devis.count({ where: { deletedAt: null, statut: StatutDevis.en_cours } }),
      prisma.devis.count({ where: { deletedAt: null, reservation: { isNot: null } } }),
    ]);

  const totalPages = Math.ceil(totalFiltered / DEVIS_PER_PAGE);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Gestion des Devis
        </h1>
        <p className="text-sm text-muted-foreground">
          Consultez, recherchez, filtrez et gérez l&apos;ensemble des demandes de devis clients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Devis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalOverall}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Demandes enregistrées au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              En Étude
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {devisEnCours}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              En attente de traitement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Convertis en Réservation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {devisAvecReservation}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Dossiers avancés
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-base font-bold">
              Liste des Devis
            </CardTitle>
            <CardDescription className="text-xs">
              {totalFiltered} dossier{totalFiltered > 1 ? "s" : ""} trouvé
              {totalFiltered > 1 ? "s" : ""}
            </CardDescription>
          </div>
          {/* Barre de recherche et filtres */}
          <DevisFilters currentSearch={search} currentStatut={statut} />
        </CardHeader>

        <CardContent className="space-y-6">
          {devisList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/30" />
              <p className="font-medium">Aucun devis ne correspond à votre recherche.</p>
              <p className="text-xs text-muted-foreground">
                Essayez de modifier vos filtres ou le terme de recherche.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Circuit</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Voyageurs</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devisList.map((devis) => (
                    <TableRow key={devis.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-bold text-foreground">
                            {devis.user.prenom || devis.user.name}
                            {devis.user.prenom ? ` ${devis.user.name}` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {devis.user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/circuits/${devis.circuit.slug}`}
                          className="text-primary hover:underline text-sm font-medium"
                        >
                          {devis.circuit.titre}
                        </Link>
                        <span className="block text-xs text-muted-foreground">
                          Devis #{devis.id}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(devis.dateDemande).toLocaleDateString(
                          "fr-FR"
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-muted-foreground" />
                          {devis.nombrePersonnes}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs px-2.5 py-0.5 font-medium ${
                            statutDevisColors[devis.statut] || ""
                          }`}
                        >
                          {statutDevisLabels[devis.statut] || devis.statut}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-primary text-sm">
                        {devis.montantTotal
                          ? formatCurrency(devis.montantTotal)
                          : "Sur devis"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/devis/${devis.id}`}
                            className={buttonVariants({
                              variant: "outline",
                              size: "sm",
                            })}
                          >
                            Détail
                          </Link>
                          <DeleteDevisButton
                            devisId={devis.id}
                            label="Supprimer"
                            redirectTo="/admin/devis"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              className="flex items-center justify-between border-t border-border/40 pt-4"
              aria-label="Pagination des devis"
            >
              <span className="text-xs text-muted-foreground">
                Page {currentPage} sur {totalPages} ({totalFiltered} résultats)
              </span>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/devis?page=${currentPage - 1}${
                    search ? `&search=${encodeURIComponent(search)}` : ""
                  }${statut ? `&statut=${statut}` : ""}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    currentPage <= 1 && "pointer-events-none opacity-50"
                  )}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Précédent
                </Link>

                <Link
                  href={`/admin/devis?page=${currentPage + 1}${
                    search ? `&search=${encodeURIComponent(search)}` : ""
                  }${statut ? `&statut=${statut}` : ""}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    currentPage >= totalPages && "pointer-events-none opacity-50"
                  )}
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </nav>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
