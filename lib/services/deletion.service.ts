import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Tx = Prisma.TransactionClient;

/**
 * Suppression sécurisée (soft delete) des Devis et Réservations.
 *
 * Les données financières (PaymentTransaction, PaymentLog, PaymentWebhook,
 * Invoice, Paiement) ne sont JAMAIS supprimées. Seuls les enregistrements
 * métier (Circuit, Devis, Re√°servation) reçoivent un `deletedAt` pour les
 * masquer des listes actives tout en conservant l'intégrité des archives.
 */
export class DeletionService {
  private async softDeleteReservationTx(
    tx: Tx,
    reservationId: number,
    restorePlaces: boolean,
  ) {
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
      include: {
        devis: { select: { nombrePersonnes: true, circuitId: true } },
      },
    });

    if (!reservation) return;

    // Soft delete de la réservation — les données financières restent liées
    await tx.reservation.update({
      where: { id: reservationId },
      data: { deletedAt: new Date() },
    });

    // Restauration des places éventuellement réservées sur le circuit
    if (restorePlaces) {
      const circuitId =
        reservation.circuitId ?? reservation.devis?.circuitId ?? null;
      const personnes =
        reservation.devis?.nombrePersonnes ??
        reservation.nbVoyageurs ??
        1;

      if (circuitId) {
        const circuit = await tx.circuit.findUnique({
          where: { id: circuitId },
          select: { id: true },
        });
        if (circuit) {
          await tx.circuit.update({
            where: { id: circuitId },
            data: { nbPlacesDisponibles: { increment: personnes } },
          });
        }
      }
    }
  }

  async deleteReservation(reservationId: number, restorePlaces = true) {
    await prisma.$transaction(async (tx) => {
      await this.softDeleteReservationTx(tx, reservationId, restorePlaces);
    });
  }

  async deleteDevis(devisId: number, restorePlaces = true) {
    await prisma.$transaction(async (tx) => {
      const devis = await tx.devis.findUnique({
        where: { id: devisId },
        include: { reservation: { select: { id: true } } },
      });

      if (!devis) return;

      if (devis.reservation) {
        await this.softDeleteReservationTx(tx, devis.reservation.id, restorePlaces);
      }

      await tx.devis.update({
        where: { id: devisId },
        data: { deletedAt: new Date() },
      });
    });
  }
}

export const deletionService = new DeletionService();
