import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { FavoriteButton } from "@/components/favori/FavoriteButton";
import { getUserFavoriteCircuitIds } from "@/lib/favoris-utils";
import type { Metadata } from "next";

/**
 * Mémoïsation au niveau de la requête (React Request Cache).
 * generateMetadata et la page appellent tous les deux cette fonction :
 * la DB n'est interrogée qu'UNE seule fois par rendu.
 */
const getCircuitBySlug = cache(async (slug: string) =>
  prisma.circuit.findUnique({
    where: { slug },
    include: {
      theme: true,
      region: true,
      images: true,
      etapes: {
        include: { hebergement: true, activites: true },
        orderBy: { ordre: "asc" },
      },
    },
  })
);

// Revalidation ISR : les pages de circuit sont régénérées toutes les heures
export const revalidate = 3600;

// Pré-génération statique de toutes les pages de circuits au build
export async function generateStaticParams() {
  const circuits = await prisma.circuit.findMany({
    select: { slug: true },
  });
  return circuits.map((circuit) => ({ slug: circuit.slug }));
}

// Metadata dynamique pour le SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Réutilise le cache — pas de requête DB supplémentaire
  const circuit = await getCircuitBySlug(slug);

  if (!circuit) {
    return { title: "Circuit introuvable | Mon Voyage" };
  }

  return {
    title: `${circuit.titre} | Mon Voyage — Voyages Sur Mesure à Madagascar`,
    description:
      circuit.description ??
      `Découvrez le circuit ${circuit.titre}${circuit.region ? ` dans la région ${circuit.region.nom}` : ""}${circuit.dureeJours ? ` en ${circuit.dureeJours} jours` : ""}. Voyage sur mesure à Madagascar.`,
  };
}

interface CircuitDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CircuitDetailPage({ params }: CircuitDetailPageProps) {
  const { slug } = await params;

  // Pas de nouvelle requête DB : récupère le résultat depuis le cache de generateMetadata
  const circuit = await getCircuitBySlug(slug);

  if (!circuit) {
    notFound();
  }

  const session = await auth.api.getSession({ headers: await headers() });
  const favoriteIds = await getUserFavoriteCircuitIds(session?.user.id);
  const isFavori = favoriteIds.has(circuit.id);

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

        <div className="flex items-start justify-between gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight">{circuit.titre}</h1>
          <FavoriteButton circuitId={circuit.id} initialIsFavori={isFavori} />
        </div>
        <p className="text-lg text-muted-foreground">{circuit.description}</p>
      </div>

      {/* Galerie photos */}
      {circuit.images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl overflow-hidden shadow-md">
          {circuit.images.map((img, idx) => (
            <div key={img.id || idx} className="relative h-72 w-full overflow-hidden">
              <Image
                src={img.url}
                alt={img.legende || circuit.titre}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={idx === 0}
              />
            </div>
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
        <h2 className="text-2xl font-bold">📍 Itinéraire &amp; Étapes</h2>

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
                      <p>
                        {etape.hebergement.nom}{" "}
                        {etape.hebergement.etoiles ? `(${etape.hebergement.etoiles}★)` : ""}
                      </p>
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
