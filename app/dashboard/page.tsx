import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StatutDevis } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
  FileText,
  Clock,
  Star,
  Bell,
  PlusCircle,
  ArrowRight,
  Sparkles,
  MapPin,
  CalendarCheck,
} from "lucide-react";
import { MarkNotificationReadButton } from "@/components/notifications/MarkNotificationReadButton";

const statutColors: Record<StatutDevis, string> = {
  [StatutDevis.en_cours]: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  [StatutDevis.en_modification]: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  [StatutDevis.valide]: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  [StatutDevis.accepte]: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  [StatutDevis.reserve]: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  [StatutDevis.refuse]: "bg-rose-500/10 text-rose-600 border-rose-500/20",
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
    take: 5,
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

  // Récupérer les réservations récentes
  const reservations = await prisma.reservation.findMany({
    where: { devis: { userId } },
    include: {
      devis: {
        include: {
          circuit: { select: { titre: true } },
        },
      },
    },
    orderBy: { dateReservation: "desc" },
    take: 3,
  });

  // Statistiques
  const totalDevis = await prisma.devis.count({ where: { userId } });
  const devisEnAttente = await prisma.devis.count({
    where: { userId, statut: StatutDevis.en_cours },
  });
  const totalReservations = await prisma.reservation.count({
    where: { devis: { userId } },
  });
  const devisAPayer = await prisma.devis.count({
    where: { userId, statut: StatutDevis.accepte },
  });
  const totalFavoris = await prisma.favori.count({ where: { userId } });
  const notificationsNonLues = await prisma.notification.count({
    where: { userId, lu: false },
  });

  return (
    <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Banner / En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              👋 Bonjour, {session.user.name}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Bienvenue dans votre espace personnel. Suivez l'avancement de vos demandes de devis et préparez votre séjour.
          </p>
        </div>

        <Link
          href="/devis/nouveau"
          className={buttonVariants({ variant: "default", size: "lg" }) + " shrink-0 shadow-md"}
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Nouvelle Demande de Devis
        </Link>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Devis
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{totalDevis}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Demande(s) soumise(s)</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              En Étude
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-amber-600">{devisEnAttente}</div>
            <p className="text-[11px] text-muted-foreground mt-1">En attente de retour</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Réservations
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-600">{totalReservations}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {devisAPayer > 0
                ? `${devisAPayer} devis en attente de paiement`
                : "Voyage(s) confirmé(s)"}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Favoris
            </CardTitle>
            <Star className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{totalFavoris}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Circuits sauvegardés</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Alertes
            </CardTitle>
            <Bell className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">
              {notificationsNonLues > 0 ? (
                <span className="text-rose-500 font-bold">{notificationsNonLues}</span>
              ) : (
                "0"
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Notification(s) non lue(s)</p>
          </CardContent>
        </Card>
      </div>

      {/* Réservations récentes */}
      {reservations.length > 0 && (
        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Mes réservations</CardTitle>
              <CardDescription className="text-xs">
                Vos voyages confirmés et leurs détails
              </CardDescription>
            </div>
            <Link
              href="/reservations"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Voir tout
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {reservations.map((res) => (
                <li
                  key={res.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20"
                >
                  <div>
                    <p className="font-semibold text-sm">
                      {res.devis.circuit?.titre ?? `Devis #${res.devis.id}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(res.dateReservation).toLocaleDateString("fr-FR")} —{" "}
                      {res.montantFinal?.toString()} €
                    </p>
                  </div>
                  <Link
                    href={`/reservations/${res.id}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Détail
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Dernières demandes de devis */}
      <Card className="border border-border/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">📋 Vos dernières demandes</CardTitle>
            <CardDescription className="text-xs">
              Consultez l'historique et l'état d'avancement de vos dossiers
            </CardDescription>
          </div>
          <Link
            href="/devis/historique"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Voir tout
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Itinéraire / Demande</TableHead>
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
                    className="text-center text-muted-foreground py-8"
                  >
                    Vous n'avez pas encore de demande de devis.
                    <div className="mt-2">
                      <Link
                        href="/devis/nouveau"
                        className="text-primary hover:underline text-xs font-medium"
                      >
                        + Créer ma première demande sur mesure
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                devisList.map((devis) => (
                  <TableRow key={devis.id} className="hover:bg-muted/40">
                    <TableCell className="font-semibold text-foreground">
                      {devis.circuit?.titre || "Voyage sur-mesure"}
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
                        href={`/devis/${devis.id}`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Détail
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Grille 2 colonnes : Favoris & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Favoris */}
        <Card className="border border-border/60 flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Mes Circuits Favoris
              </CardTitle>
              <CardDescription className="text-xs">Itinéraires sauvegardés</CardDescription>
            </div>
            <Link
              href="/favoris"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Voir tout
            </Link>
          </CardHeader>
          <CardContent>
            {favoris.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Aucun favori sauvegardé pour le moment. Explorez nos circuits et cliquez sur la star !
              </p>
            ) : (
              <ul className="space-y-3">
                {favoris.map((fav) => (
                  <li
                    key={fav.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <Link
                        href={`/circuits/${fav.circuit.slug}`}
                        className="font-semibold text-sm hover:text-primary transition-colors block"
                      >
                        {fav.circuit.titre}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        À partir de {fav.circuit.prixEstime ? `${fav.circuit.prixEstime.toString()} €` : "Sur devis"}
                      </span>
                    </div>
                    <Link
                      href={`/circuits/${fav.circuit.slug}`}
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border border-border/60 flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                Notifications & Suivi
              </CardTitle>
              <CardDescription className="text-xs">Derniers messages de vos conseillers</CardDescription>
            </div>
            <Link
              href="/notifications"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Voir tout
            </Link>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Aucune nouvelle notification pour le moment.
              </p>
            ) : (
              <ul className="space-y-3">
                {notifications.map((notif) => (
                  <li
                    key={notif.id}
                    className="p-3 rounded-lg border border-border/40 bg-muted/20 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm text-foreground">{notif.titre}</h4>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(notif.dateEnvoi).toLocaleDateString("fr-FR")}
                        </span>
                        <MarkNotificationReadButton notificationId={notif.id} />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{notif.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
