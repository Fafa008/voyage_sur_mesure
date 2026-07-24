// app/admin/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatutDevis, StatutReservation } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Map,
  FileText,
  Star,
  CalendarCheck,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default async function AdminDashboardPage() {
  // Statistiques
  const [
    totalUsers,
    totalCircuits,
    totalDevis,
    totalReservations,
    totalAvis,
    avisNonModeres,
    devisParStatut,
    reservationsParStatut,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.circuit.count(),
    prisma.devis.count(),
    prisma.reservation.count(),
    prisma.avis.count(),
    prisma.avis.count({ where: { estModere: false } }),
    prisma.devis.groupBy({
      by: ["statut"],
      _count: true,
    }),
    prisma.reservation.groupBy({
      by: ["statut"],
      _count: true,
    }),
  ]);

  // Calcul du taux de conversion (devis → réservation)
  const tauxConversion =
    totalDevis > 0 ? Math.round((totalReservations / totalDevis) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold">📊 Tableau de bord</h1>
        <p className="text-gray-500 text-sm">
          Vue d'ensemble de l'activité de la plateforme
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Utilisateurs
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Circuits
            </CardTitle>
            <Map className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCircuits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Devis
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalDevis}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Réservations
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalReservations}</p>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques avancées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Taux de conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{tauxConversion}%</p>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <CardDescription>Devis → Réservations</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Avis en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{avisNonModeres}</p>
              {avisNonModeres > 0 && (
                <AlertCircle className="h-5 w-5 text-orange-500" />
              )}
            </div>
            <CardDescription>À modérer</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Avis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalAvis}</p>
            <CardDescription>Nombre total d'avis déposés</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Détail par statut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Statut des devis</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {devisParStatut.map((item) => (
                <li key={item.statut} className="flex justify-between">
                  <span className="capitalize">
                    {item.statut.replace("_", " ")}
                  </span>
                  <span className="font-medium">{item._count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Statut des réservations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {reservationsParStatut.map((item) => (
                <li key={item.statut} className="flex justify-between">
                  <span className="capitalize">{item.statut}</span>
                  <span className="font-medium">{item._count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Actions rapides</CardTitle>
          <CardDescription>
            Accédez directement aux principales fonctionnalités d'administration
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/admin/circuits">
            <Button>➕ Ajouter un circuit</Button>
          </Link>
          <Link href="/admin/utilisateurs">
            <Button variant="outline">👥 Gérer les utilisateurs</Button>
          </Link>
          <Link href="/admin/avis">
            <Button variant="outline">⭐ Modérer les avis</Button>
          </Link>
          <Link href="/admin/themes">
            <Button variant="outline">🏷️ Gérer les thèmes & régions</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
