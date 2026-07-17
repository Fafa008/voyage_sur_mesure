// app/actions/devis/create-devis.action.ts
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Schéma de validation avec Zod
const createDevisSchema = z.object({
  circuitId: z.string().optional(),
  nombrePersonnes: z.number().int().min(1, 'Minimum 1 personne'),
  dateDebut: z.string().optional(),
  dateFin: z.string().optional(),
  commentaire: z.string().optional(),
});

export async function createDevis(formData: FormData) {
  // 1. Récupérer la session utilisateur
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Vous devez être connecté pour demander un devis.');
  }

  // 2. Extraire et valider les données
  const rawData = {
    circuitId: formData.get('circuitId')?.toString(),
    nombrePersonnes: parseInt(formData.get('nombrePersonnes')?.toString() || '1'),
    dateDebut: formData.get('dateDebut')?.toString(),
    dateFin: formData.get('dateFin')?.toString(),
    commentaire: formData.get('commentaire')?.toString(),
  };

  const parsed = createDevisSchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error('Données invalides : ' + parsed.error.message);
  }

  const { circuitId, nombrePersonnes, dateDebut, dateFin, commentaire } = parsed.data;

  // 3. Créer le devis dans la base
  await prisma.devis.create({
    data: {
      userId: session.user.id,
      circuitId: circuitId ? parseInt(circuitId) : null,
      nombrePersonnes: nombrePersonnes,
      commentaireClient: commentaire,
      dateDebutSouhaitee: dateDebut ? new Date(dateDebut) : null,
      dateFinSouhaitee: dateFin ? new Date(dateFin) : null,
      // statut: 'en_cours' par défaut (défini dans le schéma)
    },
  });

  // 4. Rediriger vers la page de confirmation
  redirect('/devis/merci');
}