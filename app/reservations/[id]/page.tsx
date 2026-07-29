import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { StatutReservation } from "@prisma/client";
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
  CalendarCheck,
  CreditCard,
  MapPin,
  Users,
  CheckCircle2,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

const statutColors: Record<StatutReservation, string> = {
  [StatutReservation.confirmee]: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  [StatutReservation.annulee]: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  [StatutReservation.terminee]: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

const statutLabels: Record<StatutReservation, string> = {
  [StatutReservation.confirmee]: "Confirmée",
  [StatutReservation.annulee]: "Annulée",
  [StatutReservation.terminee]: "Terminée",
};

export default async function ReservationDetailPage({ params }: Props) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await params;
  const reservationId = parseInt(id, 10);
  if (isNaN(reservationId)) notFound();

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      devis: {
        include: {
          circuit: true,
          user: { select: { id: true, name: true, prenom: true, email: true } },
        },
      },
      paiement: { include: { mode: true } },
    },
  });

  if (!reservation) notFound();

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  const isOwner = reservation.devis.userId === session.user.id;
  const isStaff =
    dbUser?.role?.nom === "admin" || dbUser?.role?.nom === "conseiller";

  if (!isOwner && !isStaff) redirect("/dashboard");

  const { devis, paiement } = reservation;

  return (
    <main className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <Link
        href={isOwner ? "/reservations" : "/conseiller/dashboard"}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        ← Retour
      </Link>

      {/* Confirmation banner */}
      {reservation.statut === StatutReservation.confirmee && isOwner && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold text-emerald-800 dark:text-emerald-300">
              Réservation confirmée !
            </p>
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Votre voyage est réservé. Un conseiller vous contactera pour les prochaines étapes.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Réservation #{reservation.id}</h1>
          <p className="text-sm text-muted-foreground">
            Confirmée le{" "}
            {new Date(reservation.dateReservation).toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Badge className={`text-sm px-3 py-1 border ${statutColors[reservation.statut]}`}>
          {statutLabels[reservation.statut]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="w-4 h-4 text-primary" />
              Voyage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {devis.circuit ? (
              <>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                    Circuit
                  </span>
                  <Link
                    href={`/circuits/${devis.circuit.slug}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {devis.circuit.titre}
                  </Link>
                </div>
                {devis.circuit.dureeJours && (
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                      Durée
                    </span>
                    <p>{devis.circuit.dureeJours} jours</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Voyage entièrement personnalisé</p>
            )}

            {(devis.dateDebutSouhaitee || devis.dateFinSouhaitee) && (
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                  Dates souhaitées
                </span>
                <p>
                  {devis.dateDebutSouhaitee
                    ? new Date(devis.dateDebutSouhaitee).toLocaleDateString("fr-FR")
                    : "?"}{" "}
                  →{" "}
                  {devis.dateFinSouhaitee
                    ? new Date(devis.dateFinSouhaitee).toLocaleDateString("fr-FR")
                    : "?"}
                </p>
              </div>
            )}

            <div>
              <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                <Users className="w-3 h-3 inline mr-1" />
                Voyageurs
              </span>
              <p>
                {devis.adultes} adulte(s)
                {devis.enfants > 0 ? `, ${devis.enfants} enfant(s)` : ""}
                {devis.ados > 0 ? `, ${devis.ados} ado(s)` : ""}
              </p>
            </div>

            <Link
              href={`/devis/${devis.id}`}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Voir le devis associé
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="w-4 h-4 text-primary" />
              Paiement
            </CardTitle>
            <CardDescription>Récapitulatif de la transaction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                Montant réglé
              </span>
              <p className="text-2xl font-extrabold text-primary">
                {reservation.montantFinal?.toString()} €
              </p>
            </div>

            {paiement && (
              <>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                    Mode de paiement
                  </span>
                  <p className="font-medium">{paiement.mode.nom}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                    Date du paiement
                  </span>
                  <p>
                    {new Date(paiement.datePaiement).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                {paiement.referenceTransaction && (
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                      Référence transaction
                    </span>
                    <p className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {paiement.referenceTransaction}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {isStaff && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations client</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>
              <strong>
                {devis.user.prenom} {devis.user.name}
              </strong>
            </p>
            <p className="text-muted-foreground">{devis.user.email}</p>
          </CardContent>
        </Card>
      )}

      {isOwner && (
        <div className="flex gap-3">
          <Link href="/reservations" className={buttonVariants({ variant: "outline" })}>
            <CalendarCheck className="w-4 h-4" />
            Toutes mes réservations
          </Link>
          <Link href="/dashboard" className={buttonVariants({ variant: "default" })}>
            Tableau de bord
          </Link>
        </div>
      )}
    </main>
  );
}
