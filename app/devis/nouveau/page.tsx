// app/devis/nouveau/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DevisWizard } from "@/components/devis/wizard/DevisWizard";

interface Props {
  searchParams: Promise<{ circuitId?: string }>;
}

export default async function NouveauDevisPage({ searchParams }: Props) {
  const { circuitId: preselectedCircuitId } = await searchParams;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

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
    id: session.user.id,
    name: session.user.name || "",
    email: session.user.email,
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto">
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
