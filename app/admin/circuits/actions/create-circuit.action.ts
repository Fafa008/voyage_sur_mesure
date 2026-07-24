// actions/admin/circuits/create-circuit.action.ts
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

// Schéma pour la création
const createCircuitSchema = z.object({
  titre: z.string().min(1, 'Titre requis'),
  slug: z.string().min(1, 'Slug requis'),
  description: z.string().optional(),
  dureeJours: z.number().int().min(1, 'Durée minimale 1 jour'),
  prixEstime: z.number().min(0, 'Prix invalide'),
  nbPlacesDisponibles: z.number().int().min(0).default(0),
  dateDebut: z.string().optional(),
  estGroupe: z.boolean().default(false),
  themeId: z.number().optional(),
  regionId: z.number().optional(),
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
      url: z.string().url('URL invalide'),
      legende: z.string().optional(),
      ordre: z.number().int().min(0).default(0),
    })
  ),
});

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
    description: formData.get('description')?.toString(),
    dureeJours: parseInt(formData.get('dureeJours')?.toString() || '0'),
    prixEstime: parseFloat(formData.get('prixEstime')?.toString() || '0'),
    nbPlacesDisponibles: parseInt(formData.get('nbPlacesDisponibles')?.toString() || '0'),
    dateDebut: formData.get('dateDebut')?.toString(),
    estGroupe: formData.get('estGroupe') === 'true',
    themeId: formData.get('themeId') ? parseInt(formData.get('themeId') as string) : undefined,
    regionId: formData.get('regionId') ? parseInt(formData.get('regionId') as string) : undefined,
    // Les relations nécessitent un traitement particulier (JSON)
  };

  // Pour les relations (étapes, images), on les passe en JSON dans un champ hidden
  const etapes = JSON.parse(formData.get('etapes') as string || '[]');
  const images = JSON.parse(formData.get('images') as string || '[]');

  // 3. Création du circuit avec toutes les relations
  try {
    await prisma.circuit.create({
      data: {
        titre: rawData.titre,
        slug: rawData.slug,
        description: rawData.description,
        dureeJours: rawData.dureeJours,
        prixEstime: rawData.prixEstime,
        nbPlacesDisponibles: rawData.nbPlacesDisponibles,
        dateDebut: rawData.dateDebut ? new Date(rawData.dateDebut) : null,
        estGroupe: rawData.estGroupe,
        themeId: rawData.themeId,
        regionId: rawData.regionId,
        images: {
          create: images.map((img: any, index: number) => ({
            url: img.url,
            legende: img.legende || null,
            ordre: img.ordre || index,
          })),
        },
        etapes: {
          create: etapes.map((etape: any) => ({
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
              create: (etape.activites || []).map((act: any) => ({
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