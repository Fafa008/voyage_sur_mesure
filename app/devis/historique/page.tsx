// app/devis/historique/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

export default async function HistoriqueDevisPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div className="p-8 text-center">Veuillez vous connecter.</div>;
  }

  const devisList = await prisma.devis.findMany({
    where: { userId: session.user.id },
    include: {
      circuit: { select: { titre: true } },
    },
    orderBy: { dateDemande: "desc" },
  });

  if (devisList.length === 0) {
    return (
      <main className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">📋 Mes devis</h1>
        <p className="text-gray-500">Aucune demande pour le moment.</p>
        <Link href="/devis/nouveau" className="text-blue-600 hover:underline">
          Créer ma première demande
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">📋 Mes devis</h1>
      <div className="space-y-4">
        {devisList.map((devis) => (
          <div
            key={devis.id}
            className="border p-4 rounded shadow-sm flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {devis.circuit?.titre || "Demande personnalisée"}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(devis.dateDemande).toLocaleDateString("fr-FR")} •{" "}
                {devis.nombrePersonnes} pers.
              </p>
              <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                {devis.statut}
              </span>
            </div>
            <Link
              href={`/devis/${devis.id}`}
              className="text-blue-600 hover:underline text-sm"
            >
              Voir le détail →
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
