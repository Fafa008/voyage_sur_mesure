import { PaymentMethod, PaymentStatus } from "@prisma/client";
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
    const currency = "EUR"; // Peut être dynamique plus tard

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
    }

    return result;
  }

  async processWebhook(method: PaymentMethod, payload: any, headers: any): Promise<void> {
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
        payload: result.raw,
        isProcessed: true,
      }
    });

    // Mettre à jour si le statut a changé
    if (transaction.status !== result.status) {
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { status: result.status }
      });

      // Si le paiement est réussi, mettre à jour la réservation
      if (result.status === PaymentStatus.PAID) {
        await prisma.reservation.update({
          where: { id: transaction.reservationId },
          data: { status: 'PAYEE' } // TODO: Make sure ReservationStatus matches
        });
        
        // TODO: Générer la facture et envoyer l'email de confirmation
      }
    }
  }

  async updateTransactionStatus(transactionId: string, status: PaymentStatus): Promise<void> {
    const transaction = await prisma.paymentTransaction.update({
      where: { id: transactionId },
      data: { status }
    });
    
    if (status === PaymentStatus.PAID) {
      await prisma.reservation.update({
        where: { id: transaction.reservationId },
        data: { status: 'PAYEE' }
      });
    }
  }
}

export const paymentService = new PaymentService();
