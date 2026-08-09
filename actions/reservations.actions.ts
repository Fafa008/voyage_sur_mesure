"use server";

import { reservationService } from "@/lib/services/reservation.service";
import { CreateReservationDTO } from "@/types/payment.types";
import { revalidatePath } from "next/cache";

export async function createReservationAction(data: CreateReservationDTO) {
  try {
    const reservation = await reservationService.create(data);
    revalidatePath("/reservation/history");
    return { success: true, data: reservation };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Erreur lors de la création de la réservation:", error);
    return { success: false, error: message };
  }
}

export async function getReservationAction(id: number) {
  try {
    const reservation = await reservationService.getById(id);
    return { success: true, data: reservation };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Erreur récupération réservation:", error);
    return { success: false, error: message };
  }
}

export async function getUserReservationsAction(userId: string) {
  try {
    const reservations = await reservationService.getByUserId(userId);
    return { success: true, data: reservations };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function cancelReservationAction(id: number) {
  try {
    const reservation = await reservationService.cancel(id);
    revalidatePath("/reservation/history");
    return { success: true, data: reservation };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
