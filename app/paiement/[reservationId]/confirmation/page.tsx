import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  CalendarCheck,
  FileText,
  ArrowRight,
  MapPin,
  Users,
} from "lucide-react";

interface Props {
  params: Promise<{ reservationId: string }>;
}

export default async function PaymentConfirmationPage({ params }: Props) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { reservationId: resIdStr } = await params;
  const reservationId = parseInt(resIdStr, 10);
  if (isNaN(reservationId)) notFound();

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      circuit: true,
      devis: { include: { circuit: true } },
      paiements: {
        include: { provider: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!reservation) notFound();

  const isOwner =
    reservation.userId === session.user.id ||
    reservation.devis?.userId === session.user.id;
  if (!isOwner) redirect("/dashboard");

  const circuitTitle =
    reservation.circuit?.titre ||
    reservation.devis?.circuit?.titre ||
    "Voyage sur mesure";
  const amount = reservation.montantFinal?.toString() || "0";
  const lastTransaction = reservation.paiements[0] || null;

  return (
    <main className="max-w-3xl mx-auto py-12 px-4 space-y-8 text-center sm:text-left">
      {/* Banner Succès */}
      <div className="flex flex-col items-center sm:items-start gap-4 p-6 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900">
        <CheckCircle2 className="w-14 h-14 text-emerald-600 shrink-0" />
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-200">
            Merci ! Votre réservation est confirmée
          </h1>
          <p className="text-emerald-700 dark:text-emerald-400 text-sm">
            Nous avons bien pris en compte votre règlement pour la réservation #
            {reservation.id}. Un e-mail de récapitulatif vous a été envoyé.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Détails du Voyage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Récapitulatif du Voyage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs uppercase tracking-wider block">
                Intitulé
              </span>
              <p className="font-bold text-foreground">{circuitTitle}</p>
            </div>

            {reservation.nbVoyageurs > 0 && (
              <div>
                <span className="text-muted-foreground text-xs uppercase tracking-wider block">
                  Voyageurs
                </span>
                <p className="font-medium">
                  {reservation.nbVoyageurs} personne(s)
                </p>
              </div>
            )}

            {reservation.dateDebut && (
              <div>
                <span className="text-muted-foreground text-xs uppercase tracking-wider block">
                  Dates
                </span>
                <p className="font-medium">
                  Du{" "}
                  {new Date(reservation.dateDebut).toLocaleDateString("fr-FR")}
                  {reservation.dateFin
                    ? ` au ${new Date(reservation.dateFin).toLocaleDateString("fr-FR")}`
                    : ""}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Détails de la Transaction */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Détails du Règlement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs uppercase tracking-wider block">
                Montant
              </span>
              <p className="text-xl font-bold text-primary">
                {amount} MGA
              </p>
            </div>

            {lastTransaction && (
              <>
                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wider block">
                    Mode
                  </span>
                  <Badge
                    variant="outline"
                    className="font-semibold text-xs mt-0.5"
                  >
                    {lastTransaction.method === "PAPI"
                      ? "Papi (Mobile Money / CB)"
                      : lastTransaction.method === "BINANCE_PAY"
                        ? "Binance Pay (Crypto)"
                        : "Virement Bancaire"}
                  </Badge>
                </div>

                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wider block">
                    Statut Transaction
                  </span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold text-xs mt-0.5">
                    {lastTransaction.status}
                  </Badge>
                </div>

                {lastTransaction.providerRef && (
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider block">
                      Référence
                    </span>
                    <p className="font-mono text-xs bg-muted px-2 py-1 rounded w-fit mt-0.5">
                      {lastTransaction.providerRef}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prochaines Étapes */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base font-bold text-foreground">
            Prochaines Étapes
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>1. Votre conseiller dédié examine votre dossier de réservation.</p>
          <p>
            2. Vous recevrez une convocation et le carnet de voyage avant votre
            départ.
          </p>
          <p>
            3. Pour toute question, vous pouvez contacter notre équipe à tout
            moment.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-center sm:justify-start gap-4 pt-2">
        <Link
          href={`/reservations/${reservation.id}`}
          className={buttonVariants({ variant: "default" })}
        >
          <CalendarCheck className="w-4 h-4 mr-2" />
          Voir ma réservation
        </Link>
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "outline" })}
        >
          Tableau de bord
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </main>
  );
}
