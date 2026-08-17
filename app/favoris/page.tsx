import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RemoveFavoriButton } from "@/components/favori/RemoveFavoriButton";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

export default async function FavorisPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const favoris = await prisma.favori.findMany({
    where: { userId: session.user.id },
    include: {
      circuit: {
        select: {
          id: true,
          titre: true,
          slug: true,
          prixEstime: true,
          dureeJours: true,
          region: { select: { nom: true } },
          images: { take: 1 },
        },
      },
    },
    orderBy: { dateAjout: "desc" },
  });

  return (
    <main className="max-w-7xl mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Mes Circuits Favoris</h1>
        <p className="text-muted-foreground mt-1">
          Retrouvez les circuits que vous avez sauvegardés pour votre futur
          voyage.
        </p>
      </div>

      {favoris.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Vous n&apos;avez pas encore de circuits favoris.
            </p>
            <Link
              href="/circuits"
              className={buttonVariants({ variant: "default" })}
            >
              Découvrir les circuits
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoris.map((fav) => {
            const { circuit } = fav;
            return (
              <Card
                key={fav.id}
                className="overflow-hidden flex flex-col justify-between hover:shadow-lg transition"
              >
                <div>
                  <div className="h-48 bg-muted relative overflow-hidden">
                    {circuit.images[0] ? (
                      <img
                        src={circuit.images[0].url}
                        alt={circuit.titre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Pas d'image
                      </div>
                    )}
                    {circuit.region && (
                      <Badge className="absolute top-3 left-3 bg-black/70 text-white">
                        {circuit.region.nom}
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{circuit.titre}</CardTitle>
                    <CardDescription>
                      {circuit.dureeJours
                        ? `${circuit.dureeJours} jours`
                        : "Durée flexible"}
                    </CardDescription>
                  </CardHeader>
                </div>
                <div className="p-6 pt-0 flex items-center justify-between mt-4 border-t pt-4 gap-3">
                  <span className="text-lg font-bold text-primary">
                    {circuit.prixEstime
                      ? formatCurrency(circuit.prixEstime)
                      : "Sur devis"}
                  </span>
                  <div className="flex items-center gap-2">
                    <RemoveFavoriButton circuitId={circuit.id} />
                    <Link
                      href={`/circuits/${circuit.slug}`}
                      className={buttonVariants({ variant: "default" })}
                    >
                      Voir le circuit
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
