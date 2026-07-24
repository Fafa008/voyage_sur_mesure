// actions/admin/circuits/delete-circuit.action.ts
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function deleteCircuit(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Non authentifié');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  if (!user || !user.role || user.role.nom !== 'admin') {
    throw new Error('Accès refusé');
  }

  const circuitId = parseInt(formData.get('circuitId') as string);

  // Suppression en cascade (ON DELETE CASCADE défini dans le schéma)
  await prisma.circuit.delete({
    where: { id: circuitId },
  });

  revalidatePath('/admin/circuits');
  redirect('/admin/circuits');
}