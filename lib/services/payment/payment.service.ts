import { PaymentMethod, PaymentStatus, ReservationStatus, StatutDevis, StatutReservation, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PaymentFactory } from "./payment.factory";
import { PaymentResult, WebhookResult } from "@/types/payment.types";

export class PaymentService {
  async initiatePayment(reservationId: number, method: PaymentMethod, userId: string): Promise<PaymentResult> {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { user: true }
    });

    if (!reservation) throw new Error("Reservation not found");
    if (!reservation.montantFinal) throw new Error("Amount is not defined");

    const amount = Number(reservation.montantFinal);
    const currency = "EUR";

    // 1. Get Provider
    const provider = PaymentFactory.getProvider(method);

    // 2. Get or create internal PaymentProvider entry
    let internalProvider = await prisma.paymentProvider.findUnique({
      where: { name: method.toString() }
    });
    if (!internalProvider) {
      internalProvider = await prisma.paymentProvider.create({
        data: { name: method.toString() }
      });
    }

    // 3. Initiate Charge on Provider
    const result = await provider.createCharge(amount, currency, {
      reservationId,
      userId,
      description: `Paiement Réservation #${reservationId}`,
      returnUrl: `${process.env.APP_URL}/paiement/${reservationId}/confirmation`,
      cancelUrl: `${process.env.APP_URL}/paiement/${reservationId}`,
    });

    if (result.success) {
      // 4. Record Transaction
      const transaction = await prisma.paymentTransaction.create({
        data: {
          amount: amount,
          currency,
          method,
          status: PaymentStatus.PENDING,
          providerId: internalProvider.id,
          providerRef: result.providerRef,
          reservationId,
          userId,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        }
      });

      // Log
      await prisma.paymentLog.create({
        data: {
          transactionId: transaction.id,
          action: 'INITIATED',
          data: JSON.parse(JSON.stringify(result))
        }
      });

      // Attach transactionId to result
      return { ...result, transactionId: transaction.id };
    }

    return result;
  }

  /**
   * Orchestre: vérification devis → création réservation brouillon → initiation paiement
   */
  async initiateFromDevis(devisId: number, method: PaymentMethod, userId: string): Promise<{ reservationId: number; paymentResult: PaymentResult }> {
    const devis = await prisma.devis.findUnique({
      where: { id: devisId },
      include: {
        reservation: true,
        circuit: { select: { id: true, nbPlacesDisponibles: true } }
      }
    });

    if (!devis) throw new Error("Devis introuvable");
    if (devis.userId !== userId) throw new Error("Accès refusé");
    if (devis.statut !== StatutDevis.accepte && devis.statut !== StatutDevis.reserve) {
      throw new Error("Le devis doit être accepté avant le paiement");
    }
    if (devis.reservation && devis.reservation.status === "PAYEE") {
      throw new Error("Cette réservation a déjà été réglée");
    }
    if (!devis.montantTotal) throw new Error("Montant du devis non défini");

    // Si réservation existe déjà (brouillon), on l'utilise. Sinon on crée.
    let reservationId: number;

    if (devis.reservation) {
      reservationId = devis.reservation.id;
    } else {
      const reservation = await prisma.$transaction(async (tx) => {
        if (devis.circuit && devis.circuit.nbPlacesDisponibles !== null && devis.circuit.nbPlacesDisponibles >= 0) {
          const remainingPlaces = devis.circuit.nbPlacesDisponibles - devis.nombrePersonnes;
          if (remainingPlaces < 0) {
            await tx.circuit.update({
              where: { id: devis.circuitId! },
              data: { nbPlacesDisponibles: 0 }
            });
          }
        }

        const newRes = await tx.reservation.create({
          data: {
            devisId,
            montantFinal: devis.montantTotal!,
            status: ReservationStatus.EN_ATTENTE,
            statut: StatutReservation.confirmee,
            userId,
          }
        });

        await tx.devis.update({
          where: { id: devisId },
          data: { statut: StatutDevis.reserve }
        });

        if (devis.circuitId && devis.circuit) {
          await tx.circuit.update({
            where: { id: devis.circuitId },
            data: { nbPlacesDisponibles: { decrement: devis.nombrePersonnes } }
          });
        }

        return newRes;
      });

      reservationId = reservation.id;
    }

    // Initier le paiement
    const paymentResult = await this.initiatePayment(reservationId, method, userId);

    return { reservationId, paymentResult };
  }

  async processWebhook(method: PaymentMethod, payload: Record<string, unknown>, headers: Record<string, string>): Promise<void> {
    const provider = PaymentFactory.getProvider(method);
    const result: WebhookResult = await provider.handleWebhook(payload, headers);

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { providerRef: result.providerRef }
    });

    if (!transaction) throw new Error("Transaction not found for webhook");

    // Enregistrer le webhook
    await prisma.paymentWebhook.create({
      data: {
        transactionId: transaction.id,
        provider: method.toString(),
        payload: JSON.parse(JSON.stringify(result.raw)) as Prisma.InputJsonValue,
        isProcessed: true,
      }
    });

    // Mettre à jour si le statut a changé
    if (transaction.status !== result.status) {
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { status: result.status }
      });

      if (result.status === PaymentStatus.PAID) {
        await this._markReservationPaid(transaction.reservationId, transaction.userId);
      }
    }
  }

  async updateTransactionStatus(transactionId: string, status: PaymentStatus): Promise<void> {
    const transaction = await prisma.paymentTransaction.update({
      where: { id: transactionId },
      data: { status }
    });

    if (status === PaymentStatus.PAID) {
      await this._markReservationPaid(transaction.reservationId, transaction.userId);
    }
  }

  private async _markReservationPaid(reservationId: number, userId: string): Promise<void> {
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: ReservationStatus.PAYEE }
    });

    // Notification client
    await prisma.notification.create({
      data: {
        userId,
        titre: "Paiement confirmé 🎉",
        message: `Votre paiement pour la réservation #${reservationId} a été confirmé avec succès. Bon voyage !`,
      }
    });
  }

  async getTransactionByReservation(reservationId: number) {
    return prisma.paymentTransaction.findFirst({
      where: { reservationId },
      include: { provider: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const paymentService = new PaymentService();
