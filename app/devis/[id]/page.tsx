import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { StatutDevis } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface DevisDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const statutColors: Record<StatutDevis, string> = {
  [StatutDevis.en_cours]: "bg-yellow-100 text-yellow-800 border-yellow-300",
  [StatutDevis.en_modification]: "bg-orange-100 text-orange-800 border-orange-300",
  [StatutDevis.valide]: "bg-blue-100 text-blue-800 border-blue-300",
  [StatutDevis.accepte]: "bg-green-100 text-green-800 border-green-300",
  [StatutDevis.reserve]: "bg-purple-100 text-purple-800 border-purple-300",
  [StatutDevis.refuse]: "bg-red-100 text-red-800 border-red-300",
};

export default async function DevisDetailPage({ params }: DevisDetailPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const devisId = parseInt(id, 10);
  if (isNaN(devisId)) {
    notFound();
  }

  const devis = await prisma.devis.findUnique({
    where: { id: devisId },
    include: {
      circuit: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!devis) {
    notFound();
  }

  // Vérification d'autorisation (le créateur du devis ou un conseiller/admin)
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  const isOwner = devis.userId === session.user.id;
  const isStaff = dbUser?.role?.nom === "admin" || dbUser?.role?.nom === "conseiller";

  if (!isOwner && !isStaff) {
    redirect("/dashboard");
  }

  return (
    <main className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        ← Retour au tableau de bord
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">📋 Demande de Devis #{devis.id}</h1>
          <p className="text-sm text-muted-foreground">
            Demandé le {new Date(devis.dateDemande).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <Badge className={`text-sm px-3 py-1 border ${statutColors[devis.statut]}`}>
          {devis.statut.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Détails du projet de voyage */}
        <Card>
          <CardHeader>
            <CardTitle>✈️ Votre Projet de Voyage</CardTitle>
            <CardDescription>Critères de la demande</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {devis.circuit && (
              <div>
                <span className="font-semibold block">Circuit sélectionné :</span>
                <Link href={`/circuits/${devis.circuit.slug}`} className="text-primary hover:underline font-medium">
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

            {(devis.dateDebutSouhaitee || devis.dateFinSouhaitee) && (
              <div>
                <span className="font-semibold block">Dates souhaitées :</span>
                <p>
                  {devis.dateDebutSouhaitee ? new Date(devis.dateDebutSouhaitee).toLocaleDateString("fr-FR") : "?"} au{" "}
                  {devis.dateFinSouhaitee ? new Date(devis.dateFinSouhaitee).toLocaleDateString("fr-FR") : "?"}
                  {devis.dureeFlexible ? " (Dates flexibles)" : ""}
                </p>
              </div>
            )}

            {devis.typeHebergement && (
              <div>
                <span className="font-semibold block">Type d'hébergement :</span>
                <p className="capitalize">{devis.typeHebergement}</p>
              </div>
            )}

            {(devis.budgetMin || devis.budgetMax) && (
              <div>
                <span className="font-semibold block">Budget estimé :</span>
                <p>
                  {devis.budgetMin ? `${devis.budgetMin} €` : "0 €"} - {devis.budgetMax ? `${devis.budgetMax} €` : "Illimité"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Remarques & Réponse Conseiller */}
        <Card>
          <CardHeader>
            <CardTitle>💬 Remarques & Chiffrage</CardTitle>
            <CardDescription>Commentaires et tarification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="font-semibold block">Montant total proposé :</span>
              <p className="text-2xl font-bold text-primary mt-1">
                {devis.montantTotal ? `${devis.montantTotal.toString()} €` : "En cours d'estimation"}
              </p>
            </div>

            {devis.commentaireClient && (
              <div className="bg-muted p-3 rounded-lg">
                <span className="font-semibold block text-xs text-muted-foreground uppercase mb-1">
                  Votre commentaire :
                </span>
                <p className="italic">"{devis.commentaireClient}"</p>
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
                Un conseiller étudie actuellement votre dossier et vous contactera très rapidement.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
