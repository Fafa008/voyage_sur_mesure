// app/actions/devis/create-devis.action.ts
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { redirect } from 'next/navigation';

// Schéma complet
const createDevisSchema = z.object({
  // Informations personnelles
  prenom: z.string().min(1, 'Prénom requis'),
  nom: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(1, 'Téléphone requis'),

  // Voyage
  circuitId: z.string().optional(),
  typeVoyage: z.array(z.string()).optional(),
  themeIds: z.array(z.string()).optional(),
  regionIds: z.array(z.string()).optional(),
  dateDebut: z.string().min(1, 'Date de début requise'),
  dateFin: z.string().min(1, 'Date de fin requise'),
  dureeFlexible: z.string().optional(), // 'true' ou 'false'
  adultes: z.number().int().min(1, 'Au moins 1 adulte'),
  enfants: z.number().int().min(0).default(0),
  ados: z.number().int().min(0).default(0),
  enfantsAge: z.string().optional(),

  // Hébergement & Restauration
  typeHebergement: z.string().optional(),
  regime: z.string().optional(),
  regimePrecision: z.string().optional(),

  // Activités & Transport
  activites: z.array(z.string()).optional(),
  transport: z.array(z.string()).optional(),

  // Budget
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),

  // Complémentaires
  commentaire: z.string().optional(),
  source: z.string().optional(),
  newsletter: z.string().optional(),
});

export async function createDevis(prevState: any, formData: FormData) {
  // 1. Session
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: 'Vous devez être connecté.' };
  }

  // 2. Extraire toutes les données
  const rawData = {
    prenom: formData.get('prenom')?.toString() || '',
    nom: formData.get('nom')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    telephone: formData.get('telephone')?.toString() || '',
    circuitId: formData.get('circuitId')?.toString(),
    typeVoyage: formData.getAll('typeVoyage') as string[],
    themeIds: formData.getAll('themeIds') as string[],
    regionIds: formData.getAll('regionIds') as string[],
    dateDebut: formData.get('dateDebut')?.toString() || '',
    dateFin: formData.get('dateFin')?.toString() || '',
    dureeFlexible: formData.get('dureeFlexible')?.toString(),
    adultes: parseInt(formData.get('adultes')?.toString() || '1'),
    enfants: parseInt(formData.get('enfants')?.toString() || '0'),
    ados: parseInt(formData.get('ados')?.toString() || '0'),
    enfantsAge: formData.get('enfantsAge')?.toString(),
    typeHebergement: formData.get('typeHebergement')?.toString(),
    regime: formData.get('regime')?.toString(),
    regimePrecision: formData.get('regimePrecision')?.toString(),
    activites: formData.getAll('activites') as string[],
    transport: formData.getAll('transport') as string[],
    budgetMin: parseFloat(formData.get('budgetMin')?.toString() || '0'),
    budgetMax: parseFloat(formData.get('budgetMax')?.toString() || '0'),
    commentaire: formData.get('commentaire')?.toString(),
    source: formData.get('source')?.toString(),
    newsletter: formData.get('newsletter')?.toString(),
  };

  // 3. Validation
  const parsed = createDevisSchema.safeParse(rawData);
  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message || 'Erreur de validation';
    return { error: msg };
  }

  const data = parsed.data;

  // 4. Création du devis avec tous les champs
  await prisma.devis.create({
    data: {
      userId: session.user.id,
      circuitId: data.circuitId ? parseInt(data.circuitId) : null,
      prenom: data.prenom,
      nom: data.nom,
      telephone: data.telephone,
      dateDebutSouhaitee: new Date(data.dateDebut),
      dateFinSouhaitee: new Date(data.dateFin),
      dureeFlexible: data.dureeFlexible === 'true',
      adultes: data.adultes,
      enfants: data.enfants,
      ados: data.ados,
      enfantsAge: data.enfantsAge || null,
      typeHebergement: data.typeHebergement || null,
      regime: data.regime || null,
      regimePrecision: data.regimePrecision || null,
      budgetMin: data.budgetMin || null,
      budgetMax: data.budgetMax || null,
      source: data.source || null,
      newsletter: data.newsletter === 'true',
      // Tableaux (PostgreSQL)
      themeIds: data.themeIds?.map(id => parseInt(id)) || [],
      regionIds: data.regionIds?.map(id => parseInt(id)) || [],
      typeVoyage: data.typeVoyage || [],
      activites: data.activites || [],
      transport: data.transport || [],
      // Conserver aussi un commentaire global enrichi
      commentaireClient: data.commentaire || null,
      // nombrePersonnes calculé
      nombrePersonnes: data.adultes + data.enfants + data.ados,
    },
  });

  // 5. Redirection côté client via useRouter (gérée dans le formulaire)
  return { success: true };
}