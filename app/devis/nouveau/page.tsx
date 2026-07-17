// app/devis/nouveau/page.tsx
import { prisma } from "@/lib/prisma";
import { createDevis } from "@/app/actions/devis/create-devis.action";
import Link from "next/link";

// On récupère circuitId depuis l'URL (ex: ?circuitId=1)
interface Props {
  searchParams: Promise<{ circuitId?: string }>;
}

export default async function NouveauDevisPage({ searchParams }: Props) {
  const { circuitId: preselectedCircuitId } = await searchParams;

  // Récupérer tous les circuits pour le select
  const circuits = await prisma.circuit.findMany({
    select: { id: true, titre: true },
    orderBy: { titre: "asc" },
  });

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">
        📋 Demander un devis personnalisé
      </h1>

      <form action={createDevis} className="space-y-4">
        {/* Circuit */}
        <div>
          <label htmlFor="circuitId" className="block text-sm font-medium mb-1">
            Circuit (optionnel)
          </label>
          <select
            id="circuitId"
            name="circuitId"
            defaultValue={preselectedCircuitId || ""}
            className="w-full p-2 border rounded bg-white"
          >
            <option value="">-- Sans circuit spécifique --</option>
            {circuits.map((c) => (
              <option key={c.id} value={c.id}>
                {c.titre}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Vous pouvez aussi laisser vide pour une demande 100% personnalisée.
          </p>
        </div>

        {/* Nombre de personnes */}
        <div>
          <label
            htmlFor="nombrePersonnes"
            className="block text-sm font-medium mb-1"
          >
            Nombre de personnes *
          </label>
          <input
            type="number"
            id="nombrePersonnes"
            name="nombrePersonnes"
            min="1"
            defaultValue="2"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Dates (optionnelles) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="dateDebut"
              className="block text-sm font-medium mb-1"
            >
              Date de début (approx.)
            </label>
            <input
              type="date"
              id="dateDebut"
              name="dateDebut"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="dateFin" className="block text-sm font-medium mb-1">
              Date de fin (approx.)
            </label>
            <input
              type="date"
              id="dateFin"
              name="dateFin"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Commentaire */}
        <div>
          <label
            htmlFor="commentaire"
            className="block text-sm font-medium mb-1"
          >
            Vos envies / contraintes (optionnel)
          </label>
          <textarea
            id="commentaire"
            name="commentaire"
            rows={4}
            className="w-full p-2 border rounded"
            placeholder="Ex: Hébergement de charme, activités sportives, budget max..."
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Envoyer ma demande
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-2">
          * En soumettant ce formulaire, vous acceptez que notre équipe vous
          recontacte.
        </p>
      </form>
    </main>
  );
}
