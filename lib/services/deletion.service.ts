import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Tx = Prisma.TransactionClient;

/**
 * Suppression sécurisée des Devis et Réservations.
 *
 * Les dépendances "lourdes" (PaymentTransaction, PaymentLog, PaymentWebhook,
 * Invoice, Paiement) ne possèdent pas de cascade au niveau de la base de données.
 * On nettoie donc toutes ces entités à l'intérieur d'une transaction afin de
 * ne jamais laisser de données orphelines.
 */
export class DeletionService {
  private async deleteReservationTx(
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

    // Nettoyage des dépendances de paiement / facturation
    await tx.paymentWebhook.deleteMany({
      where: { transaction: { reservationId } },
    });
    await tx.paymentLog.deleteMany({
      where: { transaction: { reservationId } },
    });
    await tx.paymentTransaction.deleteMany({ where: { reservationId } });
    await tx.invoice.deleteMany({ where: { reservationId } });
    await tx.paiement.deleteMany({ where: { reservationId } });

    await tx.reservation.delete({ where: { id: reservationId } });

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
      await this.deleteReservationTx(tx, reservationId, restorePlaces);
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
        await this.deleteReservationTx(tx, devis.reservation.id, restorePlaces);
      }

      await tx.devis.delete({ where: { id: devisId } });
    });
  }
}

export const deletionService = new DeletionService();
