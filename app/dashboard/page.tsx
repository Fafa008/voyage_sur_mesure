// app/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
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

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Récupérer les devis du client
  const devisList = await prisma.devis.findMany({
    where: { userId },
    include: {
      circuit: {
        select: { titre: true, slug: true },
      },
    },
    orderBy: { dateDemande: "desc" },
    take: 5, // 5 derniers devis
  });

  // Récupérer les favoris
  const favoris = await prisma.favori.findMany({
    where: { userId },
    include: {
      circuit: {
        select: {
          titre: true,
          slug: true,
          prixEstime: true,
          images: { take: 1 },
        },
      },
    },
    orderBy: { dateAjout: "desc" },
    take: 3,
  });

  // Récupérer les notifications non lues
  const notifications = await prisma.notification.findMany({
    where: { userId, lu: false },
    orderBy: { dateEnvoi: "desc" },
    take: 3,
  });

  // Statistiques
  const totalDevis = await prisma.devis.count({ where: { userId } });
  const devisEnAttente = await prisma.devis.count({
    where: { userId, statut: StatutDevis.en_cours },
  });
  const totalFavoris = await prisma.favori.count({ where: { userId } });
  const notificationsNonLues = notifications.length;

  return (
    <div className="space-y-6">
      {/* En-tête de bienvenue */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            👋 Bonjour, {session.user.name}
          </h1>
          <p className="text-gray-500 text-sm">
            Bienvenue sur votre espace personnel
          </p>
        </div>
        <Link
          href="/devis/nouveau"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          ✈️ Demander un devis
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Devis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalDevis}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{devisEnAttente}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Favoris
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalFavoris}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {notificationsNonLues > 0 ? (
                <span className="text-red-500">{notificationsNonLues}</span>
              ) : (
                "0"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Derniers devis */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>📋 Mes derniers devis</CardTitle>
            <CardDescription>Suivez l'état de vos demandes</CardDescription>
          </div>
          <Link
            href="/devis/historique"
            className="inline-flex items-center rounded-md px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Voir tout →
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
                    colSpan={4}
                    className="text-center text-gray-500 py-6"
                  >
                    Vous n'avez pas encore de devis.
                    <br />
                    <Link
                      href="/devis/nouveau"
                      className="mt-1 inline-flex text-primary underline-offset-4 hover:underline"
                    >
                      Créer ma première demande
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                devisList.map((devis) => (
                  <TableRow key={devis.id}>
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
                      <Link
                        href={`/devis/${devis.id}`}
                        className="inline-flex items-center rounded-md px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Voir →
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Favoris et notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Favoris */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>⭐ Mes favoris</CardTitle>
              <CardDescription>Circuits que vous avez aimés</CardDescription>
            </div>
            <Link
              href="/favoris"
              className="inline-flex items-center rounded-md px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Voir tout →
            </Link>
          </CardHeader>
          <CardContent>
            {favoris.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Vous n'avez pas encore de favoris. Parcourez les circuits et
                ajoutez-les en favori.
              </p>
            ) : (
              <ul className="space-y-2">
                {favoris.map((fav) => (
                  <li
                    key={fav.id}
                    className="flex justify-between items-center border-b pb-2 last:border-0"
                  >
                    <Link
                      href={`/circuits/${fav.circuit.slug}`}
                      className="hover:underline"
                    >
                      {fav.circuit.titre}
                    </Link>
                    <span className="text-sm text-gray-500">
                      {fav.circuit.prixEstime?.toString() ?? "0"} €
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>🔔 Notifications</CardTitle>
            <CardDescription>Les dernières alertes</CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Aucune nouvelle notification
              </p>
            ) : (
              <ul className="space-y-2">
                {notifications.map((notif) => (
                  <li key={notif.id} className="border-b pb-2 last:border-0">
                    <p className="font-medium">{notif.titre}</p>
                    <p className="text-sm text-gray-500">{notif.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(notif.dateEnvoi).toLocaleDateString("fr-FR")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
