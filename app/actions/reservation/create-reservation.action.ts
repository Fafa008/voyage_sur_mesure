"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma, StatutDevis, StatutReservation } from "@prisma/client";

const paymentSchema = z.object({
  devisId: z.coerce.number().int().positive(),
  modeId: z.coerce.number().int().positive("Mode de paiement requis"),
});

function generateTransactionRef(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MV-${timestamp}-${random}`;
}

export async function createReservation(prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Vous devez être connecté." };
  }

  const parsed = paymentSchema.safeParse({
    devisId: formData.get("devisId"),
    modeId: formData.get("modeId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { devisId, modeId } = parsed.data;

  const devis = await prisma.devis.findUnique({
    where: { id: devisId },
    include: { reservation: true, circuit: { select: { id: true, nbPlacesDisponibles: true } } },
  });

  if (!devis) return { error: "Devis introuvable" };
  if (devis.userId !== session.user.id) return { error: "Accès refusé" };
  if (devis.statut !== StatutDevis.accepte) {
    return { error: "Le devis doit être accepté avant le paiement" };
  }
  if (devis.reservation) {
    return { error: "Une réservation existe déjà pour ce devis" };
  }
  if (!devis.montantTotal) {
    return { error: "Montant du devis non défini" };
  }

  const mode = await prisma.modePaiement.findUnique({ where: { id: modeId } });
  if (!mode) return { error: "Mode de paiement invalide" };

  if (
    devis.circuit &&
    devis.circuit.nbPlacesDisponibles < devis.nombrePersonnes
  ) {
    return { error: "Plus assez de places disponibles pour ce circuit" };
  }

  const montant = devis.montantTotal;

  try {
    const reservation = await prisma.$transaction(async (tx) => {
      const newReservation = await tx.reservation.create({
        data: {
          devisId,
          montantFinal: montant,
          statut: StatutReservation.confirmee,
        },
      });

      await tx.paiement.create({
        data: {
          montant,
          userId: session.user.id,
          modeId,
          reservationId: newReservation.id,
          referenceTransaction: generateTransactionRef(),
        },
      });

      await tx.devis.update({
        where: { id: devisId },
        data: { statut: StatutDevis.reserve },
      });

      if (devis.circuitId && devis.circuit) {
        await tx.circuit.update({
          where: { id: devis.circuitId },
          data: {
            nbPlacesDisponibles: {
              decrement: devis.nombrePersonnes,
            },
          },
        });
      }

      await tx.notification.create({
        data: {
          userId: session.user.id,
          titre: "Réservation confirmée",
          message: `Votre réservation #${newReservation.id} est confirmée. Montant réglé : ${formatCurrency(montant)}.`,
        },
      });

      return newReservation;
    });

    revalidatePath("/dashboard");
    revalidatePath("/reservations");
    revalidatePath(`/devis/${devisId}`);
    revalidatePath("/notifications");

    redirect(`/reservations/${reservation.id}`);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "Une réservation existe déjà pour ce devis" };
    }
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    console.error("createReservation error:", err);
    return { error: "Erreur lors de la création de la réservation" };
  }
}
