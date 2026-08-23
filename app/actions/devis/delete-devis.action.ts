"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { RoleNom } from "@prisma/client";
import { deletionService } from "@/lib/services/deletion.service";

const devisIdSchema = z.object({
  devisId: z.coerce.number().int().positive(),
});

export async function deleteDevisAction(
  _prevState: unknown,
  formData: FormData,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Non authentifié" };
  }

  const parsed = devisIdSchema.safeParse({
    devisId: formData.get("devisId"),
  });
  if (!parsed.success) {
    return { error: "Données invalides" };
  }

  const { devisId } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });
  const isAdmin = user?.role?.nom === RoleNom.admin;

  const devis = await prisma.devis.findUnique({
    where: { id: devisId },
    include: {
      reservation: { select: { id: true, status: true } },
    },
  });

  if (!devis) {
    return { error: "Devis introuvable" };
  }

  // Un client ne peut supprimer que ses propres devis
  if (!isAdmin && devis.userId !== session.user.id) {
    return { error: "Vous ne pouvez supprimer que vos propres devis." };
  }

  // Un client ne peut pas supprimer un devis déjà transformé en réservation
  if (!isAdmin && devis.reservation) {
    return {
      error:
        "Ce devis est lié à une réservation. Supprimez d'abord la réservation associée.",
    };
  }

  try {
    await deletionService.deleteDevis(devisId);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erreur inattendue";
    return { error: message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/devis/historique");
  revalidatePath("/devis");
  revalidatePath("/admin/devis");
  revalidatePath("/admin/dashboard");
  revalidatePath("/conseiller/dashboard");

  return { success: true };
}
