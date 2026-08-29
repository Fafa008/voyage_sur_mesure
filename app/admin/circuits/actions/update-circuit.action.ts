// actions/admin/circuits/update-circuit.action.ts
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { CurrencyService, CurrencyCode } from '@/lib/services/currency.service';

const updateCircuitSchema = z.object({
  id: z.number().int(),
  titre: z.string().min(1, 'Titre requis'),
  slug: z.string().min(1, 'Slug requis'),
  description: z.string().optional(),
  dureeJours: z.number().int().min(1),
  prixEstime: z.number().min(0),
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

export async function updateCircuit(formData: FormData) {
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
    id: parseInt(formData.get('id') as string),
    titre: formData.get('titre')?.toString() || '',
    slug: formData.get('slug')?.toString() || '',
    description: formData.get('description')?.toString() || undefined,
    dureeJours: parseInt(formData.get('dureeJours')?.toString() || '0'),
    prixEstime: parseFloat(formData.get('prixEstime')?.toString() || '0'),
    prixEstimeCurrency: (formData.get('prixEstimeCurrency')?.toString() || 'EUR') as CurrencyCode,
    nbPlacesDisponibles: parseInt(formData.get('nbPlacesDisponibles')?.toString() || '0'),
    dateDebut: (() => {
      const raw = formData.get('dateDebut')?.toString()?.trim();
      return raw && raw !== "" ? raw : undefined;
    })(),
    dateFin: (() => {
      const raw = formData.get('dateFin')?.toString()?.trim();
      return raw && raw !== "" ? raw : undefined;
    })(),
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

    // Les images passent en JSON dans un champ hidden
    images: (() => {
      try {
        const raw = formData.get('images') as string;
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })(),
  };

  const parsed = updateCircuitSchema.safeParse(rawData);
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

  let urlsToDelete: string[] = [];

  // 3. Mise à jour du circuit + remplacement complet des images
  await prisma.$transaction(async (tx) => {
    // 3a. Récupérer les anciennes images pour trouver celles à supprimer physiquement du disque
    const oldImages = await tx.imageCircuit.findMany({
      where: { circuitId: data.id },
      select: { url: true },
    });

    const newUrls = new Set(data.images.map(img => img.url));
    urlsToDelete = oldImages
      .map(img => img.url)
      .filter(url => !newUrls.has(url));

    // 3b. Mettre à jour les champs du circuit
    await tx.circuit.update({
      where: { id: data.id },
      data: {
        titre: data.titre,
        slug: data.slug,
        description: data.description || null,
        dureeJours: data.dureeJours,
        prixEstime: prixEstimeMGA,
        nbPlacesDisponibles: data.nbPlacesDisponibles,
        dateDebut: (() => {
          if (!data.dateDebut) return null;
          const d = new Date(data.dateDebut);
          return isNaN(d.getTime()) ? null : d;
        })(),
        dateFin: (() => {
          if (!data.dateFin) return null;
          const d = new Date(data.dateFin);
          return isNaN(d.getTime()) ? null : d;
        })(),
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
      },
    });

    // 3c. Supprimer les anciennes images (cascade en DB)
    await tx.imageCircuit.deleteMany({
      where: { circuitId: data.id },
    });

    // 3d. Recréer les nouvelles images
    if (data.images.length > 0) {
      await tx.imageCircuit.createMany({
        data: data.images.map((img, index) => ({
          url: img.url,
          legende: img.legende || null,
          ordre: img.ordre ?? index,
          circuitId: data.id,
        })),
      });
    }
  });

  // 4. Supprimer physiquement les images orphelines du disque
  for (const url of urlsToDelete) {
    if (url.startsWith('/uploads/circuits/')) {
      const filePath = path.join(process.cwd(), 'public', url);
      try {
        await fs.unlink(filePath);
      } catch {
      }
    }
  }

  revalidatePath('/admin/circuits');
  revalidatePath(`/admin/circuits/${data.id}/edit`);
  redirect('/admin/circuits');
}
