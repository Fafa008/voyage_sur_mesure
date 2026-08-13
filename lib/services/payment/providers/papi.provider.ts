// lib/services/payment/providers/papi.provider.ts
import { PaymentStatus, type Prisma } from "@prisma/client";
import {
  IPaymentProvider,
  PaymentOptions,
  PaymentResult,
  WebhookResult,
} from "@/types/payment.types";

/**
 * Papi.mg Payment Provider
 *
 * Intègre l'API Papi.mg pour accepter les paiements en ligne à Madagascar :
 * MVola, Orange Money, Airtel Money, Carte bancaire.
 *
 * Documentation officielle : https://papi.mg
 * Endpoint : POST https://app.papi.mg/dashboard/api/payment-links
 */
export class PapiProvider implements IPaymentProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    const apiKey = process.env.PAPI_API_KEY;
    const baseUrl = process.env.PAPI_BASE_URL;

    if (!apiKey || apiKey.trim() === "") {
      throw new Error(
        "Papi payment provider is not configured: PAPI_API_KEY is missing"
      );
    }

    if (!baseUrl || baseUrl.trim() === "") {
      throw new Error(
        "Papi payment provider is not configured: PAPI_BASE_URL is missing"
      );
    }

    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Crée un lien de paiement Papi.
   *
   * POST /payment-links
   * Headers: { Token: <API_KEY>, Content-Type: application/json }
   * Body: { amount, currency, orderId, successUrl, failureUrl, notificationUrl, validDuration }
   * Response: { paymentUrl: "https://app.papi.mg/pay/...", notificationToken?: string, linkExpirationDateTime?: string }
   */
  async createCharge(
    amount: number,
    currency: string,
    options: PaymentOptions
  ): Promise<PaymentResult> {
    const orderId = `RES-${options.reservationId}-${Date.now()}`;
    const appUrl = process.env.APP_URL || "http://localhost:3000";

    const successUrl =
      options.returnUrl ||
      `${appUrl}/paiement/${options.reservationId}/confirmation`;
    const failureUrl =
      options.cancelUrl || `${appUrl}/paiement/${options.reservationId}`;
    const notificationUrl = `${appUrl}/api/payment/webhook/papi`;
    const validDuration = 15; // 15 minutes d'expiration demandées à Papi

    try {
      const response = await fetch(`${this.baseUrl}/payment-links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Token: this.apiKey,
        },
        body: JSON.stringify({
          amount,
          currency,
          reference: orderId, // Papi requires reference
          orderId,            // Kept for backward compatibility
          clientName: options.clientName || "Client Mon Voyage",
          description: (options.description || `Paiement Réservation #${options.reservationId}`).substring(0, 255),
          successUrl,
          failureUrl,
          notificationUrl,
          validDuration,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        console.error(
          `Papi API error: ${response.status} ${response.statusText}`,
          errorText
        );
        return {
          success: false,
          error: `Papi API returned ${response.status}: payment link creation failed`,
        };
      }

      const data = await response.json();

      // Log les clés de la réponse Papi pour diagnostic Sandbox (sans valeurs sensibles)
      console.log(
        "[PAPI] /payment-links response keys:",
        Object.keys(data)
      );
      console.log(
        `[PAPI] Response received for reservation ${options.reservationId}`
      );

      // Papi peut retourner paymentUrl ou paymentLink selon la version
      const checkoutUrl = data.paymentUrl || data.paymentLink;

      if (!checkoutUrl) {
        console.error(
          `[PAPI] ERROR: Response missing paymentUrl/paymentLink. Keys: ${Object.keys(data).join(", ")}`
        );
        return {
          success: false,
          error: "Papi API response missing paymentUrl/paymentLink",
        };
      }

      console.log(
        `[PAPI] checkoutUrl extracted successfully for orderId ${orderId}`
      );

      // Extraction optionnelle du token de notification ou de la date d'expiration si fournie par Papi
      const notificationToken =
        typeof data.notificationToken === "string"
          ? data.notificationToken
          : typeof data.token === "string"
            ? data.token
            : undefined;

      let expiresAt = new Date(Date.now() + validDuration * 60 * 1000);
      if (typeof data.linkExpirationDateTime === "string") {
        const parsedDate = new Date(data.linkExpirationDateTime);
        if (!isNaN(parsedDate.getTime())) {
          expiresAt = parsedDate;
        }
      }

      const result = {
        success: true,
        providerRef: orderId,
        checkoutUrl,
        notificationToken,
        expiresAt,
      };

      console.log(
        `[PAPI] SUCCESS: Created payment link. providerRef=${orderId}, hasCheckoutUrl=${!!checkoutUrl}, hasNotificationToken=${!!notificationToken}`
      );

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[PAPI] ERROR in createCharge: ${errorMsg}`);
      return {
        success: false,
        error:
          error instanceof Error
            ? `Papi connection error: ${error.message}`
            : "Papi connection error",
      };
    }
  }

  /**
   * Vérification de paiement.
   * Le statut est notifié via webhook par Papi.
   */
  async verifyPayment(
    providerRef: string
  ): Promise<{ status: PaymentStatus; amount?: number }> {
    return { status: PaymentStatus.PENDING };
  }

  /**
   * Traite le webhook Papi.
   *
   * Payload attendu de Papi :
   * {
   *   paymentStatus: "SUCCESS" | "FAILED" | "EXPIRED" | "CANCELLED",
   *   paymentMethod?: "MVOLA" | "ORANGE_MONEY" | "AIRTEL_MONEY" | "VISA",
   *   currency: "MGA",
   *   amount: 4500000,
   *   merchantPaymentReference?: "RES-145-...",
   *   paymentReference?: "PAPI_...",
   *   notificationToken: "..."
   * }
   */
  async handleWebhook(
    payload: Record<string, unknown>,
    headers: Record<string, string>
  ): Promise<WebhookResult> {
    const paymentStatus =
      typeof payload.paymentStatus === "string"
        ? payload.paymentStatus
        : undefined;

    const reference =
      (typeof payload.merchantPaymentReference === "string"
        ? payload.merchantPaymentReference
        : undefined) ||
      (typeof payload.paymentReference === "string"
        ? payload.paymentReference
        : undefined) ||
      (typeof payload.orderId === "string"
        ? payload.orderId
        : undefined);

    const notificationToken =
      typeof payload.notificationToken === "string"
        ? payload.notificationToken
        : typeof payload.token === "string"
          ? payload.token
          : undefined;

    const providerPaymentMethod =
      typeof payload.paymentMethod === "string"
        ? payload.paymentMethod
        : typeof payload.providerPaymentMethod === "string"
          ? payload.providerPaymentMethod
          : undefined;

    if (!reference) {
      throw new Error("Papi webhook: missing order/payment reference in payload");
    }

    if (!paymentStatus) {
      throw new Error("Papi webhook: missing paymentStatus in payload");
    }

    let status: PaymentStatus;
    switch (paymentStatus.toUpperCase()) {
      case "SUCCESS":
        status = PaymentStatus.PAID;
        break;
      case "FAILED":
        status = PaymentStatus.FAILED;
        break;
      case "EXPIRED":
        status = PaymentStatus.EXPIRED;
        break;
      case "CANCELLED":
        status = PaymentStatus.CANCELLED;
        break;
      default:
        status = PaymentStatus.PENDING;
    }

    return {
      providerRef: reference,
      status,
      notificationToken,
      providerPaymentMethod,
      raw: payload as Prisma.InputJsonValue,
    };
  }

  async refund(providerRef: string, amount: number): Promise<boolean> {
    throw new Error(
      "Papi does not support automated refunds. Please process manually via the Papi dashboard."
    );
  }
}
