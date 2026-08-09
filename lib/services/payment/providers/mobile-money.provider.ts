import { PaymentStatus, type Prisma } from "@prisma/client";
import { IPaymentProvider, PaymentOptions, PaymentResult, WebhookResult } from "@/types/payment.types";

export class MobileMoneyProvider implements IPaymentProvider {
  async createCharge(amount: number, currency: string, options: PaymentOptions): Promise<PaymentResult> {
    const providerRef = `MM-${Date.now()}-${options.reservationId}`;

    return {
      success: true,
      providerRef,
      checkoutUrl: `https://pay.mobilemoney.local/checkout/${providerRef}`,
      instructions: `Veuillez valider le paiement via votre application mobile money. Référence : ${providerRef}`,
    };
  }

  async verifyPayment(providerRef: string): Promise<{ status: PaymentStatus; amount?: number }> {
    return { status: PaymentStatus.PAID, amount: 100 };
  }

  async handleWebhook(payload: Record<string, unknown>, headers: Record<string, string>): Promise<WebhookResult> {
    const status = payload.status === "SUCCESS" ? PaymentStatus.PAID : PaymentStatus.PENDING;

    return {
      providerRef: typeof payload.providerRef === "string" ? payload.providerRef : "",
      status,
      raw: payload as Prisma.InputJsonValue,
    };
  }

  async refund(providerRef: string, amount: number): Promise<boolean> {
    return true;
  }
}
