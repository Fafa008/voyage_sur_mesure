import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatutDevis } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/Button";
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
import {
  Clock,
  FileText,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Phone,
  Mail,
} from "lucide-react";

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

export default async function ConseillerDashboardPage() {
  const devisList = await prisma.devis.findMany({
    where: {
      statut: {
        in: [
          StatutDevis.en_cours,
          StatutDevis.en_modification,
          StatutDevis.valide,
        ],
      },
    },
    include: {
      user: {
        select: {
          name: true,
          prenom: true,
          email: true,
          telephone: true,
        },
      },
      circuit: {
        select: {
          titre: true,
        },
      },
    },
    orderBy: {
      dateDemande: "desc",
    },
  });

  const stats = {
    en_cours: devisList.filter((d) => d.statut === StatutDevis.en_cours).length,
    en_modification: devisList.filter(
      (d) => d.statut === StatutDevis.en_modification,
    ).length,
    valide: devisList.filter((d) => d.statut === StatutDevis.valide).length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Gestion des Demandes de Devis
          </h1>
          <p className="text-sm text-muted-foreground">
            Étudiez les demandes entrantes, proposez des chiffrages et
            accompagnez les clients dans leur projet.
          </p>
        </div>
        <div className="text-sm text-muted-foreground bg-background px-4 py-2 rounded-xl border border-border shrink-0">
          En attente de traitement :{" "}
          <span className="font-extrabold text-foreground">
            {devisList.length}
          </span>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-amber-500 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              À Traiter Absolument
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-amber-600">
              {stats.en_cours}
            </div>
            <CardDescription className="text-xs mt-1">
              Nouvelles demandes reçues
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Modifications Client
            </CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-orange-600">
              {stats.en_modification}
            </div>
            <CardDescription className="text-xs mt-1">
              Retours ou ajustements demandés
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Devis Proposés & Validés
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-blue-600">
              {stats.valide}
            </div>
            <CardDescription className="text-xs mt-1">
              Offres envoyées aux voyageurs
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des devis */}
      <Card className="border border-border/60">
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            Inbox des Demandes Client
          </CardTitle>
          <CardDescription className="text-xs">
            Sélectionnez un dossier pour consulter le formulaire détaillé et
            formuler votre proposition.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client / Voyageur</TableHead>
                <TableHead>Circuit / Projet</TableHead>
                <TableHead>Date Demande</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devisList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-10"
                  >
                    Aucune demande en attente actuellement.
                  </TableCell>
                </TableRow>
              ) : (
                devisList.map((devis) => (
                  <TableRow
                    key={devis.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <TableCell>
                      <div className="font-semibold text-foreground">
                        {devis.user.prenom || ""} {devis.user.name}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {devis.user.email}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {devis.circuit?.titre || "Sur mesure (Sur demande)"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(devis.dateDemande).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs px-2.5 py-0.5 font-medium ${statutColors[devis.statut]}`}
                      >
                        {devis.statut.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/conseiller/devis/${devis.id}`}
                        className={buttonVariants({
                          variant: "default",
                          size: "sm",
                        })}
                      >
                        Traiter le dossier
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
