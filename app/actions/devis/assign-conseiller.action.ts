'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const assignConseillerSchema = z.object({
  devisId: z.number().int().positive(),
  conseillerId: z.string().nullable(),
});

export async function assignConseillerAction(devisId: number, conseillerId: string | null) {
  // 1. Session et permissions
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: 'Non authentifié' };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  const isStaff = user?.role?.nom === 'admin' || user?.role?.nom === 'conseiller';
  if (!isStaff) {
    return { error: 'Accès non autorisé' };
  }

  // 2. Validation des entrées
  const parsed = assignConseillerSchema.safeParse({ devisId, conseillerId });
  if (!parsed.success) {
    return { error: 'Données invalides' };
  }

  // 3. Vérifier le devis
  const devis = await prisma.devis.findUnique({
    where: { id: devisId },
    include: {
      user: { select: { id: true, name: true, prenom: true } },
      circuit: { select: { titre: true } },
    },
  });

  if (!devis) {
    return { error: 'Devis introuvable' };
  }

  // 4. Si un conseillerId est spécifié, vérifier qu'il s'agit bien d'un conseiller valide
  let conseillerNom: string | null = null;
  if (conseillerId) {
    const conseiller = await prisma.user.findUnique({
      where: { id: conseillerId },
      include: { role: true },
    });

    if (!conseiller || (conseiller.role?.nom !== 'conseiller' && conseiller.role?.nom !== 'admin')) {
      return { error: 'Conseiller invalide' };
    }
    conseillerNom = conseiller.prenom ? `${conseiller.prenom} ${conseiller.name}` : conseiller.name;
  }

  // 5. Mettre à jour le devis
  const updatedDevis = await prisma.devis.update({
    where: { id: devisId },
    data: {
      conseillerId: conseillerId || null,
    },
  });

  // 6. Notifier le nouveau conseiller s'il est assigné
  if (conseillerId) {
    await prisma.notification.create({
      data: {
        userId: conseillerId,
        titre: 'Devis réassigné',
        message: `Le devis #${devisId} (${devis.circuit.titre}) pour ${devis.prenom || devis.user.name} vous a été réassigné.`,
      },
    });
  }

  // 7. Notifier le client du changement de conseiller
  if (conseillerNom) {
    await prisma.notification.create({
      data: {
        userId: devis.userId,
        titre: 'Conseiller assigné',
        message: `Votre devis #${devisId} est désormais suivi par votre conseiller dédié : ${conseillerNom}.`,
      },
    });
  }

  // 8. Revalider les chemins
  revalidatePath(`/devis/${devisId}`);
  revalidatePath(`/admin/devis`);
  revalidatePath(`/conseiller/devis/${devisId}`);
  revalidatePath(`/conseiller/dashboard`);

  return { success: true, devis: updatedDevis };
}
