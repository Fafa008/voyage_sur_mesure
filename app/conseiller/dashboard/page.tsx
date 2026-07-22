// app/conseiller/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatutDevis } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const statutColors = {
  [StatutDevis.en_cours]: "bg-yellow-100 text-yellow-800",
  [StatutDevis.en_modification]: "bg-orange-100 text-orange-800",
  [StatutDevis.valide]: "bg-blue-100 text-blue-800",
  [StatutDevis.accepte]: "bg-green-100 text-green-800",
  [StatutDevis.reserve]: "bg-purple-100 text-purple-800",
  [StatutDevis.refuse]: "bg-red-100 text-red-800",
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">📋 Demandes de devis</h1>
          <p className="text-gray-500 text-sm">
            Gérez les demandes entrantes et suivez leur progression
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total : <span className="font-semibold">{devisList.length}</span>{" "}
          demandes
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              À traiter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.en_cours}</p>
            <CardDescription>Demandes en attente d'étude</CardDescription>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Modifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.en_modification}</p>
            <CardDescription>Retours clients à traiter</CardDescription>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Validés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.valide}</p>
            <CardDescription>Devis envoyés aux clients</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des devis */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des demandes</CardTitle>
          <CardDescription>
            Cliquez sur une ligne pour voir le détail et traiter la demande
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Demandeur</TableHead>
                <TableHead>Circuit</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devisList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-gray-500 py-8"
                  >
                    🎉 Aucune demande en attente. Bonne journée !
                  </TableCell>
                </TableRow>
              ) : (
                devisList.map((devis) => (
                  <TableRow key={devis.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="font-medium">
                        {devis.user.prenom} {devis.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {devis.user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {devis.circuit?.titre || "Demande personnalisée"}
                    </TableCell>
                    <TableCell>
                      {new Date(devis.dateDemande).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <Badge className={statutColors[devis.statut]}>
                        {devis.statut.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        <Link href={`/conseiller/devis/${devis.id}`}>
                          Voir →
                        </Link>
                      </Button>
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
