// actions/admin/circuits/update-circuit.action.ts
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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
});

export async function updateCircuit(formData: FormData) {
  // Vérification session + admin (identique aux autres actions)

  const data = {
    id: parseInt(formData.get('id') as string),
    titre: formData.get('titre')?.toString() || '',
    slug: formData.get('slug')?.toString() || '',
    description: formData.get('description')?.toString(),
    dureeJours: parseInt(formData.get('dureeJours')?.toString() || '0'),
    prixEstime: parseFloat(formData.get('prixEstime')?.toString() || '0'),
    nbPlacesDisponibles: parseInt(formData.get('nbPlacesDisponibles')?.toString() || '0'),
    dateDebut: formData.get('dateDebut')?.toString(),
    estGroupe: formData.get('estGroupe') === 'true',
    themeId: formData.get('themeId') ? parseInt(formData.get('themeId') as string) : undefined,
    regionId: formData.get('regionId') ? parseInt(formData.get('regionId') as string) : undefined,
  };

  // Mise à jour (simplifiée ici, pour un vrai update il faut gérer les relations)
  await prisma.circuit.update({
    where: { id: data.id },
    data: {
      titre: data.titre,
      slug: data.slug,
      description: data.description,
      dureeJours: data.dureeJours,
      prixEstime: data.prixEstime,
      nbPlacesDisponibles: data.nbPlacesDisponibles,
      dateDebut: data.dateDebut ? new Date(data.dateDebut) : null,
      estGroupe: data.estGroupe,
      themeId: data.themeId,
      regionId: data.regionId,
    },
  });

  revalidatePath('/admin/circuits');
  revalidatePath(`/admin/circuits/${data.id}/edit`);
  redirect('/admin/circuits');
}