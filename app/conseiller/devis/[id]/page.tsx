// app/conseiller/devis/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { StatutDevis } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { updateDevisStatus } from "@/app/actions/devis/update-devis-status.action";

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
      circuit: {
        select: {
          titre: true,
          slug: true,
        },
      },
    },
  });

  if (!devis) {
    notFound();
  }

  const commentaire = devis.commentaireClient || "Aucun commentaire";

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">Devis #{devis.id}</h1>
          <p className="text-gray-500">
            Demandé le {new Date(devis.dateDemande).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <Badge className={statutColors[devis.statut]}>
          {devis.statut.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Informations client */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>👤 Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">Nom</p>
              <p className="font-medium">
                {devis.user.prenom} {devis.user.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-sm">{devis.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Téléphone</p>
              <p className="text-sm">
                {devis.user.telephone || "Non renseigné"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Circuit</p>
              <p className="text-sm">
                {devis.circuit?.titre || "Personnalisé"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Détails du voyage */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>✈️ Détails du voyage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Dates souhaitées</p>
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
                <p className="text-sm text-gray-500">Nombre de personnes</p>
                <p>{devis.nombrePersonnes}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Adultes</p>
                <p>{devis.adultes || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Enfants / Ados</p>
                <p>
                  {devis.enfants || 0} / {devis.ados || 0}
                </p>
              </div>
              {devis.budgetMin || devis.budgetMax ? (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Budget</p>
                  <p>
                    {devis.budgetMin ? `${devis.budgetMin} €` : "—"} →{" "}
                    {devis.budgetMax ? `${devis.budgetMax} €` : "—"}
                  </p>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commentaire */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Commentaire du client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm">
            {commentaire}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 pt-4 border-t">
        {devis.statut === StatutDevis.en_cours && (
          <form action={updateDevisStatus}>
            <input type="hidden" name="devisId" value={devis.id} />
            <input type="hidden" name="statut" value={StatutDevis.valide} />
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              ✅ Valider ce devis
            </Button>
          </form>
        )}

        {devis.statut === StatutDevis.en_modification && (
          <form action={updateDevisStatus}>
            <input type="hidden" name="devisId" value={devis.id} />
            <input type="hidden" name="statut" value={StatutDevis.valide} />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              🔄 Proposer une nouvelle version
            </Button>
          </form>
        )}

        {devis.statut === StatutDevis.valide && (
          <span className="text-sm text-gray-500 self-center">
            ✅ Devis validé — en attente de la réponse du client
          </span>
        )}

        <Button variant="outline">
          <Link href="/conseiller/dashboard">← Retour</Link>
        </Button>
      </div>
    </div>
  );
}
