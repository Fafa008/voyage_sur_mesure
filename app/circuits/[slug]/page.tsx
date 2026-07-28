import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

interface CircuitDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CircuitDetailPage({ params }: CircuitDetailPageProps) {
  const { slug } = await params;

  const circuit = await prisma.circuit.findUnique({
    where: { slug },
    include: {
      theme: true,
      region: true,
      images: true,
      etapes: {
        include: {
          hebergement: true,
          activites: true,
        },
        orderBy: { ordre: "asc" },
      },
    },
  });

  if (!circuit) {
    notFound();
  }

  return (
    <main className="max-w-5xl mx-auto py-10 px-4 space-y-8">
      {/* Bouton retour */}
      <Link href="/circuits" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        ← Retour aux circuits
      </Link>

      {/* En-tête du circuit */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {circuit.region && <Badge variant="default">{circuit.region.nom}</Badge>}
          {circuit.theme && <Badge variant="outline">{circuit.theme.nom}</Badge>}
          {circuit.dureeJours && <Badge variant="secondary">{circuit.dureeJours} jours</Badge>}
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight">{circuit.titre}</h1>
        <p className="text-lg text-muted-foreground">{circuit.description}</p>
      </div>

      {/* Galerie photos */}
      {circuit.images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl overflow-hidden shadow-md">
          {circuit.images.map((img, idx) => (
            <img
              key={img.id || idx}
              src={img.url}
              alt={img.legende || circuit.titre}
              className="w-full h-72 object-cover"
            />
          ))}
        </div>
      )}

      {/* Résumé & Bouton de Devis */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <span className="text-sm text-muted-foreground block">Prix indicatif par personne</span>
            <span className="text-3xl font-extrabold text-primary">
              {circuit.prixEstime ? `${circuit.prixEstime.toString()} €` : "Sur mesure"}
            </span>
          </div>
          <Link
            href={`/devis/nouveau?circuitId=${circuit.id}`}
            className={buttonVariants({ variant: "default", size: "lg" })}
          >
            ✈️ Demander un devis personnalisé
          </Link>
        </CardContent>
      </Card>

      {/* Programme des étapes */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">📍 Itinéraire & Étapes</h2>

        {circuit.etapes.length === 0 ? (
          <p className="text-muted-foreground">Le détail des étapes pour ce circuit est en cours de finalisation.</p>
        ) : (
          <div className="space-y-4">
            {circuit.etapes.map((etape) => (
              <Card key={etape.id}>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-xs font-bold">
                      {etape.ordre}
                    </span>
                    {etape.ville || `Étape ${etape.ordre}`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {etape.description && <p className="text-sm text-muted-foreground">{etape.description}</p>}

                  {/* Hébergement */}
                  {etape.hebergement && (
                    <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                      <span className="font-semibold block">🏨 Hébergement :</span>
                      <p>{etape.hebergement.nom} {etape.hebergement.etoiles ? `(${etape.hebergement.etoiles}★)` : ""}</p>
                    </div>
                  )}

                  {/* Activités */}
                  {etape.activites.length > 0 && (
                    <div className="space-y-1 text-sm">
                      <span className="font-semibold block">🎯 Activités au programme :</span>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
                        {etape.activites.map((act) => (
                          <li key={act.id}>
                            <span className="font-medium text-foreground">{act.nom}</span>
                            {act.description ? ` - ${act.description}` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
