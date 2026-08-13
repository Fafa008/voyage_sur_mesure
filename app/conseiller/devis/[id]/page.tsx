import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StatutDevis } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConseillerPricingForm } from "@/components/devis/ConseillerPricingForm";
import { formatCurrency } from "@/lib/format";
import { CalendarCheck } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

const statutColors = {
  [StatutDevis.en_cours]: "bg-yellow-100 text-yellow-800",
  [StatutDevis.en_modification]: "bg-orange-100 text-orange-800",
  [StatutDevis.valide]: "bg-blue-100 text-blue-800",
  [StatutDevis.accepte]: "bg-green-100 text-green-800",
  [StatutDevis.reserve]: "bg-purple-100 text-purple-800",
  [StatutDevis.refuse]: "bg-red-100 text-red-800",
};

export default async function ConseillerDevisDetailPage({ params }: Props) {
  const { id } = await params;
  const devisId = parseInt(id);

  const devis = await prisma.devis.findUnique({
    where: { id: devisId },
    include: {
      user: {
        select: {
          name: true,
          prenom: true,
          email: true,
          telephone: true,
        },
      },
      circuit: { select: { titre: true, slug: true } },
      reservation: {
        include: {
          paiement: { include: { mode: true } },
        },
      },
    },
  });

  if (!devis) notFound();

  const commentaire = devis.commentaireClient || "Aucun commentaire";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">Devis #{devis.id}</h1>
          <p className="text-muted-foreground">
            Demandé le {new Date(devis.dateDemande).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <Badge className={statutColors[devis.statut]}>
          {devis.statut.replace("_", " ")}
        </Badge>
      </div>

      {devis.reservation && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarCheck className="w-5 h-5" />
              Réservation #{devis.reservation.id}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              Statut :{" "}
              <strong className="capitalize">{devis.reservation.statut}</strong>
            </p>
            <p>
              Montant :{" "}
              <strong>{formatCurrency(devis.reservation.montantFinal)}</strong>
            </p>
            {devis.reservation.paiement && (
              <p>
                Paiement : {devis.reservation.paiement.mode.nom} —{" "}
                <span className="font-mono text-xs">
                  {devis.reservation.paiement.referenceTransaction}
                </span>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Nom</p>
              <p className="font-medium">
                {devis.user.prenom} {devis.user.name}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p>{devis.user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Téléphone</p>
              <p>{devis.user.telephone || "Non renseigné"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Circuit</p>
              <p>{devis.circuit?.titre || "Personnalisé"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Détails du voyage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Dates souhaitées</p>
                <p>
                  {devis.dateDebutSouhaitee
                    ? new Date(devis.dateDebutSouhaitee).toLocaleDateString(
                        "fr-FR",
                      )
                    : "Non renseigné"}{" "}
                  →{" "}
                  {devis.dateFinSouhaitee
                    ? new Date(devis.dateFinSouhaitee).toLocaleDateString(
                        "fr-FR",
                      )
                    : "Non renseigné"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Nombre de personnes</p>
                <p>{devis.nombrePersonnes}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Adultes</p>
                <p>{devis.adultes || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Enfants / Ados</p>
                <p>
                  {devis.enfants || 0} / {devis.ados || 0}
                </p>
              </div>
              {(devis.budgetMin || devis.budgetMax) && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Budget client</p>
                  <p>
                    {devis.budgetMin ? formatCurrency(devis.budgetMin) : "—"} →{" "}
                    {devis.budgetMax ? formatCurrency(devis.budgetMax) : "—"}
                  </p>
                </div>
              )}
              {devis.montantTotal && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Montant proposé</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(devis.montantTotal)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commentaire du client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap text-sm">
            {commentaire}
          </div>
        </CardContent>
      </Card>

      {devis.commentaireConseiller && (
        <Card>
          <CardHeader>
            <CardTitle>Votre message au client</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{devis.commentaireConseiller}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <ConseillerPricingForm
            devisId={devis.id}
            statut={devis.statut}
            defaultMontant={devis.montantTotal?.toString()}
            defaultCommentaire={devis.commentaireConseiller}
          />

          {devis.statut === StatutDevis.valide && (
            <p className="text-sm text-muted-foreground mt-4 pt-4 border-t">
              Devis validé — en attente de la réponse du client.
            </p>
          )}

          {devis.statut === StatutDevis.accepte && !devis.reservation && (
            <p className="text-sm text-amber-600 mt-4 pt-4 border-t">
              Devis accepté par le client — en attente du paiement.
            </p>
          )}

          <div className="mt-6">
            <Button variant="outline">
              <Link href="/conseiller/dashboard">← Retour</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
