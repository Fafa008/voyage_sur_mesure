// app/page.tsx
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const circuits = await prisma.circuit.findMany({
    take: 5,
    include: {
      theme: true,
      region: true,
      images: { take: 1 },
      etapes: {
        include: { hebergement: true },
      },
    },
  });

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">🌍 Liste des Circuits</h1>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(circuits, null, 2)}
      </pre>
    </main>
  );
}
