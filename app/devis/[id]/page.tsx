import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { StatutDevis } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { DevisResponseActions } from "@/components/devis/DevisResponseActions";
import { PaymentForm } from "@/components/reservation/PaymentForm";
import { DeleteDevisButton } from "@/components/devis/DeleteDevisButton";
import { DevisTimeline } from "@/components/devis/DevisTimeline";
import { statutDevisColors, statutDevisLabels } from "@/lib/statut-config";
import { CreditCard, CheckCircle2, CalendarCheck } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface DevisDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DevisDetailPage({
  params,
}: DevisDetailPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await params;
  const devisId = parseInt(id, 10);
  if (isNaN(devisId)) notFound();

  const [devis, modesPaiement] = await Promise.all([
    prisma.devis.findUnique({
      where: { id: devisId },
      include: {
        circuit: true,
        user: { select: { id: true, name: true, email: true } },
        conseiller: {
          select: {
            id: true,
            name: true,
            prenom: true,
            email: true,
            telephone: true,
            image: true,
          },
        },
        reservation: {
          include: {
            paiement: { include: { mode: true } },
          },
        },
      },
    }),
    prisma.modePaiement.findMany({ orderBy: { nom: "asc" } }),
  ]);

  if (!devis) notFound();

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  const isOwner = devis.userId === session.user.id;
  const isStaff =
    dbUser?.role?.nom === "admin" || dbUser?.role?.nom === "conseiller";
  const isAdmin = dbUser?.role?.nom === "admin";

  if (!isOwner && !isStaff) redirect("/dashboard");

  const showClientActions = isOwner && devis.statut === StatutDevis.valide;
  const showPayment =
    isOwner &&
    (devis.statut === StatutDevis.accepte ||
      devis.statut === StatutDevis.reserve) &&
    !devis.reservation;
  const hasReservation = !!devis.reservation;
  const isReservationPaid = devis.reservation?.status === "PAYEE";

  const canDelete = isAdmin || (isOwner && !hasReservation);

  return (
    <main className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Retour au tableau de bord
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Demande de Devis #{devis.id}</h1>
          <p className="text-sm text-muted-foreground">
            Demandé le {new Date(devis.dateDemande).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={`text-sm px-3 py-1 border ${
              statutDevisColors[devis.statut] || ""
            }`}
          >
            {statutDevisLabels[devis.statut] || devis.statut}
          </Badge>
          {canDelete && (
            <DeleteDevisButton
              devisId={devis.id}
              redirectTo={isAdmin ? "/admin/devis" : "/devis/historique"}
            />
          )}
        </div>
      </div>

      {/* Stepper visuel de progression de la demande */}
      <DevisTimeline
        statut={devis.statut}
        hasReservation={hasReservation}
        isReservationPaid={isReservationPaid}
      />

      {/* Actions client : accepter / refuser */}
      {showClientActions && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-base">Votre réponse</CardTitle>
          </CardHeader>
          <CardContent>
            <DevisResponseActions devisId={devis.id} />
          </CardContent>
        </Card>
      )}

      {/* Formulaire de paiement si aucune réservation créée */}
      {showPayment && devis.montantTotal && (
        <Card className="border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/20 dark:border-emerald-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Finaliser votre réservation
            </CardTitle>
            <CardDescription>
              Choisissez votre mode de paiement pour régler votre voyage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentForm
              devisId={devis.id}
              montant={devis.montantTotal.toString()}
            />
          </CardContent>
        </Card>
      )}

      {/* Si réservation existe mais N'EST PAS ENCORE PAYÉE */}
      {hasReservation &&
        devis.reservation &&
        devis.reservation.status !== "PAYEE" && (
          <Card className="border-amber-200 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-amber-800 dark:text-amber-300 font-bold">
                <CreditCard className="w-5 h-5 text-amber-600" />
                Réservation enregistrée — En attente de paiement
              </CardTitle>
              <CardDescription>
                Votre réservation #{devis.reservation.id} est en attente.
                Finalisez votre règlement pour valider définitivement votre
                dossier.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={`/paiement/${devis.reservation.id}`}
                className={
                  buttonVariants({ variant: "default", size: "lg" }) +
                  " font-bold shadow-sm"
                }
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Accéder à l'espace de paiement (
                {formatCurrency(devis.reservation.montantFinal)})
              </Link>
            </CardContent>
          </Card>
        )}

      {/* Si réservation PAYÉE */}
      {hasReservation &&
        devis.reservation &&
        devis.reservation.status === "PAYEE" && (
          <Card className="border-purple-200 bg-purple-50/30 dark:bg-purple-950/20 dark:border-purple-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                Réservation payée et confirmée
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                    N° réservation
                  </span>
                  <p className="font-bold">#{devis.reservation.id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                    Date
                  </span>
                  <p>
                    {new Date(
                      devis.reservation.dateReservation
                    ).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                    Montant réglé
                  </span>
                  <p className="font-bold text-primary">
                    {formatCurrency(devis.reservation.montantFinal)}
                  </p>
                </div>
                {devis.reservation.paiement && (
                  <>
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                        Mode de paiement
                      </span>
                      <p>{devis.reservation.paiement.mode.nom}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                        Référence transaction
                      </span>
                      <p className="font-mono text-xs">
                        {devis.reservation.paiement.referenceTransaction}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <Link
                href={`/reservations/${devis.reservation.id}`}
                className={buttonVariants({ variant: "default", size: "sm" })}
              >
                <CalendarCheck className="w-4 h-4 mr-1.5" />
                Voir le détail de la réservation
              </Link>
            </CardContent>
          </Card>
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Votre Projet de Voyage</CardTitle>
            <CardDescription>Critères de la demande</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {devis.circuit && (
              <div>
                <span className="font-semibold block">
                  Circuit sélectionné :
                </span>
                <Link
                  href={`/circuits/${devis.circuit.slug}`}
                  className="text-primary hover:underline font-medium"
                >
                  {devis.circuit.titre}
                </Link>
              </div>
            )}

            <div>
              <span className="font-semibold block">Voyageurs :</span>
              <p>
                {devis.adultes} adulte(s)
                {devis.enfants > 0 ? `, ${devis.enfants} enfant(s)` : ""}
                {devis.ados > 0 ? `, ${devis.ados} ados` : ""}
              </p>
            </div>

            {(devis.dateDebutConfirmee || devis.dateFinConfirmee) ? (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                <span className="font-bold block text-xs uppercase tracking-wider">Dates confirmées par l&apos;agence :</span>
                <p className="font-semibold">
                  {devis.dateDebutConfirmee
                    ? new Date(devis.dateDebutConfirmee).toLocaleDateString("fr-FR")
                    : "?"}{" "}
                  au{" "}
                  {devis.dateFinConfirmee
                    ? new Date(devis.dateFinConfirmee).toLocaleDateString("fr-FR")
                    : "?"}
                </p>
              </div>
            ) : (devis.dateDebutSouhaitee || devis.dateFinSouhaitee) ? (
              <div>
                <span className="font-semibold block">Dates souhaitées :</span>
                <p>
                  {devis.dateDebutSouhaitee
                    ? new Date(devis.dateDebutSouhaitee).toLocaleDateString(
                        "fr-FR"
                      )
                    : "?"}{" "}
                  au{" "}
                  {devis.dateFinSouhaitee
                    ? new Date(devis.dateFinSouhaitee).toLocaleDateString(
                        "fr-FR"
                      )
                    : "?"}
                  {devis.dureeFlexible ? " (Dates flexibles)" : ""}
                </p>
              </div>
            ) : null}

            {devis.typeHebergement && (
              <div>
                <span className="font-semibold block">
                  Type d'hébergement :
                </span>
                <p className="capitalize">{devis.typeHebergement}</p>
              </div>
            )}

            {(devis.budgetMin || devis.budgetMax) && (
              <div>
                <span className="font-semibold block">Budget estimé :</span>
                <p>
                  {formatCurrency(devis.budgetMin)} -{" "}
                  {devis.budgetMax
                    ? formatCurrency(devis.budgetMax)
                    : "Illimité"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Remarques & Chiffrage</CardTitle>
            <CardDescription>Commentaires et tarification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="font-semibold block">
                Montant total proposé :
              </span>
              <p className="text-2xl font-bold text-primary mt-1">
                {devis.montantTotal
                  ? formatCurrency(devis.montantTotal)
                  : "En cours d'estimation"}
              </p>
            </div>

            {devis.commentaireClient && (
              <div className="bg-muted p-3 rounded-lg">
                <span className="font-semibold block text-xs text-muted-foreground uppercase mb-1">
                  Votre commentaire :
                </span>
                <p className="italic">
                  &ldquo;{devis.commentaireClient}&rdquo;
                </p>
              </div>
            )}

            {devis.commentaireConseiller ? (
              <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg">
                <span className="font-semibold block text-xs text-primary uppercase mb-1">
                  Message de votre conseiller :
                </span>
                <p>{devis.commentaireConseiller}</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs italic">
                Un conseiller étudie actuellement votre dossier et vous
                contactera très rapidement.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
