import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, ReservationStatus } from "@prisma/client";
import { expirationService } from "@/lib/services/payment/expiration.service";

/**
 * Comparaison de chaînes à temps constant pour éviter les timing attacks.
 * Empêche l'attente par mesurage du temps de réponse pour deviner le token.
 */
function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) {
    const maxLen = Math.max(bufA.length, bufB.length);
    const paddedA = Buffer.alloc(maxLen, 0);
    const paddedB = Buffer.alloc(maxLen, 0);
    bufA.copy(paddedA);
    bufB.copy(paddedB);
    const result = crypto.timingSafeEqual(paddedA, paddedB);
    return result && bufA.length === bufB.length;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

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
      console.log("[PAPI WEBHOOK] Transaction inexistante pour ref:", reference);
      await prisma.paymentWebhook.create({
        data: {
          provider: "PAPI",
          payload: JSON.parse(JSON.stringify(payload)),
          isProcessed: false,
          error: `Transaction not found for ref: ${reference}`,
        },
      });
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    console.log("[PAPI WEBHOOK] Transaction trouvée:", transaction.id);

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
      console.log("[PAPI WEBHOOK] Notification rejetée: aucun token stocké en base");
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

    if (!receivedToken || !timingSafeCompare(receivedToken, expectedToken)) {
      console.log("[PAPI WEBHOOK] Token invalide — webhook rejeté");
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

    console.log("[PAPI WEBHOOK] Token valide");

    // 5. Validation du statut Papi
    if (!paymentStatus || typeof paymentStatus !== "string") {
      console.log("[PAPI WEBHOOK] Notification rejetée: paymentStatus manquant");
      return NextResponse.json(
        { error: "Missing paymentStatus" },
        { status: 400 }
      );
    }

    // 6. Validation du montant (numérique, non-NaN, positif, normalisé)
    if (typeof amount === "undefined" || amount === null) {
      console.log("[PAPI WEBHOOK] Notification rejetée: montant manquant");
      return NextResponse.json({ error: "Missing amount in payload" }, { status: 400 });
    }

    const receivedNum = Number(amount);
    if (isNaN(receivedNum) || receivedNum <= 0) {
      return NextResponse.json({ error: "Invalid amount value" }, { status: 400 });
    }

    const expectedAmountInt = Math.round(Number(transaction.amount));
    const receivedAmountInt = Math.round(receivedNum);

    if (expectedAmountInt !== receivedAmountInt) {
      console.log("[PAPI WEBHOOK] Montant invalide: attendu", expectedAmountInt, "reçu", receivedAmountInt);
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
      console.log("[PAPI WEBHOOK] Devise invalide: attendue", transaction.currency, "reçue", currency);
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

    // 9. Transaction Prisma atomique (idempotence vérifiée atomiquement)
    const providerPaymentMethodStr =
      typeof paymentMethod === "string" && paymentMethod.trim() !== ""
        ? paymentMethod.trim().toUpperCase()
        : null;

    await prisma.$transaction(async (tx) => {
      // 9a. Vérification idempotente atomique : updateMany avec condition
      //     Si la transaction est déjà PAID ou déjà dans le statut cible, count === 0
      const updated = await tx.paymentTransaction.updateMany({
        where: {
          id: transaction.id,
          status: { notIn: [PaymentStatus.PAID, newStatus] },
        },
        data: {
          status: newStatus,
          providerPaymentMethod: providerPaymentMethodStr,
        },
      });

      if (updated.count === 0) {
        console.log("[PAPI WEBHOOK] Déjà traité (idempotent) — statut actuel:", transaction.status);
        return;
      }

      // 9b. Si payé : vérifier si l'expiration a déjà libéré les places (paiement tardif)
      if (newStatus === PaymentStatus.PAID) {
        const currentRes = await tx.reservation.findUnique({
          where: { id: transaction.reservationId }
        });

        if (currentRes?.placesReleasedAt) {
          // P1.1 — Paiement tardif reçu alors que les places ont été libérées et la réservation expirée.
          // La transaction passe à PAID pour la traçabilité comptable, mais la réservation reste marquée
          // et une alerte est créée pour traitement administratif sans forcer un état incohérent.
          console.warn(`[PAPI WEBHOOK] Webhook PAID tardif reçu pour réservation #${transaction.reservationId} (places déjà libérées)`);
          await tx.notification.create({
            data: {
              userId: transaction.userId,
              titre: "Paiement reçu — Traitement en cours",
              message: `Votre paiement pour la réservation #${transaction.reservationId} a été reçu après l'expiration. Notre équipe prend contact avec vous.`,
            },
          });
        } else {
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

        // P1.1 — Création automatique de la facture (Invoice) si absente
        const existingInvoice = await tx.invoice.findFirst({
          where: { reservationId: transaction.reservationId }
        });

        if (!existingInvoice && transaction.amount) {
          await tx.invoice.create({
            data: {
              numeroFacture: `FAC-${transaction.reservationId}-${Date.now()}`,
              status: "PAID",
              amount: transaction.amount,
              totalAmount: transaction.amount,
              reservationId: transaction.reservationId,
              userId: transaction.userId,
            }
          });
        }
      }

      // 9c. Si échoué, expiré ou annulé : libérer les places + notification client
      if (
        newStatus === PaymentStatus.FAILED ||
        newStatus === PaymentStatus.EXPIRED ||
        newStatus === PaymentStatus.CANCELLED
      ) {
        // P0.3 / P1.1 — Libération atomique des places du circuit.
        // expirationService.expireReservation() gère l'idempotence via
        // Reservation.placesReleasedAt et protège les réservations PAYEE.
        await expirationService.expireReservation(
          transaction.reservationId,
          transaction.id,
          tx,
        );

        let statusLabel = "expiré";
        if (newStatus === PaymentStatus.FAILED) statusLabel = "échoué";
        if (newStatus === PaymentStatus.CANCELLED) statusLabel = "annulé";

        await tx.notification.create({
          data: {
            userId: transaction.userId,
            titre: `Paiement ${statusLabel}`,
            message: `Le paiement pour la réservation #${transaction.reservationId} a ${statusLabel}. Vous pouvez réassocier une nouvelle tentative depuis votre espace réservation.`,
          },
        });
      }

      // 9d. Log de la transaction
      await tx.paymentLog.create({
        data: {
          transactionId: transaction.id,
          action: `WEBHOOK_${(paymentStatus as string).toUpperCase()}`,
          data: payload,
        },
      });

      // 9e. Sauvegarder le webhook traité
      await tx.paymentWebhook.create({
        data: {
          transactionId: transaction.id,
          provider: "PAPI",
          payload: payload,
          isProcessed: true,
        },
      });
    });

    console.log("[PAPI WEBHOOK] Webhook traité avec succès — statut:", newStatus);

    return NextResponse.json({ success: true, message: "Webhook processed successfully" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erreur webhook Papi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
