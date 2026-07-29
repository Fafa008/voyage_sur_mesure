"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const devisIdSchema = z.object({
  devisId: z.coerce.number().int().positive(),
});

async function requireOwner(devisId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");

  const devis = await prisma.devis.findUnique({ where: { id: devisId } });
  if (!devis) throw new Error("Devis introuvable");
  if (devis.userId !== session.user.id) throw new Error("Accès refusé");

  return { session, devis };
}

export async function acceptDevis(_prevState: unknown, formData: FormData) {
  const parsed = devisIdSchema.safeParse({ devisId: formData.get("devisId") });
  if (!parsed.success) return { error: "Données invalides" };

  const { devisId } = parsed.data;

  try {
    const { devis } = await requireOwner(devisId);

    if (devis.statut !== "valide") {
      return { error: "Seul un devis validé peut être accepté" };
    }

    if (!devis.montantTotal) {
      return { error: "Le devis n'a pas encore de montant défini" };
    }

    await prisma.$transaction([
      prisma.devis.update({
        where: { id: devisId },
        data: { statut: "accepte" },
      }),
      prisma.notification.create({
        data: {
          userId: devis.userId,
          titre: "Devis accepté",
          message: `Vous avez accepté le devis #${devisId}. Procédez au paiement pour confirmer votre réservation.`,
        },
      }),
    ]);

    revalidatePath(`/devis/${devisId}`);
    revalidatePath("/dashboard");
    revalidatePath("/notifications");

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue" };
  }
}

export async function refuseDevis(_prevState: unknown, formData: FormData) {
  const parsed = devisIdSchema.safeParse({ devisId: formData.get("devisId") });
  if (!parsed.success) return { error: "Données invalides" };

  const { devisId } = parsed.data;

  try {
    const { devis } = await requireOwner(devisId);

    if (devis.statut !== "valide") {
      return { error: "Seul un devis validé peut être refusé" };
    }

    await prisma.$transaction([
      prisma.devis.update({
        where: { id: devisId },
        data: { statut: "refuse" },
      }),
      prisma.notification.create({
        data: {
          userId: devis.userId,
          titre: "Devis refusé",
          message: `Vous avez refusé le devis #${devisId}. Votre conseiller pourra vous contacter pour une nouvelle proposition.`,
        },
      }),
    ]);

    revalidatePath(`/devis/${devisId}`);
    revalidatePath("/dashboard");
    revalidatePath("/notifications");

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inattendue" };
  }
}
