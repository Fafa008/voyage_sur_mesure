// app/devis/nouveau/page.tsx (version complète)
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DevisForm } from "@/components/devis/DevisForm";
import { createDevis } from "@/app/actions/devis/create-devis.action";

interface Props {
  searchParams: Promise<{ circuitId?: string }>;
}

export default async function NouveauDevisPage({ searchParams }: Props) {
  const { circuitId: preselectedCircuitId } = await searchParams;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [circuits, themes, regions] = await Promise.all([
    prisma.circuit.findMany({
      select: { id: true, titre: true },
      orderBy: { titre: "asc" },
    }),
    prisma.theme.findMany({
      select: { id: true, nom: true },
      orderBy: { nom: "asc" },
    }),
    prisma.region.findMany({
      select: { id: true, nom: true },
      orderBy: { nom: "asc" },
    }),
  ]);

  const user = {
    name: session.user.name,
    email: session.user.email,
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">
        ✈️ Demander un devis personnalisé
      </h1>
      <p className="text-gray-600 mb-8">
        Remplissez ce formulaire pour que notre équipe puisse vous proposer un
        voyage sur mesure.
      </p>

      <DevisForm
        user={user}
        circuits={circuits}
        themes={themes}
        regions={regions}
        preselectedCircuitId={preselectedCircuitId}
      />
    </main>
  );
}
