"use server";

import { reservationService } from "@/lib/services/reservation.service";
import { CreateReservationDTO } from "@/types/payment.types";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function createReservationAction(data: CreateReservationDTO) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Non authentifié" };

    // Sécurité serveur : l'utilisateur ne peut créer une réservation que pour
    // lui-même, quel que soit le payload envoyé au client.
    const reservation = await reservationService.create({
      ...data,
      userId: session.user.id,
    });
    revalidatePath("/reservation/history");
    return { success: true, data: reservation };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: message };
  }
}

export async function getReservationAction(id: number) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Non authentifié" };

    const reservation = await reservationService.getById(id);
    if (!reservation) return { success: false, error: "Réservation introuvable" };

    if (reservation.userId !== session.user.id) {
      return { success: false, error: "Accès refusé" };
    }

    return { success: true, data: reservation };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: message };
  }
}

export async function getUserReservationsAction() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Non authentifié" };

    const reservations = await reservationService.getByUserId(session.user.id);
    return { success: true, data: reservations };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: message };
  }
}

export async function cancelReservationAction(id: number) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Non authentifié" };

    const reservation = await reservationService.getById(id);
    if (!reservation) return { success: false, error: "Réservation introuvable" };

    const owner = await prisma.reservation.findUnique({
      where: { id },
      include: { devis: { select: { userId: true } } },
    });
    const ownerId = owner?.devis?.userId ?? owner?.userId;
    if (ownerId !== session.user.id) {
      return { success: false, error: "Accès refusé" };
    }

    const cancelled = await reservationService.cancel(id);
    revalidatePath("/reservation/history");
    return { success: true, data: cancelled };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: message };
  }
}
