import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, ReservationStatus } from "@prisma/client";

/**
 * Webhook sécurisé Papi.mg
 *
 * POST /api/payment/webhook/papi
 *
 * Reçoit et valide les notifications de paiement envoyées par Papi.mg.
 *
 * Workflow strict :
 * 1. Parser payload
 * 2. Extraire la référence (merchantPaymentReference | paymentReference | orderId)
 * 3. Récupérer la transaction en DB
 * 4. Valider le notificationToken
 * 5. Valider le montant (normalisé, positif, non-NaN)
 * 6. Valider la devise (ex: MGA)
 * 7. Mapper le statut Papi
 * 8. Vérifier l'idempotence (ne pas traiter 2 fois)
 * 9. Transaction Prisma atomique (PaymentTransaction + Reservation + Notification + Audit)
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => null);

    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // 1. Extraire les données du payload
    const {
      paymentStatus,
      paymentMethod,
      currency,
      amount,
      merchantPaymentReference,
      paymentReference,
      orderId,
      notificationToken,
      token,
    } = payload as Record<string, unknown>;

    // 2. Référence unique (orderId / merchantPaymentReference / paymentReference)
    const reference =
      (typeof merchantPaymentReference === "string" && merchantPaymentReference.trim() !== ""
        ? merchantPaymentReference
        : undefined) ||
      (typeof paymentReference === "string" && paymentReference.trim() !== ""
        ? paymentReference
        : undefined) ||
      (typeof orderId === "string" && orderId.trim() !== ""
        ? orderId
        : undefined);

    if (!reference) {
      console.error("Papi webhook: missing order/payment reference in payload");
      return NextResponse.json(
        { error: "Missing merchantPaymentReference or paymentReference" },
        { status: 400 }
      );
    }

    // 3. Récupérer la transaction de paiement en base de données
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { providerRef: reference },
      include: { reservation: true },
    });

    if (!transaction) {
      console.error(`Papi webhook: transaction not found for reference ${reference}`);
      await prisma.paymentWebhook.create({
        data: {
          provider: "PAPI",
          payload: payload,
          isProcessed: false,
          error: `Transaction not found for ref: ${reference}`,
        },
      });
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // 4. SÉCURITÉ : Validation du notificationToken
    //
    // Selon la documentation officielle Papi.mg :
    //   - POST /payment-links retourne un notificationToken dans la réponse
    //   - Le webhook Papi renvoie ce même notificationToken
    //   - Le serveur doit comparer les deux pour authentifier le webhook
    //
    // IMPORTANT : notificationToken ≠ PAPI_API_KEY
    //   PAPI_API_KEY  = credential serveur pour appeler l'API Papi
    //   notificationToken = secret par-paiement pour valider le webhook
    //
    const receivedToken =
      (typeof notificationToken === "string" && notificationToken.trim() !== ""
        ? notificationToken
        : undefined) ||
      (typeof token === "string" && token.trim() !== ""
        ? token
        : undefined);

    const expectedToken = transaction.notificationToken;

    if (!expectedToken) {
      // Pas de token stocké = impossible de vérifier l'authenticité du webhook
      console.error(
        `Papi webhook: no notificationToken stored for transaction ${transaction.id}. Cannot verify webhook authenticity.`
      );
      await prisma.paymentWebhook.create({
        data: {
          transactionId: transaction.id,
          provider: "PAPI",
          payload: payload,
          isProcessed: false,
          error: "No notificationToken stored — cannot verify webhook authenticity",
        },
      });
      return NextResponse.json(
        { error: "Cannot verify webhook: no stored notificationToken" },
        { status: 401 }
      );
    }

    if (!receivedToken || receivedToken !== expectedToken) {
      console.error(
        `Papi webhook: invalid or missing notificationToken for ref ${reference}`
      );
      await prisma.paymentWebhook.create({
        data: {
          transactionId: transaction.id,
          provider: "PAPI",
          payload: payload,
          isProcessed: false,
          error: "Unauthorized: invalid notificationToken",
        },
      });
      return NextResponse.json(
        { error: "Unauthorized: invalid notificationToken" },
        { status: 401 }
      );
    }

    // 5. Validation du statut Papi
    if (!paymentStatus || typeof paymentStatus !== "string") {
      console.error("Papi webhook: missing paymentStatus");
      return NextResponse.json(
        { error: "Missing paymentStatus" },
        { status: 400 }
      );
    }

    // 6. Validation du montant (numérique, non-NaN, positif, normalisé)
    if (typeof amount === "undefined" || amount === null) {
      return NextResponse.json({ error: "Missing amount in payload" }, { status: 400 });
    }

    const receivedNum = Number(amount);
    if (isNaN(receivedNum) || receivedNum <= 0) {
      console.error(`Papi webhook: invalid amount received (${amount})`);
      return NextResponse.json({ error: "Invalid amount value" }, { status: 400 });
    }

    const expectedAmountInt = Math.round(Number(transaction.amount));
    const receivedAmountInt = Math.round(receivedNum);

    if (expectedAmountInt !== receivedAmountInt) {
      console.error(
        `Papi webhook: amount mismatch for ref ${reference}. Expected ${expectedAmountInt}, received ${receivedAmountInt}`
      );
      await prisma.paymentWebhook.create({
        data: {
          transactionId: transaction.id,
          provider: "PAPI",
          payload: payload,
          isProcessed: false,
          error: `Amount mismatch: expected ${expectedAmountInt}, received ${receivedAmountInt}`,
        },
      });
      return NextResponse.json(
        { error: "Amount mismatch" },
        { status: 400 }
      );
    }

    // 7. Validation de la devise
    if (typeof currency !== "string" || currency.trim().toUpperCase() !== transaction.currency.toUpperCase()) {
      console.error(
        `Papi webhook: currency mismatch for ref ${reference}. Expected ${transaction.currency}, received ${currency}`
      );
      await prisma.paymentWebhook.create({
        data: {
          transactionId: transaction.id,
          provider: "PAPI",
          payload: payload,
          isProcessed: false,
          error: `Currency mismatch: expected ${transaction.currency}, received ${currency}`,
        },
      });
      return NextResponse.json(
        { error: "Currency mismatch" },
        { status: 400 }
      );
    }

    // 8. Mapping du statut Papi vers le statut interne
    let newStatus: PaymentStatus;
    switch ((paymentStatus as string).toUpperCase()) {
      case "SUCCESS":
        newStatus = PaymentStatus.PAID;
        break;
      case "FAILED":
        newStatus = PaymentStatus.FAILED;
        break;
      case "EXPIRED":
        newStatus = PaymentStatus.EXPIRED;
        break;
      case "CANCELLED":
        newStatus = PaymentStatus.CANCELLED;
        break;
      default:
        newStatus = PaymentStatus.PENDING;
    }

    // 9. IDEMPOTENCE : si la transaction est déjà dans le statut cible ou déjà PAID
    if (transaction.status === newStatus || transaction.status === PaymentStatus.PAID) {
      await prisma.paymentWebhook.create({
        data: {
          transactionId: transaction.id,
          provider: "PAPI",
          payload: payload,
          isProcessed: true,
          error: transaction.status === PaymentStatus.PAID ? "Transaction already PAID (idempotent)" : "Already in target status",
        },
      });
      return NextResponse.json({
        success: true,
        message: "Already processed (idempotent)",
      });
    }

    // 10. Transaction Prisma atomique
    const providerPaymentMethodStr =
      typeof paymentMethod === "string" && paymentMethod.trim() !== ""
        ? paymentMethod.trim().toUpperCase()
        : null;

    await prisma.$transaction(async (tx) => {
      // 10a. Mettre à jour la transaction de paiement
      await tx.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: newStatus,
          providerPaymentMethod: providerPaymentMethodStr,
        },
      });

      // 10b. Si payé : mettre à jour la réservation + notification
      if (newStatus === PaymentStatus.PAID) {
        await tx.reservation.update({
          where: { id: transaction.reservationId },
          data: { status: ReservationStatus.PAYEE },
        });

        await tx.notification.create({
          data: {
            userId: transaction.userId,
            titre: "Paiement confirmé",
            message: `Votre paiement pour la réservation #${transaction.reservationId} (${providerPaymentMethodStr || "Papi"}) a été confirmé avec succès. Bon voyage !`,
          },
        });
      }

      // 10c. Si échoué ou expiré : notification client
      if (
        newStatus === PaymentStatus.FAILED ||
        newStatus === PaymentStatus.EXPIRED
      ) {
        const statusLabel =
          newStatus === PaymentStatus.FAILED ? "échoué" : "expiré";
        await tx.notification.create({
          data: {
            userId: transaction.userId,
            titre: `Paiement ${statusLabel}`,
            message: `Le paiement pour la réservation #${transaction.reservationId} a ${statusLabel}. Vous pouvez réassocier une nouvelle tentative depuis votre espace réservation.`,
          },
        });
      }

      // 10d. Log de la transaction
      await tx.paymentLog.create({
        data: {
          transactionId: transaction.id,
          action: `WEBHOOK_${(paymentStatus as string).toUpperCase()}`,
          data: payload,
        },
      });

      // 10e. Sauvegarder le webhook traité
      await tx.paymentWebhook.create({
        data: {
          transactionId: transaction.id,
          provider: "PAPI",
          payload: payload,
          isProcessed: true,
        },
      });
    });

    return NextResponse.json({ success: true, message: "Webhook processed successfully" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erreur webhook Papi";
    console.error("Papi webhook error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
