// components/landing/CircuitsPreview.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CircuitsPreview() {
  const circuits = await prisma.circuit.findMany({
    take: 3,
    include: {
      region: true,
      theme: true,
      images: { take: 1 },
    },
    orderBy: { id: "asc" },
  });

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Circuits à la une</h2>
          <Link href="/circuits" className="text-blue-600 hover:underline">
            Voir tous →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {circuits.map((circuit) => (
            <div
              key={circuit.id}
              className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
            >
              <img
                src={circuit.images[0]?.url || "/placeholder.jpg"}
                alt={circuit.titre}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold">{circuit.titre}</h3>
                <p className="text-sm text-gray-600">
                  {circuit.region?.nom} • {circuit.theme?.nom}
                </p>
                <p className="text-sm mt-2 line-clamp-2">
                  {circuit.description}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <span className="font-bold text-lg">
                    {circuit.prixEstime?.toString()} €
                  </span>
                  <Link
                    href={`/circuits/${circuit.slug}`}
                    className="text-blue-600 hover:underline"
                  >
                    Voir
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
