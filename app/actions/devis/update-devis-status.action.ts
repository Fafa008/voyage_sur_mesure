// actions/devis/update-devis-status.action.ts
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { RoleNom } from '@prisma/client';

export async function updateDevisStatus(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error('Non authentifié');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  if (!user?.role || (user.role.nom !== RoleNom.admin && user.role.nom !== RoleNom.conseiller)) {
    throw new Error('Accès refusé : seuls les conseillers et administrateurs peuvent modifier le statut d\'un devis');
  }

  const devisId = parseInt(formData.get('devisId') as string);
  const statut = formData.get('statut') as string;

  await prisma.devis.update({
    where: { id: devisId },
    data: { statut: statut as "en_cours" | "en_modification" | "valide" | "accepte" | "reserve" | "refuse" },
  });

  revalidatePath('/conseiller/dashboard');
  revalidatePath(`/conseiller/devis/${devisId}`);

  redirect('/conseiller/dashboard');
}