"use server";

import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { paymentService } from "@/lib/services/payment/payment.service";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PaymentResult } from "@/types/payment.types";

export async function initiatePaymentAction(reservationId: number, method: PaymentMethod, userId: string) {
  try {
    const result = await paymentService.initiatePayment(reservationId, method, userId);
    revalidatePath(`/paiement/${reservationId}`);

    // SÉCURITÉ : Ne jamais propager notificationToken vers le frontend
    // Le notificationToken est un secret par-paiement stocké côté serveur uniquement
    const { notificationToken: _removed, ...safeResult } = result;
    return { success: true, data: safeResult };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Erreur d'initiation du paiement:", error);
    return { success: false, error: message };
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
