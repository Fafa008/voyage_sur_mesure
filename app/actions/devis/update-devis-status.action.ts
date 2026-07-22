// actions/devis/update-devis-status.action.ts
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function updateDevisStatus(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error('Non authentifié');
  }

  const devisId = parseInt(formData.get('devisId') as string);
  const statut = formData.get('statut') as string;

  await prisma.devis.update({
    where: { id: devisId },
    data: { statut: statut as any },
  });

  revalidatePath('/conseiller/dashboard');
  revalidatePath(`/conseiller/devis/${devisId}`);

  redirect('/conseiller/dashboard');
}