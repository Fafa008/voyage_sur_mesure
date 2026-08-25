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

  // 1. Soft delete en transaction.
  //    Le circuit, ses devis et réservations reçoivent un deletedAt.
  //    Les données financières (PaymentTransaction, Invoice, PaymentLog,
  //    PaymentWebhook, Paiement) ne sont JAMAIS supprimées.
  await prisma.$transaction(async (tx) => {
    // Soft delete des réservations liées (via devis ou directement)
    const devisList = await tx.devis.findMany({
      where: { circuitId },
      select: { id: true },
    });
    const devisIds = devisList.map((d) => d.id);

    const reservations = await tx.reservation.findMany({
      where: {
        deletedAt: null,
        ...(devisIds.length
          ? { OR: [{ devisId: { in: devisIds } }, { circuitId }] }
          : { circuitId }),
      },
      select: { id: true },
    });

    if (reservations.length) {
      await tx.reservation.updateMany({
        where: { id: { in: reservations.map((r) => r.id) } },
        data: { deletedAt: new Date() },
      });
    }

    // Soft delete des devis liés
    if (devisIds.length) {
      await tx.devis.updateMany({
        where: { id: { in: devisIds } },
        data: { deletedAt: new Date() },
      });
    }

    // Soft delete du circuit
    await tx.circuit.update({
      where: { id: circuitId },
      data: { deletedAt: new Date() },
    });
  });

  // 2. Supprimer les images du disque (données non financières)
  const circuitImages = await prisma.imageCircuit.findMany({
    where: { circuitId },
    select: { url: true },
  });

  const fs = await import('fs/promises');
  const path = await import('path');

  for (const img of circuitImages) {
    if (img.url.startsWith('/uploads/circuits/')) {
      const filePath = path.join(process.cwd(), 'public', img.url);
      try {
        await fs.unlink(filePath);
      } catch {
      }
    }
  }

  revalidatePath('/admin/circuits');
  redirect('/admin/circuits');
}