import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approveAvis } from "@/app/admin/avis/actions/moderate-avis.action";
import DeleteAvisForm from "@/components/admin/avis/DeleteAvisForm";
import { Star } from "lucide-react";

function StarRating({ note }: { note: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < note
              ? "text-amber-500 fill-amber-500"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">({note}/5)</span>
    </span>
  );
}

export default async function AdminAvisPage() {
  const [avisList, pendingCount] = await Promise.all([
    prisma.avis.findMany({
      include: {
        user: {
          select: { name: true, prenom: true, email: true },
        },
        circuit: {
          select: { titre: true, slug: true },
        },
      },
      orderBy: [{ estModere: "asc" }, { dateAvis: "desc" }],
    }),
    prisma.avis.count({ where: { estModere: false } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">⭐ Modération des avis</h1>
        <p className="text-muted-foreground text-sm">
          {avisList.length} avis au total
          {pendingCount > 0 && (
            <Badge variant="outline" className="ml-2 bg-amber-500/10 text-amber-600 border-amber-500/20">
              {pendingCount} en attente
            </Badge>
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tous les avis clients</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Circuit</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Commentaire</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {avisList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    Aucun avis à modérer pour le moment.
                  </TableCell>
                </TableRow>
              ) : (
                avisList.map((avis) => (
                  <TableRow key={avis.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/circuits/${avis.circuit.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {avis.circuit.titre}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {avis.user.prenom ? `${avis.user.prenom} ` : ""}
                        {avis.user.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {avis.user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StarRating note={avis.note} />
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {avis.commentaire ?? "—"}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(avis.dateAvis).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      {avis.estModere ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        >
                          Approuvé
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-600 border-amber-500/20"
                        >
                          En attente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {!avis.estModere && (
                        <form action={approveAvis} className="inline">
                          <input type="hidden" name="avisId" value={avis.id} />
                          <Button type="submit" variant="default" size="sm">
                            Approuver
                          </Button>
                        </form>
                      )}
                      <DeleteAvisForm avisId={avis.id} />
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
