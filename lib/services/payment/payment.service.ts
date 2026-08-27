import { PaymentMethod, PaymentStatus, ReservationStatus, StatutDevis, StatutReservation, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PaymentFactory } from "./payment.factory";
import { PaymentResult, WebhookResult } from "@/types/payment.types";

export class PaymentService {
  async initiatePayment(reservationId: number, method: PaymentMethod, userId: string): Promise<PaymentResult> {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        user: true,
        devis: true,
      }
    });

    if (!reservation) throw new Error("Reservation not found");
    if (!reservation.montantFinal) throw new Error("Amount is not defined");

    // P1.1 — Rejeter l'initiation de paiement si la réservation est déjà PAYEE ou ANNULEE
    if (reservation.status === ReservationStatus.PAYEE) {
      throw new Error("Cette réservation a déjà été réglée");
    }
    if (reservation.status === ReservationStatus.ANNULEE) {
      throw new Error("Cette réservation a été annulée et ne peut plus être payée");
    }

    // Vérifier la propriété de la réservation
    const isOwner =
      reservation.userId === userId ||
      reservation.devis?.userId === userId;
    if (!isOwner) throw new Error("Accès refusé : vous ne pouvez payer que vos propres réservations");

    const amount = Number(reservation.montantFinal);
    const currency = "MGA";

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

    // Resolve clientName
    let clientName = "Client Mon Voyage";
    if (reservation.user?.name) {
      clientName = reservation.user.name;
      if (reservation.user.prenom) {
        clientName = `${reservation.user.prenom} ${reservation.user.name}`;
      }
    } else if (reservation.devis) {
      const devisNom = reservation.devis.nom || "";
      const devisPrenom = reservation.devis.prenom || "";
      const devisFullName = `${devisPrenom} ${devisNom}`.trim();
      if (devisFullName) {
        clientName = devisFullName;
      }
    }

    // 3. Initiate Charge on Provider
    const appUrl =
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const result = await provider.createCharge(amount, currency, {
      reservationId,
      userId,
      description: `Paiement Réservation #${reservationId}`,
      returnUrl: `${appUrl}/paiement/${reservationId}/confirmation`,
      cancelUrl: `${appUrl}/paiement/${reservationId}`,
      clientName,
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
          notificationToken: result.notificationToken || null,
          reservationId,
          userId,
          expiresAt: result.expiresAt || new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
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
      const finalResult = { ...result, transactionId: transaction.id };
      return finalResult;
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
    if (devis.reservation && devis.reservation.status === ReservationStatus.PAYEE) {
      throw new Error("Cette réservation a déjà été réglée");
    }
    if (devis.reservation && devis.reservation.status === ReservationStatus.ANNULEE) {
      throw new Error("Cette réservation a été annulée");
    }
    if (!devis.montantTotal) throw new Error("Montant du devis non défini");

    // Si réservation existe déjà, on l'utilise. Sinon on crée de façon atomique.
    let reservationId: number;

    if (devis.reservation) {
      reservationId = devis.reservation.id;
    } else {
      try {
        const reservation = await prisma.$transaction(async (tx) => {
          if (devis.circuit && devis.circuitId) {
            // P1.1 — Décrémentation atomique avec vérification SQL gte pour empêcher les valeurs négatives en cas de requêtes simultanées
            const updatedCircuit = await tx.circuit.updateMany({
              where: {
                id: devis.circuitId,
                nbPlacesDisponibles: { gte: devis.nombrePersonnes }
              },
              data: {
                nbPlacesDisponibles: { decrement: devis.nombrePersonnes }
              }
            });

            if (updatedCircuit.count === 0) {
              throw new Error("Plus assez de places disponibles pour ce circuit");
            }
          }

          const newRes = await tx.reservation.create({
            data: {
              devisId,
              circuitId: devis.circuitId,
              nbVoyageurs: devis.nombrePersonnes,
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

          return newRes;
        });

        reservationId = reservation.id;
      } catch (err) {
        // En cas de conflit unique P2002 sur devisId (requêtes simultanées), récupérer la réservation créée par l'autre requête
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
          const existingRes = await prisma.reservation.findUnique({ where: { devisId } });
          if (existingRes) {
            reservationId = existingRes.id;
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
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
    await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.PAYEE }
      });

      const existingInvoice = await tx.invoice.findFirst({
        where: { reservationId }
      });

      if (!existingInvoice && reservation.montantFinal) {
        const numFacture = `FAC-${reservationId}-${Date.now()}`;
        await tx.invoice.create({
          data: {
            numeroFacture: numFacture,
            status: "PAID",
            amount: reservation.montantFinal,
            totalAmount: reservation.montantFinal,
            reservationId,
            userId,
          }
        });
      }

      await tx.notification.create({
        data: {
          userId,
          titre: "Paiement confirmé",
          message: `Votre paiement pour la réservation #${reservationId} a été confirmé avec succès. Bon voyage !`,
        }
      });
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
