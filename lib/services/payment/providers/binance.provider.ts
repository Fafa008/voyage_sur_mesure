import { PaymentStatus, type Prisma } from "@prisma/client";
import { IPaymentProvider, PaymentOptions, PaymentResult, WebhookResult } from "@/types/payment.types";

export class BinanceProvider implements IPaymentProvider {
  async createCharge(amount: number, currency: string, options: PaymentOptions): Promise<PaymentResult> {
    // Simulation d'un appel API vers Binance Pay
    const providerRef = `BINANCE-${Date.now()}-${options.reservationId}`;
    
    return {
      success: true,
      providerRef,
      checkoutUrl: `https://pay.binance.com/checkout/${providerRef}`,
      qrCodeUrl: `https://pay.binance.com/qr/${providerRef}`,
    };
  }

  async verifyPayment(providerRef: string): Promise<{ status: PaymentStatus; amount?: number }> {
    // Simulation de vérification (dans la vraie vie, appel API de l'ordre)
    return { status: PaymentStatus.PAID, amount: 100 };
  }

  async handleWebhook(payload: Record<string, unknown>, headers: Record<string, string>): Promise<WebhookResult> {
    // Simulation de validation d'un webhook (vérifier la signature)
    const bizId = typeof payload.bizId === "string" ? payload.bizId : "";
    const bizStatus = typeof payload.bizStatus === "string" ? payload.bizStatus : undefined;

    let status: PaymentStatus = PaymentStatus.PENDING;
    if (bizStatus === "PAY_SUCCESS") status = PaymentStatus.PAID;
    if (bizStatus === "PAY_CLOSED") status = PaymentStatus.CANCELLED;

    return {
      providerRef: bizId,
      status,
      raw: payload as Prisma.InputJsonValue,
    };
  }

  async refund(providerRef: string, amount: number): Promise<boolean> {
    // Simulation API Refund
    return true;
  }
}
