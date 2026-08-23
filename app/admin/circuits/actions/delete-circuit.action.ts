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

  // 2. Suppression sécurisée en transaction.
  //    Un circuit peut être lié à des Devis (ON DELETE CASCADE) et donc à des
  //    Réservations. Les dépendances de paiement (transactions, logs, webhooks,
  //    factures, paiements) n'ont pas de cascade : on les nettoie d'abord pour
  //    ne jamais laisser de données orphelines.
  await prisma.$transaction(async (tx) => {
    const devisList = await tx.devis.findMany({
      where: { circuitId },
      select: { id: true },
    });
    const devisIds = devisList.map((d) => d.id);

    const reservations = await tx.reservation.findMany({
      where: devisIds.length
        ? { OR: [{ devisId: { in: devisIds } }, { circuitId }] }
        : { circuitId },
      select: { id: true },
    });
    const reservationIds = reservations.map((r) => r.id);

    if (reservationIds.length) {
      await tx.paymentWebhook.deleteMany({
        where: { transaction: { reservationId: { in: reservationIds } } },
      });
      await tx.paymentLog.deleteMany({
        where: { transaction: { reservationId: { in: reservationIds } } },
      });
      await tx.paymentTransaction.deleteMany({
        where: { reservationId: { in: reservationIds } },
      });
      await tx.invoice.deleteMany({
        where: { reservationId: { in: reservationIds } },
      });
      await tx.paiement.deleteMany({
        where: { reservationId: { in: reservationIds } },
      });
      await tx.reservation.deleteMany({
        where: { id: { in: reservationIds } },
      });
    }

    if (devisIds.length) {
      await tx.devis.deleteMany({ where: { id: { in: devisIds } } });
    }

    await tx.circuit.delete({ where: { id: circuitId } });
  });

  // 3. Supprimer physiquement les images associées du disque
  for (const img of circuitImages) {
    if (img.url.startsWith('/uploads/circuits/')) {
      const filePath = path.join(process.cwd(), 'public', img.url);
      try {
        await fs.unlink(filePath);
      } catch (err) {
      }
    }
  }

  revalidatePath('/admin/circuits');
  redirect('/admin/circuits');
}