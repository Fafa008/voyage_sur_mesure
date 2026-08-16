"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { RoleNom, ReservationStatus } from "@prisma/client";
import { deletionService } from "@/lib/services/deletion.service";

const reservationIdSchema = z.object({
  reservationId: z.coerce.number().int().positive(),
});

export async function deleteReservationAction(
  _prevState: unknown,
  formData: FormData,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Non authentifié" };
  }

  const parsed = reservationIdSchema.safeParse({
    reservationId: formData.get("reservationId"),
  });
  if (!parsed.success) {
    return { error: "Données invalides" };
  }

  const { reservationId } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });
  const isAdmin = user?.role?.nom === RoleNom.admin;

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      devis: { select: { userId: true } },
    },
  });

  if (!reservation) {
    return { error: "Réservation introuvable" };
  }

  const ownerId = reservation.devis?.userId ?? reservation.userId;

  // Un client ne peut supprimer que ses propres réservations
  if (!isAdmin && ownerId !== session.user.id) {
    return {
      error: "Vous ne pouvez supprimer que vos propres réservations.",
    };
  }

  // Sécurité : jamais supprimer une réservation payée depuis l'espace client
  if (!isAdmin && reservation.status === ReservationStatus.PAYEE) {
    return {
      error:
        "Une réservation déjà payée ne peut pas être supprimée depuis l'espace client.",
    };
  }

  try {
    await deletionService.deleteReservation(reservationId);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erreur inattendue";
    console.error("Erreur suppression réservation:", err);
    return { error: message };
  }

  revalidatePath("/reservations");
  revalidatePath("/dashboard");
  revalidatePath("/admin/reservations");
  revalidatePath("/admin/dashboard");
  revalidatePath("/conseiller/dashboard");

  return { success: true };
}
