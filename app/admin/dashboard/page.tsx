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
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Compass,
  FileText,
  Star,
  CalendarCheck,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  Tag,
  ShieldCheck,
} from "lucide-react";

export default async function AdminDashboardPage() {
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
    prisma.circuit.count({ where: { deletedAt: null } }),
    prisma.devis.count({ where: { deletedAt: null } }),
    prisma.reservation.count({ where: { deletedAt: null } }),
    prisma.avis.count(),
    prisma.avis.count({ where: { estModere: false } }),
    prisma.devis.groupBy({
      by: ["statut"],
      where: { deletedAt: null },
      _count: true,
    }),
    prisma.reservation.groupBy({
      where: { deletedAt: null },
      by: ["statut"],
      _count: true,
    }),
  ]);

  const tauxConversion =
    totalDevis > 0 ? Math.round((totalReservations / totalDevis) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Vue d&apos;ensemble de l&apos;Administration
          </h1>
          <p className="text-sm text-muted-foreground">
            Suivez les indicateurs clés de performance, gérez les contenus et
            administrez les accès.
          </p>
        </div>
        <Link
          href="/admin/circuits/nouveau"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "shrink-0 shadow-md"
          )}
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Ajouter un circuit
        </Link>
      </div>

      {/* Grid de 4 statistiques principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Utilisateurs
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{totalUsers}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Comptes inscrits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Circuits
            </CardTitle>
            <Compass className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{totalCircuits}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Itinéraires au catalogue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Devis Reçus
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{totalDevis}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Demandes enregistrées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Réservations
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {totalReservations}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Réservations validées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid 3 cartes d'analyses avancées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Taux de Conversion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">
                {tauxConversion}%
              </span>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <CardDescription className="text-xs">
              Devis convertis en réservations
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Modération des Avis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">
                {avisNonModeres}
              </span>
              {avisNonModeres > 0 && (
                <AlertCircle className="h-5 w-5 text-primary animate-pulse" />
              )}
            </div>
            <CardDescription className="text-xs">
              Avis en attente de validation
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Avis Clients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">
                {totalAvis}
              </span>
              <Star className="h-5 w-5 text-primary fill-primary" />
            </div>
            <CardDescription className="text-xs">
              Retours d'expérience déposés
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par statut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">
              Statut des Devis
            </CardTitle>
            <CardDescription className="text-xs">
              Répartition des demandes par état
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {devisParStatut.map((item) => (
                <li
                  key={item.statut}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50"
                >
                  <span className="capitalize text-sm font-medium text-foreground">
                    {item.statut.replace("_", " ")}
                  </span>
                  <Badge variant="outline" className="font-bold">
                    {item._count}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">
              Statut des Réservations
            </CardTitle>
            <CardDescription className="text-xs">
              Répartition des dossiers de réservation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {reservationsParStatut.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Aucune réservation pour le moment.
                </p>
              ) : (
                reservationsParStatut.map((item) => (
                  <li
                    key={item.statut}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50"
                  >
                    <span className="capitalize text-sm font-medium text-foreground">
                      {item.statut}
                    </span>
                    <Badge variant="outline" className="font-bold">
                      {item._count}
                    </Badge>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">
            Actions rapides
          </CardTitle>
          <CardDescription className="text-xs">
            Raccourcis vers la gestion du catalogue et la modération
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link
            href="/admin/circuits"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            <Compass className="w-4 h-4 mr-1.5" />
            Gérer les circuits
          </Link>
          <Link
            href="/admin/utilisateurs"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Users className="w-4 h-4 mr-1.5" />
            Utilisateurs
          </Link>
          <Link
            href="/admin/avis"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Star className="w-4 h-4 mr-1.5" />
            Modérer les avis
          </Link>
          <Link
            href="/admin/themes"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Tag className="w-4 h-4 mr-1.5" />
            Thèmes & Régions
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
