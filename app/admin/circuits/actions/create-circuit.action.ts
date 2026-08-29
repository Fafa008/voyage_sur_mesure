// actions/admin/circuits/create-circuit.action.ts
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { CurrencyService, CurrencyCode } from '@/lib/services/currency.service';

// Schéma pour la création
const createCircuitSchema = z.object({
  titre: z.string().min(1, 'Titre requis'),
  slug: z.string().min(1, 'Slug requis'),
  description: z.string().optional(),
  dureeJours: z.number().int().min(1, 'Durée minimale 1 jour'),
  prixEstime: z.number().min(0, 'Prix invalide'),
  nbPlacesDisponibles: z.number().int().min(0).default(0),
  dateDebut: z.string().optional(),
  dateFin: z.string().optional(),
  estGroupe: z.boolean().default(false),
  themeId: z.number().optional(),
  regionId: z.number().optional(),

  // Lieu de départ
  lieuDepartNom: z.string().optional(),
  lieuDepartLat: z.number().min(-90).max(90).optional(),
  lieuDepartLng: z.number().min(-180).max(180).optional(),

  // Lieu d'arrivée
  lieuArriveeNom: z.string().optional(),
  lieuArriveeLat: z.number().min(-90).max(90).optional(),
  lieuArriveeLng: z.number().min(-180).max(180).optional(),

  // Relations
  etapes: z.array(
    z.object({
      ordre: z.number().int().min(1),
      ville: z.string().optional(),
      description: z.string().optional(),
      hebergement: z.object({
        nom: z.string().min(1, 'Nom hébergement requis'),
        type: z.string().optional(),
        etoiles: z.number().int().min(0).max(5).optional(),
        adresse: z.string().optional(),
      }),
      activites: z.array(
        z.object({
          nom: z.string().min(1, 'Nom activité requis'),
          description: z.string().optional(),
          duree: z.number().int().min(0).optional(),
          prix: z.number().min(0).optional(),
        })
      ),
    })
  ),
  images: z.array(
    z.object({
      url: z.string().min(1, 'URL requise'),
      legende: z.string().nullable().optional(),
      ordre: z.number().int().min(0).default(0),
    })
  ),
}).refine(
  (data) => {
    // Validation: dateFin >= dateDebut
    if (data.dateDebut && data.dateFin) {
      return new Date(data.dateFin) >= new Date(data.dateDebut);
    }
    return true;
  },
  { message: 'La date de retour doit être postérieure ou égale à la date de départ', path: ['dateFin'] }
).refine(
  (data) => {
    // Si lat fourni, lng doit l'être aussi (et vice-versa)
    const hasLat = data.lieuDepartLat !== undefined;
    const hasLng = data.lieuDepartLng !== undefined;
    return hasLat === hasLng;
  },
  { message: 'Latitude et longitude du départ doivent être fournies ensemble', path: ['lieuDepartLat'] }
).refine(
  (data) => {
    const hasLat = data.lieuArriveeLat !== undefined;
    const hasLng = data.lieuArriveeLng !== undefined;
    return hasLat === hasLng;
  },
  { message: 'Latitude et longitude de l\'arrivée doivent être fournies ensemble', path: ['lieuArriveeLat'] }
);

/** Parse une valeur numérique optionnelle depuis FormData */
function parseOptionalFloat(formData: FormData, key: string): number | undefined {
  const raw = formData.get(key)?.toString()?.trim();
  if (!raw || raw === '') return undefined;
  const val = parseFloat(raw);
  return isNaN(val) ? undefined : val;
}

export async function createCircuit(formData: FormData) {
  // 1. Vérifier l'authentification et le rôle admin
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error('Non authentifié');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  if (!user?.role || user.role.nom !== 'admin') {
    throw new Error('Accès refusé');
  }

  // 2. Extraire et valider les données
  const rawData = {
    titre: formData.get('titre')?.toString() || '',
    slug: formData.get('slug')?.toString() || '',
    description: formData.get('description')?.toString() || undefined,
    dureeJours: parseInt(formData.get('dureeJours')?.toString() || '0'),
    prixEstime: parseFloat(formData.get('prixEstime')?.toString() || '0'),
    prixEstimeCurrency: (formData.get('prixEstimeCurrency')?.toString() || 'EUR') as CurrencyCode,
    nbPlacesDisponibles: parseInt(formData.get('nbPlacesDisponibles')?.toString() || '0'),
    dateDebut: formData.get('dateDebut')?.toString() || undefined,
    dateFin: formData.get('dateFin')?.toString() || undefined,
    estGroupe: formData.get('estGroupe') === 'true',
    themeId: formData.get('themeId') ? parseInt(formData.get('themeId') as string) : undefined,
    regionId: formData.get('regionId') ? parseInt(formData.get('regionId') as string) : undefined,

    // Lieux géographiques
    lieuDepartNom: formData.get('lieuDepartNom')?.toString()?.trim() || undefined,
    lieuDepartLat: parseOptionalFloat(formData, 'lieuDepartLat'),
    lieuDepartLng: parseOptionalFloat(formData, 'lieuDepartLng'),
    lieuArriveeNom: formData.get('lieuArriveeNom')?.toString()?.trim() || undefined,
    lieuArriveeLat: parseOptionalFloat(formData, 'lieuArriveeLat'),
    lieuArriveeLng: parseOptionalFloat(formData, 'lieuArriveeLng'),

    etapes: (() => {
      try {
        const raw = formData.get('etapes') as string;
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })(),
    images: (() => {
      try {
        const raw = formData.get('images') as string;
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })(),
  };

  const parsed = createCircuitSchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues?.[0]?.message || 'Erreur de validation');
  }

  const data = parsed.data;

  // Convert price from selected currency to MGA for database storage
  let prixEstimeMGA = data.prixEstime;
  if (rawData.prixEstimeCurrency && rawData.prixEstimeCurrency !== 'MGA') {
    // Convert from selected currency to MGA
    // If user entered 800 EUR, we need to convert to MGA
    // 1 EUR = 4900 MGA, so 800 EUR = 800 * 4900 = 3,920,000 MGA
    const rate = CurrencyService.getRate(rawData.prixEstimeCurrency, 'MGA');
    prixEstimeMGA = data.prixEstime * rate;
  }

  // 3. Création du circuit avec toutes les relations
  try {
    await prisma.circuit.create({
      data: {
        titre: data.titre,
        slug: data.slug,
        description: data.description || null,
        dureeJours: data.dureeJours,
        prixEstime: prixEstimeMGA,
        nbPlacesDisponibles: data.nbPlacesDisponibles,
        dateDebut: data.dateDebut && data.dateDebut.trim() !== "" ? new Date(data.dateDebut) : null,
        dateFin: data.dateFin && data.dateFin.trim() !== "" ? new Date(data.dateFin) : null,
        estGroupe: data.estGroupe,
        themeId: data.themeId ?? null,
        regionId: data.regionId ?? null,

        // Lieux géographiques
        lieuDepartNom: data.lieuDepartNom || null,
        lieuDepartLat: data.lieuDepartLat ?? null,
        lieuDepartLng: data.lieuDepartLng ?? null,
        lieuArriveeNom: data.lieuArriveeNom || null,
        lieuArriveeLat: data.lieuArriveeLat ?? null,
        lieuArriveeLng: data.lieuArriveeLng ?? null,

        images: {
          create: data.images.map((img, index) => ({
            url: img.url,
            legende: img.legende || null,
            ordre: img.ordre ?? index,
          })),
        },
        etapes: {
          create: data.etapes.map((etape) => ({
            ordre: etape.ordre,
            ville: etape.ville || null,
            description: etape.description || null,
            hebergement: {
              create: {
                nom: etape.hebergement.nom,
                type: etape.hebergement.type || null,
                etoiles: etape.hebergement.etoiles || null,
                adresse: etape.hebergement.adresse || null,
              },
            },
            activites: {
              create: (etape.activites || []).map((act) => ({
                nom: act.nom,
                description: act.description || null,
                duree: act.duree || null,
                prix: act.prix || null,
              })),
            },
          })),
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new Error('Un circuit avec ce slug existe déjà. Choisissez un slug unique.');
    }

    throw error;
  }

  revalidatePath('/admin/circuits');
  redirect('/admin/circuits');
}