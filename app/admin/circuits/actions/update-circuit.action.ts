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

const updateCircuitSchema = z.object({
  id: z.number().int(),
  titre: z.string().min(1, 'Titre requis'),
  slug: z.string().min(1, 'Slug requis'),
  description: z.string().optional(),
  dureeJours: z.number().int().min(1),
  prixEstime: z.number().min(0),
  nbPlacesDisponibles: z.number().int().min(0).default(0),
  dateDebut: z.string().optional(),
  estGroupe: z.boolean().default(false),
  themeId: z.number().optional(),
  regionId: z.number().optional(),
  images: z.array(
    z.object({
      url: z.string().min(1, 'URL requise'),
      legende: z.string().nullable().optional(),
      ordre: z.number().int().min(0).default(0),
    })
  ),
});

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
    nbPlacesDisponibles: parseInt(formData.get('nbPlacesDisponibles')?.toString() || '0'),
    dateDebut: (() => {
      const raw = formData.get('dateDebut')?.toString()?.trim();
      return raw && raw !== "" ? raw : undefined;
    })(),
    estGroupe: formData.get('estGroupe') === 'true',
    themeId: formData.get('themeId') ? parseInt(formData.get('themeId') as string) : undefined,
    regionId: formData.get('regionId') ? parseInt(formData.get('regionId') as string) : undefined,
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
        prixEstime: data.prixEstime,
        nbPlacesDisponibles: data.nbPlacesDisponibles,
        dateDebut: (() => {
          if (!data.dateDebut) return null;
          const d = new Date(data.dateDebut);
          return isNaN(d.getTime()) ? null : d;
        })(),
        estGroupe: data.estGroupe,
        themeId: data.themeId ?? null,
        regionId: data.regionId ?? null,
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
      } catch (err) {
      }
    }
  }

  revalidatePath('/admin/circuits');
  revalidatePath(`/admin/circuits/${data.id}/edit`);
  redirect('/admin/circuits');
}
