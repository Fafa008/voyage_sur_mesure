import { PaymentStatus, type Prisma } from "@prisma/client";
import { IPaymentProvider, PaymentOptions, PaymentResult, WebhookResult } from "@/types/payment.types";

export class StripeProvider implements IPaymentProvider {
  async createCharge(amount: number, currency: string, options: PaymentOptions): Promise<PaymentResult> {
    const providerRef = `STRIPE-${Date.now()}-${options.reservationId}`;

    return {
      success: true,
      providerRef,
      checkoutUrl: `https://checkout.stripe.com/pay/${providerRef}`,
    };
  }

  async verifyPayment(providerRef: string): Promise<{ status: PaymentStatus; amount?: number }> {
    return { status: PaymentStatus.PAID, amount: 100 };
  }

  async handleWebhook(payload: Record<string, unknown>, headers: Record<string, string>): Promise<WebhookResult> {
    const event = typeof payload.event === "string" ? payload.event : "payment_intent.succeeded";
    const status = event === "payment_intent.succeeded" ? PaymentStatus.PAID : PaymentStatus.PENDING;

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
