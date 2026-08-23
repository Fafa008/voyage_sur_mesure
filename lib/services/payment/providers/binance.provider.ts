import { PaymentStatus, type Prisma } from "@prisma/client";
import { IPaymentProvider, PaymentOptions, PaymentResult, WebhookResult } from "@/types/payment.types";

export class BinanceProvider implements IPaymentProvider {
  async createCharge(amount: number, currency: string, options: PaymentOptions): Promise<PaymentResult> {
    const providerRef = `BINANCE-${Date.now()}-${options.reservationId}`;
    
    return {
      success: true,
      providerRef,
      checkoutUrl: `https://pay.binance.com/checkout/${providerRef}`,
      qrCodeUrl: `https://pay.binance.com/qr/${providerRef}`,
    };
  }

  async verifyPayment(providerRef: string): Promise<{ status: PaymentStatus; amount?: number }> {
    const apiKey = process.env.BINANCE_API_KEY;
    const apiSecret = process.env.BINANCE_API_SECRET;

    if (!apiKey || !apiSecret) {
      return { status: PaymentStatus.PENDING };
    }

    try {
      const baseUrl = process.env.BINANCE_BASE_URL || "https://bpay.binanceapi.com";
      const response = await fetch(`${baseUrl}/binancepay/v3/order/${providerRef}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "API-KEY": apiKey,
        },
      });

      if (!response.ok) {
          return { status: PaymentStatus.PENDING };
      }

      const data = await response.json() as { status?: string; totalAmount?: string };
      let status: PaymentStatus = PaymentStatus.PENDING;
      if (data.status === "PAID") status = PaymentStatus.PAID;
      else if (data.status === "CLOSED") status = PaymentStatus.CANCELLED;

      const amount = data.totalAmount ? Number(data.totalAmount) : undefined;
      return { status, amount };
    } catch (error) {
      return { status: PaymentStatus.PENDING };
    }
  }

  async handleWebhook(payload: Record<string, unknown>, headers: Record<string, string>): Promise<WebhookResult> {
    const bizId = typeof payload.bizId === "string" ? payload.bizId : "";
    const bizStatus = typeof payload.bizStatus === "string" ? payload.bizStatus : undefined;

    let status: PaymentStatus = PaymentStatus.PENDING;
    if (bizStatus === "PAY_SUCCESS") status = PaymentStatus.PAID;
    else if (bizStatus === "PAY_CLOSED") status = PaymentStatus.CANCELLED;

    return {
      providerRef: bizId,
      status,
      raw: payload as Prisma.InputJsonValue,
    };
  }

  async refund(providerRef: string, amount: number): Promise<boolean> {
    const apiKey = process.env.BINANCE_API_KEY;
    const apiSecret = process.env.BINANCE_API_SECRET;

    if (!apiKey || !apiSecret) {
      return false;
    }

    try {
      const baseUrl = process.env.BINANCE_BASE_URL || "https://bpay.binanceapi.com";
      const merchantId = process.env.BINANCE_MERCHANT_ID;
      const response = await fetch(`${baseUrl}/binancepay/v3/order/${providerRef}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "API-KEY": apiKey,
        },
        body: JSON.stringify({
          merchantId,
          refundAmount: amount,
        }),
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
