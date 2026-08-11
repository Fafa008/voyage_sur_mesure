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
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, MapPin, Calendar, Users, ArrowLeft } from "lucide-react";
import { PaymentCheckoutForm } from "./PaymentCheckoutForm";

interface Props {
  params: Promise<{ reservationId: string }>;
}

export default async function PaymentTunnelPage({ params }: Props) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { reservationId: resIdStr } = await params;
  const reservationId = parseInt(resIdStr, 10);
  if (isNaN(reservationId)) notFound();

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      circuit: true,
      devis: {
        include: { circuit: true },
      },
      user: { select: { id: true, name: true, email: true } },
      paiements: {
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

  // If already paid, redirect to confirmation
  if (reservation.status === "PAYEE") {
    redirect(`/paiement/${reservationId}/confirmation`);
  }

  const circuitTitle =
    reservation.circuit?.titre ||
    reservation.devis?.circuit?.titre ||
    "Voyage sur mesure";
  const amount = reservation.montantFinal?.toString() || "0";
  const latestTransaction = reservation.paiements[0] || null;

  return (
    <main className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <Link
        href={`/reservations/${reservation.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la réservation
      </Link>

      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Espace de Paiement Sécurisé
        </h1>
        <p className="text-muted-foreground">
          Finalisez le règlement de votre voyage à Madagascar en toute sérénité.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Résumé voyage (1 col) */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <Badge
                variant="outline"
                className="w-fit mb-2 text-xs font-bold text-primary border-primary/30"
              >
                Réservation #{reservation.id}
              </Badge>
              <CardTitle className="text-lg font-bold">
                {circuitTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {reservation.nbVoyageurs > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  <span>{reservation.nbVoyageurs} voyageur(s)</span>
                </div>
              )}

              {reservation.dateDebut && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    Du{" "}
                    {new Date(reservation.dateDebut).toLocaleDateString(
                      "fr-FR",
                    )}
                    {reservation.dateFin
                      ? ` au ${new Date(reservation.dateFin).toLocaleDateString("fr-FR")}`
                      : ""}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-border/40">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Montant à régler
                </p>
                <p className="text-3xl font-extrabold text-primary mt-1">
                  {amount} MGA
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-muted/20">
            <CardContent className="p-4 flex items-start gap-3 text-xs text-muted-foreground">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground mb-0.5">
                  Paiement Garanti & Sécurisé
                </p>
                <p>
                  Vos transactions sont protégées par le système
                  d&apos;authentification SSL.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Options / Formulaire de paiement (2 cols) */}
        <div className="md:col-span-2">
          <PaymentCheckoutForm
            reservationId={reservation.id}
            amount={amount}
            userId={session.user.id}
            latestTransaction={
              latestTransaction
                ? {
                    id: latestTransaction.id,
                    method: latestTransaction.method,
                    status: latestTransaction.status,
                    providerRef: latestTransaction.providerRef,
                  }
                : null
            }
          />
        </div>
      </div>
    </main>
  );
}
