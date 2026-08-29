import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Hotel,
  Target,
  MapPin,
  Calendar,
  Compass,
  Flag,
  Share2,
  MessageCircle,
  Star,
  X,
  Clock,
} from "lucide-react";
import { PriceDisplay } from "@/components/currency/PriceDisplay";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { FavoriteButton } from "@/components/favori/FavoriteButton";
import { getUserFavoriteCircuitIds } from "@/lib/favoris-utils";
import { CircuitMap } from "@/components/map/CircuitMap";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { Metadata } from "next";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// ---------- Requête mémoïsée ----------
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
  }),
);

// ---------- Circuits similaires ----------
const getSimilarCircuits = cache(
  async (regionId?: number, themeId?: number, excludeId?: number) => {
    if (!regionId && !themeId) return [];
    return prisma.circuit.findMany({
      where: {
        AND: [
          { deletedAt: null },
          { id: { not: excludeId } },
          {
            OR: [
              { regionId: regionId || undefined },
              { themeId: themeId || undefined },
            ],
          },
        ],
      },
      take: 3,
      select: {
        id: true,
        titre: true,
        slug: true,
        prixEstime: true,
        dureeJours: true,
        images: { take: 1, orderBy: { ordre: "asc" } },
        region: { select: { nom: true } },
      },
    });
  },
);

// ---------- ISR ----------
export const revalidate = 3600;

// ---------- Génération statique ----------
export async function generateStaticParams() {
  const circuits = await prisma.circuit.findMany({
    where: { deletedAt: null },
    select: { slug: true },
  });
  return circuits.map((circuit) => ({ slug: encodeURIComponent(circuit.slug) }));
}

// ---------- Métadonnées ----------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const circuit = await getCircuitBySlug(decodedSlug);

  if (!circuit) {
    return { title: "Circuit introuvable" };
  }

  const description =
    circuit.description ??
    `Découvrez le circuit ${circuit.titre}${circuit.region ? ` dans la région ${circuit.region.nom}` : ""}${circuit.dureeJours ? ` en ${circuit.dureeJours} jours` : ""}. Voyage sur mesure à Madagascar.`;

  return {
    title: `${circuit.titre} | Mon Voyage — Madagascar`,
    description,
    openGraph: {
      title: circuit.titre,
      description,
      images: circuit.images.length > 0 ? [circuit.images[0].url] : [],
      url: `/circuits/${circuit.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: circuit.titre,
      description,
      images: circuit.images.length > 0 ? [circuit.images[0].url] : [],
    },
  };
}

// ---------- Composant principal ----------
interface CircuitDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CircuitDetailPage({
  params,
}: CircuitDetailPageProps) {
  const { slug } = await params;
  
  // Decode URL-encoded slug (e.g., "Fianarantsoa%20Tamatave" -> "Fianarantsoa Tamatave")
  const decodedSlug = decodeURIComponent(slug);

  const circuit = await getCircuitBySlug(decodedSlug);
  if (!circuit) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const favoriteIds = await getUserFavoriteCircuitIds(session?.user.id);
  const isFavori = favoriteIds.has(circuit.id);

  const similarCircuits = await getSimilarCircuits(
    circuit.region?.id,
    circuit.theme?.id,
    circuit.id,
  );

  // Données mockées
  const practicalInfo = {
    meilleurePeriode: "Avril à novembre",
    difficulte: "Facile",
    type: "Découverte",
    duree: `${circuit.dureeJours} jours`,
  };

  const avis = [
    {
      id: 1,
      auteur: "Marie",
      note: 5,
      commentaire: "Circuit magnifique, organisation parfaite.",
      date: "2025-02-10",
    },
    {
      id: 2,
      auteur: "Jean",
      note: 4,
      commentaire: "Très belle expérience, quelques détails à améliorer.",
      date: "2025-01-22",
    },
  ];

  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://monvoyage.com"}/circuits/${encodeURIComponent(circuit.slug)}`;
  const shareText = `Découvrez le circuit "${circuit.titre}" sur Mon Voyage !`;

  return (
    <>
      {/* JSON‑LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: circuit.titre,
            description: circuit.description,
            image: circuit.images[0]?.url,
            offers: {
              "@type": "Offer",
              price: circuit.prixEstime,
              priceCurrency: "EUR",
              availability: "https://schema.org/InStock",
            },
            brand: {
              "@type": "Brand",
              name: "Mon Voyage",
            },
          }),
        }}
      />

      <main className="max-w-5xl mx-auto py-10 px-4 space-y-10">
        {/* Fil d'Ariane */}
        <nav className="text-sm text-muted-foreground flex items-center gap-2">
          <Link href="/" className="hover:text-foreground">
            Accueil
          </Link>
          <span>/</span>
          <Link href="/circuits" className="hover:text-foreground">
            Circuits
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{circuit.titre}</span>
        </nav>

        {/* En-tête */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {circuit.region && (
              <Badge variant="default">{circuit.region.nom}</Badge>
            )}
            {circuit.theme && (
              <Badge variant="outline">{circuit.theme.nom}</Badge>
            )}
            {circuit.dureeJours && (
              <Badge variant="secondary">{circuit.dureeJours} jours</Badge>
            )}
          </div>

          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {circuit.titre}
            </h1>
            <div className="flex items-center gap-2">
              <FavoriteButton
                circuitId={circuit.id}
                initialIsFavori={isFavori}
              />
              {/* Menu de partage standard */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-hidden focus:ring-2 focus:ring-ring/30"
                  aria-label="Partager ce circuit"
                >
                  <Share2 className="w-5 h-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full text-foreground hover:text-primary"
                    >
                      <X className="w-4 h-4" />
                      <span>X / Twitter</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full text-foreground hover:text-primary"
                    >
                      <Share2 className="w-4 h-4 text-blue-500" />
                      <span>Facebook</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full text-foreground hover:text-primary"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-500" />
                      <span>WhatsApp</span>
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
            {circuit.description}
          </p>
        </div>

        {/* Galerie */}
        {circuit.images.length > 0 && (
          <div className="relative rounded-xl overflow-hidden shadow-md">
            <Carousel className="w-full">
              <CarouselContent>
                {circuit.images.map((img, idx) => (
                  <CarouselItem key={img.id || idx}>
                    <div className="relative h-[400px] w-full">
                      <Image
                        src={img.url}
                        alt={img.legende || circuit.titre}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={idx === 0}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>
        )}

        {/* Résumé & Devis */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
            <div>
              <span className="text-sm text-muted-foreground block">
                Prix indicatif par personne
              </span>
              {circuit.prixEstime ? (
                <PriceDisplay
                  amount={circuit.prixEstime?.toString()}
                  fallback="Sur devis"
                  label="À partir de"
                  size="md"
                />
              ) : (
                <span className="text-2xl font-bold text-primary">Sur mesure</span>
              )}
            </div>
            <Link
              href={`/devis/nouveau?circuitId=${circuit.id}`}
              className={buttonVariants({ variant: "default", size: "lg" })}
            >
              <Send className="w-4 h-4 mr-2" />
              Demander un devis personnalisé
            </Link>
          </CardContent>
        </Card>

        {/* Pourquoi ce circuit */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Compass className="w-6 h-6 text-primary" />
            Pourquoi ce circuit ?
          </h2>
          <div className="bg-muted/30 p-6 rounded-xl text-foreground/90 leading-relaxed">
            <p>
              {circuit.description ||
                "Ce circuit vous fera découvrir les merveilles de Madagascar dans des conditions optimales. Conçu par des passionnés, il allie découverte, confort et authenticité."}
            </p>
          </div>
        </section>

        {/* Infos pratiques */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-4 bg-card rounded-lg shadow-sm border">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Meilleure période</p>
              <p className="font-medium">{practicalInfo.meilleurePeriode}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-card rounded-lg shadow-sm border">
            <Flag className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Difficulté</p>
              <p className="font-medium">{practicalInfo.difficulte}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-card rounded-lg shadow-sm border">
            <Target className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-medium">{practicalInfo.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-card rounded-lg shadow-sm border">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Durée</p>
              <p className="font-medium">{practicalInfo.duree}</p>
            </div>
          </div>
        </section>

        {/* Carte */}
        <section className="space-y-4 pt-2">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            Localisation du circuit
          </h2>
          <CircuitMap
            circuit={{
              id: circuit.id,
              titre: circuit.titre,
              description: circuit.description,
              region: circuit.region
                ? { id: circuit.region.id, nom: circuit.region.nom }
                : null,
              etapes: circuit.etapes.map((etape) => ({
                id: etape.id,
                ordre: etape.ordre,
                ville: etape.ville,
                description: etape.description,
                hebergement: etape.hebergement
                  ? {
                    id: etape.hebergement.id,
                    nom: etape.hebergement.nom,
                    type: etape.hebergement.type,
                    etoiles: etape.hebergement.etoiles,
                    adresse: etape.hebergement.adresse,
                  }
                  : null,
                activites: etape.activites.map((act) => ({
                  id: act.id,
                  nom: act.nom,
                  description: act.description,
                })),
              })),
            }}
          />
        </section>

        {/* Itinéraire */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            Itinéraire détaillé
          </h2>

          {circuit.etapes.length === 0 ? (
            <p className="text-muted-foreground">
              Le détail des étapes pour ce circuit est en cours de finalisation.
            </p>
          ) : (
            <Accordion type="multiple" className="space-y-3">
              {circuit.etapes.map((etape) => (
                <AccordionItem
                  key={etape.id}
                  value={`etape-${etape.id}`}
                  className="border rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 text-left">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
                        {etape.ordre}
                      </span>
                      <span className="font-semibold">
                        {etape.ville || `Étape ${etape.ordre}`}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                    {etape.description && (
                      <p className="text-sm text-muted-foreground">
                        {etape.description}
                      </p>
                    )}
                    {etape.hebergement && (
                      <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Hotel className="w-4 h-4 text-primary" /> Hébergement
                          :
                        </span>
                        <p>
                          {etape.hebergement.nom}{" "}
                          {etape.hebergement.etoiles
                            ? `(${etape.hebergement.etoiles}★)`
                            : ""}
                        </p>
                      </div>
                    )}
                    {etape.activites.length > 0 && (
                      <div className="space-y-1 text-sm">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-primary" /> Activités
                          au programme :
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
                          {etape.activites.map((act) => (
                            <li key={act.id}>
                              <span className="font-medium text-foreground">
                                {act.nom}
                              </span>
                              {act.description ? ` - ${act.description}` : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </section>

        {/* Avis */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Star className="w-6 h-6 text-primary fill-primary" />
            Avis de voyageurs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {avis.map((a) => (
              <Card key={a.id} className="shadow-sm">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{a.auteur}</span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < a.note ? "fill-amber-500" : "fill-muted"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {a.commentaire}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(a.date).toLocaleDateString("fr-FR")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Link
            href={`/circuits/${encodeURIComponent(circuit.slug)}/avis`}
            className="text-sm text-primary hover:underline"
          >
            Voir tous les avis →
          </Link>
        </section>

        {/* Similaires */}
        {similarCircuits.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Vous pourriez aussi aimer</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {similarCircuits.map((c) => (
                <Link href={`/circuits/${encodeURIComponent(c.slug)}`} key={c.id} className="group">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    <div className="relative h-48 w-full">
                      {c.images[0] ? (
                        <Image
                          src={c.images[0].url}
                          alt={c.titre}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                          Pas d'image
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-1">{c.titre}</h3>
                      {c.region && (
                        <p className="text-xs text-muted-foreground">
                          {c.region.nom}
                        </p>
                      )}
                      <div className="flex items-baseline gap-0.5 text-sm font-bold mt-1">
                        <PriceDisplay
                          amount={c.prixEstime?.toString()}
                          fallback="Sur devis"
                          size="sm"
                          priceClassName="text-sm font-bold"
                        />
                        <span className="text-xs font-normal text-muted-foreground">
                          /pers.
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
