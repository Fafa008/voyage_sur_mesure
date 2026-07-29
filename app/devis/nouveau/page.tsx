// app/devis/nouveau/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { DevisWizard } from "@/components/devis/wizard/DevisWizard";

interface Props {
  searchParams: Promise<{ circuitId?: string }>;
}

export default async function NouveauDevisPage({ searchParams }: Props) {
  const { circuitId: preselectedCircuitId } = await searchParams;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

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

  const user = session
    ? {
        id: session.user.id,
        name: session.user.name || "",
        email: session.user.email,
      }
    : null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DevisWizard
          user={user}
          circuits={circuits}
          themes={themes}
          regions={regions}
          preselectedCircuitId={preselectedCircuitId}
        />
      </div>
    </main>
  );
}
