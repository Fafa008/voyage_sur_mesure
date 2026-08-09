import { PaymentStatus } from "@prisma/client";
import { IPaymentProvider, PaymentOptions, PaymentResult, WebhookResult } from "@/types/payment.types";

export class BankTransferProvider implements IPaymentProvider {
  async createCharge(amount: number, currency: string, options: PaymentOptions): Promise<PaymentResult> {
    // Generate a unique reference for the bank transfer
    const providerRef = `BT-${Date.now()}-${options.reservationId}`;
    
    return {
      success: true,
      providerRef,
      instructions: `Veuillez effectuer un virement de ${amount} ${currency} sur notre compte IBAN: FR76 1234 5678 9101 1121 3141 516. Indiquez la référence ${providerRef} dans le motif.`,
    };
  }

  async verifyPayment(providerRef: string): Promise<{ status: PaymentStatus; amount?: number }> {
    // Dans le cas d'un virement, la vérification est manuelle (ou via API bancaire asynchrone).
    // On retourne PENDING par défaut.
    return { status: PaymentStatus.PENDING };
  }

  async handleWebhook(payload: Record<string, unknown>, headers: Record<string, string>): Promise<WebhookResult> {
    // Normalement pas de webhook pour un virement manuel pur.
    throw new Error("Webhook not supported for Bank Transfer");
  }

  async refund(providerRef: string, amount: number): Promise<boolean> {
    // Le remboursement se fait manuellement
    console.log(`Manual refund required for bank transfer ${providerRef}, amount: ${amount}`);
    return true;
  }
}
