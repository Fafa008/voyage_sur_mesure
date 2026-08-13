import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StatutReservation } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarCheck, ArrowRight, MapPin } from "lucide-react";

const statutColors: Record<StatutReservation, string> = {
  [StatutReservation.confirmee]:
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  [StatutReservation.annulee]:
    "bg-rose-500/10 text-rose-600 border-rose-500/20",
  [StatutReservation.terminee]:
    "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

const statutLabels: Record<StatutReservation, string> = {
  [StatutReservation.confirmee]: "Confirmée",
  [StatutReservation.annulee]: "Annulée",
  [StatutReservation.terminee]: "Terminée",
};

export default async function ReservationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const reservations = await prisma.reservation.findMany({
    where: { devis: { userId: session.user.id } },
    include: {
      devis: {
        include: {
          circuit: { select: { titre: true, slug: true, dureeJours: true } },
        },
      },
      paiement: { include: { mode: true } },
    },
    orderBy: { dateReservation: "desc" },
  });

  return (
    <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Mes Réservations
        </h1>
        <p className="text-muted-foreground">
          Retrouvez l'historique de vos voyages confirmés et leurs détails de
          paiement.
        </p>
      </div>

      {reservations.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-4">
            <CalendarCheck className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground">
              Vous n'avez pas encore de réservation confirmée.
            </p>
            <Link
              href="/circuits"
              className={buttonVariants({ variant: "default" })}
            >
              Découvrir nos circuits
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reservations.map((res) => (
            <Card
              key={res.id}
              className="border border-border/60 hover:border-primary/30 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      {res.devis?.circuit?.titre ??
                        (res.devis
                          ? `Voyage personnalisé #${res.devis.id}`
                          : `Réservation #${res.id}`)}
                    </CardTitle>
                    <CardDescription>
                      Réservation #{res.id} —{" "}
                      {new Date(res.dateReservation).toLocaleDateString(
                        "fr-FR",
                      )}
                    </CardDescription>
                  </div>
                  <Badge
                    className={`shrink-0 border ${statutColors[res.statut]}`}
                  >
                    {statutLabels[res.statut]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {res.devis?.circuit && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {res.devis.circuit.dureeJours
                      ? `${res.devis.circuit.dureeJours} jours`
                      : "Durée sur mesure"}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Montant
                    </p>
                    <p className="text-xl font-bold text-primary">
                      {res.montantFinal?.toString()} MGA
                    </p>
                  </div>
                  {res.paiement && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Paiement</p>
                      <p className="font-medium">{res.paiement.mode.nom}</p>
                    </div>
                  )}
                </div>

                <Link
                  href={`/reservations/${res.id}`}
                  className={
                    buttonVariants({ variant: "outline", size: "sm" }) +
                    " w-full"
                  }
                >
                  Voir le détail
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
