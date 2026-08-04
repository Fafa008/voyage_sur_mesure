"use server";

import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { paymentService } from "@/lib/services/payment/payment.service";
import { revalidatePath } from "next/cache";

export async function initiatePaymentAction(reservationId: number, method: PaymentMethod, userId: string) {
  try {
    const result = await paymentService.initiatePayment(reservationId, method, userId);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Erreur d'initiation du paiement:", error);
    return { success: false, error: error.message };
  }
}

export async function checkPaymentStatusAction(transactionId: string) {
  try {
    // Ideally we would query the provider or our DB
    // For now we just query our DB if the webhook processed it
    const { prisma } = await import("@/lib/prisma");
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId }
    });
    
    if (!transaction) throw new Error("Transaction non trouvée");
    
    return { success: true, data: { status: transaction.status } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markBankTransferAsPaidAction(transactionId: string) {
  try {
    // Action réservée à l'administrateur
    await paymentService.updateTransactionStatus(transactionId, PaymentStatus.PAID);
    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
