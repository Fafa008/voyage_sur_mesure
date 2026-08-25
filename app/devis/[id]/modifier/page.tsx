import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { StatutDevis } from "@prisma/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DevisWizard } from "@/components/devis/wizard/DevisWizard";
import { FilePenLine } from "lucide-react";

interface ModifierDevisPageProps {
  params: Promise<{ id: string }>;
}

function toDateInput(value?: Date | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default async function ModifierDevisPage({
  params,
}: ModifierDevisPageProps) {
  // 1. Session obligatoire
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await params;
  const devisId = parseInt(id, 10);
  if (isNaN(devisId)) notFound();

  // 2. Ownership vérifié côté serveur
  const devis = await prisma.devis.findUnique({
    where: { id: devisId },
    include: { user: { select: { id: true } } },
  });
  if (!devis) notFound();
  if (devis.userId !== session.user.id) redirect(`/devis/${devisId}`);

  // 3. La modification n'est possible QUE sur demande du conseiller
  if (devis.statut !== StatutDevis.en_modification) {
    redirect(`/devis/${devisId}`);
  }

  const [circuits, themes, regions] = await Promise.all([
    prisma.circuit.findMany({
      where: { deletedAt: null },
      select: { id: true, titre: true },
      orderBy: { titre: "asc" },
    }),
    prisma.theme.findMany({ orderBy: { nom: "asc" }, select: { id: true, nom: true } }),
    prisma.region.findMany({ orderBy: { nom: "asc" }, select: { id: true, nom: true } }),
  ]);

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true, prenom: true, telephone: true },
  });

  return (
    <main className="min-h-screen bg-background">
      {/* Rappel de la demande du conseiller */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link
          href={`/devis/${devisId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Retour au devis #{devis.id}
        </Link>

        <Card className="mt-4 border-orange-300 bg-orange-50/60 dark:bg-orange-950/20 dark:border-orange-900">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <FilePenLine className="w-4 h-4" />
              Modification demandée par votre conseiller — Devis #{devis.id}
            </CardTitle>
            <CardDescription className="text-orange-800/90 dark:text-orange-200/80 font-medium">
              {devis.commentaireConseiller ??
                "Merci de vérifier et corriger les informations de votre demande."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Vous seul pouvez modifier les informations de votre devis. Après renvoi, il sera à nouveau analysé par votre conseiller.
          </CardContent>
        </Card>
      </div>

      <DevisWizard
        user={
          dbUser
            ? {
                email: dbUser.email,
                prenom: dbUser.prenom,
                name: dbUser.name,
                telephone: dbUser.telephone,
              }
            : null
        }
        circuits={circuits.map((c) => ({ id: c.id, titre: c.titre }))}
        themes={themes}
        regions={regions}
        initialData={{
          prenom: devis.prenom || "",
          nom: devis.nom || "",
          email: session.user.email ?? "",
          telephone: devis.telephone || "",
          circuitId: String(devis.circuitId),
          typeVoyage: devis.typeVoyage ?? [],
          themeIds: (devis.themeIds ?? []).map(String),
          regionIds: (devis.regionIds ?? []).map(String),
          dateDebut: toDateInput(devis.dateDebutSouhaitee),
          dateFin: toDateInput(devis.dateFinSouhaitee),
          dureeFlexible: devis.dureeFlexible ?? false,
          adultes: devis.adultes,
          enfants: devis.enfants,
          ados: devis.ados,
          enfantsAge: devis.enfantsAge || "",
          typeHebergement: devis.typeHebergement || "",
          regime: devis.regime || "",
          regimePrecision: devis.regimePrecision || "",
          activites: devis.activites ?? [],
          transport: devis.transport ?? [],
          budgetMin: devis.budgetMin ? Number(devis.budgetMin) : 0,
          budgetMax: devis.budgetMax ? Number(devis.budgetMax) : 0,
          commentaire: devis.commentaireClient || "",
          source: devis.source || "",
          newsletter: devis.newsletter ?? false,
        }}
        devisId={devis.id}
      />
    </main>
  );
}
