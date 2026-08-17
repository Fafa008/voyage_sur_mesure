"use server";

import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { paymentService } from "@/lib/services/payment/payment.service";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { PaymentResult } from "@/types/payment.types";

export async function initiatePaymentAction(
  reservationId: number,
  method: PaymentMethod,
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Non authentifié" };

    const userId = session.user.id;

    console.log(
      `[initiatePaymentAction] Starting for reservation=${reservationId}, method=${method}`
    );

    const result = await paymentService.initiatePayment(
      reservationId,
      method,
      userId
    );

    console.log(
      `[initiatePaymentAction] Service returned: success=${result.success}, hasCheckoutUrl=${!!result.checkoutUrl}, transactionId=${result.transactionId}`
    );

    if (!result.success) {
      console.error(
        `[initiatePaymentAction] Payment failed: ${result.error}`
      );

      return {
        success: false,
        error: result.error || "Impossible de créer le paiement PAPI",
      };
    }

    // Whitelist des champs renvoyés au navigateur : le notificationToken
    // (secret par-paiement servant à valider le webhook) n'est jamais propagé.
    const safeResult: PaymentResult = {
      success: true,
      transactionId: result.transactionId,
      providerRef: result.providerRef,
      checkoutUrl: result.checkoutUrl,
      expiresAt: result.expiresAt,
    };

    console.log(
      `[initiatePaymentAction] Payment created: checkoutUrl=${!!safeResult.checkoutUrl}, transactionId=${safeResult.transactionId}`
    );

    revalidatePath(`/paiement/${reservationId}`);

    return {
      success: true,
      data: safeResult,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";

    console.error(`[initiatePaymentAction] ERROR: ${message}`);

    return {
      success: false,
      error: message,
    };
  }
}

export async function initiatePaymentFromDevisAction(devisId: number, method: PaymentMethod) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Non authentifié" };

    const { reservationId, paymentResult } = await paymentService.initiateFromDevis(
      devisId,
      method,
      session.user.id
    );

    revalidatePath("/dashboard");
    revalidatePath(`/devis/${devisId}`);
    revalidatePath(`/reservations`);

    return {
      success: true,
      data: {
        reservationId,
        paymentResult: {
          success: paymentResult.success,
          transactionId: paymentResult.transactionId,
          providerRef: paymentResult.providerRef,
          checkoutUrl: paymentResult.checkoutUrl,
          expiresAt: paymentResult.expiresAt,
        },
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Erreur initiation paiement devis:", error);
    return { success: false, error: message };
  }
}

export async function checkPaymentStatusAction(transactionId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Non authentifié" };

    const { prisma } = await import("@/lib/prisma");
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) throw new Error("Transaction non trouvée");

    if (transaction.userId !== session.user.id) {
      return { success: false, error: "Accès refusé" };
    }

    return { success: true, data: { status: transaction.status } };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: message };
  }
}

export async function markBankTransferAsPaidAction(transactionId: string) {
  try {
    const { requireAdmin } = await import("@/lib/admin-auth");
    await requireAdmin();

    await paymentService.updateTransactionStatus(transactionId, PaymentStatus.PAID);
    revalidatePath("/admin/paiements");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: message };
  }
}
