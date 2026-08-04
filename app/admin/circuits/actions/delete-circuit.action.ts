// actions/admin/circuits/delete-circuit.action.ts
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

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

  // 1. Récupérer les images associées avant de supprimer le circuit de la base de données
  const circuitImages = await prisma.imageCircuit.findMany({
    where: { circuitId },
    select: { url: true },
  });

  // 2. Suppression en cascade (ON DELETE CASCADE défini dans le schéma)
  await prisma.circuit.delete({
    where: { id: circuitId },
  });

  // 3. Supprimer physiquement les images associées du disque
  for (const img of circuitImages) {
    if (img.url.startsWith('/uploads/circuits/')) {
      const filePath = path.join(process.cwd(), 'public', img.url);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error(`Erreur lors de la suppression physique du fichier ${filePath} :`, err);
      }
    }
  }

  revalidatePath('/admin/circuits');
  redirect('/admin/circuits');
}