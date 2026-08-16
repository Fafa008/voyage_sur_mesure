import { prisma } from "@/lib/prisma";
import { StatutDevis } from "@prisma/client";
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
import { buttonVariants } from "@/components/ui/Button";
import { DeleteDevisButton } from "@/components/devis/DeleteDevisButton";
import { FileText, Users } from "lucide-react";
import { formatCurrency } from "@/lib/format";

const statutColors: Record<StatutDevis, string> = {
  [StatutDevis.en_cours]: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  [StatutDevis.en_modification]:
    "bg-orange-500/10 text-orange-600 border-orange-500/20",
  [StatutDevis.valide]: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  [StatutDevis.accepte]:
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  [StatutDevis.reserve]:
    "bg-purple-500/10 text-purple-600 border-purple-500/20",
  [StatutDevis.refuse]: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

const statutLabels: Record<StatutDevis, string> = {
  [StatutDevis.en_cours]: "En cours",
  [StatutDevis.en_modification]: "En modification",
  [StatutDevis.valide]: "Validé",
  [StatutDevis.accepte]: "Accepté",
  [StatutDevis.reserve]: "Réservé",
  [StatutDevis.refuse]: "Refusé",
};

export default async function AdminDevisPage() {
  const devisList = await prisma.devis.findMany({
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
  });

  const totalDevis = devisList.length;
  const devisEnCours = devisList.filter(
    (d) => d.statut === StatutDevis.en_cours,
  ).length;
  const devisAvecReservation = devisList.filter((d) => d.reservation).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Gestion des Devis
          </h1>
          <p className="text-sm text-muted-foreground">
            Consultez, suivez et supprimez les demandes de devis de tous les
            clients.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Devis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{totalDevis}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Demandes enregistrées
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              En Étude
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-amber-600">
              {devisEnCours}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              En attente de traitement
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Convertis en Réservation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-600">
              {devisAvecReservation}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Dossiers avancés
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-bold">
            Liste des Devis
          </CardTitle>
          <CardDescription className="text-xs">
            Tous les devis de tous les clients, du plus récent au plus ancien.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {devisList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-2" />
              <p>Aucun devis enregistré pour le moment.</p>
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
                          "fr-FR",
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
                          className={`text-xs px-2.5 py-0.5 font-medium ${statutColors[devis.statut]}`}
                        >
                          {statutLabels[devis.statut]}
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
        </CardContent>
      </Card>
    </div>
  );
}
