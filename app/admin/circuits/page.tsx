// app/admin/circuits/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteCircuit } from "@/app/admin/circuits/actions/delete-circuit.action";
import DeleteCircuitForm from "@/components/admin/circuits/DeleteCircuitForm";

export default async function AdminCircuitsPage() {
  const circuits = await prisma.circuit.findMany({
    include: {
      theme: true,
      region: true,
      images: { take: 1 },
      _count: {
        select: { etapes: true },
      },
    },
    orderBy: { titre: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">🌍 Circuits</h1>
          <p className="text-gray-500 text-sm">
            {circuits.length} circuit(s) au total
          </p>
        </div>
        <Button>
          <Link href="/admin/circuits/nouveau">➕ Ajouter un circuit</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des circuits</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Thème</TableHead>
                <TableHead>Région</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Étapes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {circuits.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-gray-500 py-8"
                  >
                    Aucun circuit trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                circuits.map((circuit) => (
                  <TableRow key={circuit.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {circuit.images[0] && (
                          <img
                            src={circuit.images[0].url}
                            alt=""
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        {circuit.titre}
                      </div>
                    </TableCell>
                    <TableCell>{circuit.theme?.nom || "-"}</TableCell>
                    <TableCell>{circuit.region?.nom || "-"}</TableCell>
                    <TableCell>{circuit.dureeJours} j</TableCell>
                    <TableCell>
                      {circuit.prixEstime
                        ? `${circuit.prixEstime.toString()} €`
                        : "-"}
                    </TableCell>
                    <TableCell>{circuit._count.etapes}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm">
                        <Link href={`/admin/circuits/${circuit.id}/edit`}>
                          Modifier
                        </Link>
                      </Button>
                      <DeleteCircuitForm circuitId={circuit.id} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
