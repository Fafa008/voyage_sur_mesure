"use server";

import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { paymentService } from "@/lib/services/payment/payment.service";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PaymentResult } from "@/types/payment.types";

export async function initiatePaymentAction(
  reservationId: number,
  method: PaymentMethod,
  userId: string
) {
  try {
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
        error: result.error || "Échec de l'initialisation du paiement",
      };
    }

    revalidatePath(`/paiement/${reservationId}`);

    // Ne jamais envoyer le token Papi au navigateur
    const { notificationToken: _removed, ...safeResult } = result;

    console.log(
      `[initiatePaymentAction] Payment initialized: checkoutUrl=${!!safeResult.checkoutUrl}`
    );

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
        paymentResult,
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
    const { prisma } = await import("@/lib/prisma");
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) throw new Error("Transaction non trouvée");

    return { success: true, data: { status: transaction.status } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markBankTransferAsPaidAction(transactionId: string) {
  try {
    await paymentService.updateTransactionStatus(transactionId, PaymentStatus.PAID);
    revalidatePath("/admin/paiements");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
