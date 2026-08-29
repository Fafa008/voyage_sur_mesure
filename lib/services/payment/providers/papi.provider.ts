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
 * Gestion des paiements via Papi.mg :
 * - MVola
 * - Orange Money
 * - Airtel Money
 * - Carte bancaire
 *
 * Endpoint :
 * POST https://app.papi.mg/dashboard/api/payment-links
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

    this.apiKey = apiKey.trim();
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  /**
   * Création d'un lien de paiement Papi.
   */
  async createCharge(
    amount: number,
    currency: string,
    options: PaymentOptions
  ): Promise<PaymentResult> {
    const orderId = `RES-${options.reservationId}-${Date.now()}`;

    const appUrl =
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://monvoyage.com";

    const successUrl =
      options.returnUrl ||
      `${appUrl}/paiement/${options.reservationId}/confirmation`;

    const failureUrl =
      options.cancelUrl ||
      `${appUrl}/paiement/${options.reservationId}`;

    const notificationUrl =
      process.env.PAPI_WEBHOOK_URL ||
      `${appUrl}/api/payment/webhook/papi`;

    const validDuration =
      Number(process.env.PAYMENT_EXPIRATION_MINUTES) || 15;

    // Mode test : activé par défaut hors production, contrôlable via PAPI_TEST_MODE.
    const isTestMode = process.env.PAPI_TEST_MODE
      ? process.env.PAPI_TEST_MODE === "true"
      : process.env.NODE_ENV !== "production";

    const requestBody = {
      amount,
      clientName: options.clientName || "Client Mon Voyage",
      reference: orderId,
      description: (
        options.description ||
        `Paiement Réservation #${options.reservationId}`
      ).substring(0, 255),
      successUrl,
      failureUrl,
      notificationUrl,
      validDuration,
      ...(isTestMode
        ? {
            isTestMode: true,
            testReason: `Test intégration réservation #${options.reservationId}`,
          }
        : {}),
    };

    try {
      const endpoint = `${this.baseUrl}/payment-links`;


      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Token: this.apiKey,
        },
        body: JSON.stringify({
          ...requestBody,
          currency,
        }),
      });

      const responseText = await response.text();

      let responseData: Record<string, unknown>;

      try {
        responseData = JSON.parse(responseText);
      } catch {

        return {
          success: false,
          error: "Papi returned an invalid JSON response",
        };
      }

      /**
       * Gestion des erreurs HTTP.
       */
      if (!response.ok) {

        const apiError = responseData.error;

        let errorMessage = "Payment link creation failed";

        if (
          apiError &&
          typeof apiError === "object" &&
          "message" in apiError &&
          typeof apiError.message === "string"
        ) {
          errorMessage = apiError.message;
        }

        return {
          success: false,
          error: `Papi API returned ${response.status}: ${errorMessage}`,
        };
      }

      /**
       * Papi retourne actuellement :
       *
       * {
       *   "data": {
       *     "paymentLink": "...",
       *     "paymentReference": "...",
       *     "notificationToken": "...",
       *     "linkExpirationDateTime": "..."
       *   }
       * }
       */
      const papiData =
        responseData.data &&
        typeof responseData.data === "object"
          ? (responseData.data as Record<string, unknown>)
          : responseData;


      /**
       * Récupération du lien de paiement.
       */
      const checkoutUrl =
        typeof papiData.paymentLink === "string"
          ? papiData.paymentLink
          : typeof papiData.paymentUrl === "string"
            ? papiData.paymentUrl
            : undefined;

      if (!checkoutUrl) {

        return {
          success: false,
          error: "Papi API response missing paymentLink",
        };
      }

      /**
       * Référence marchand (providerRef).
       *
       * Toujours `orderId` : Papi la renvoie dans le webhook sous
       * `merchantPaymentReference`, et c'est cette clé qui sert à retrouver
       * la transaction côté serveur. Si on stockait la référence interne
       * Papi, le webhook ne retrouverait plus la transaction.
       */
      const providerRef = orderId;

      /**
       * Token utilisé pour les notifications/webhooks.
       */
      const notificationToken =
        typeof papiData.notificationToken === "string"
          ? papiData.notificationToken
          : typeof papiData.token === "string"
            ? papiData.token
            : undefined;

      /**
       * Date d'expiration.
       *
       * Fallback : 15 minutes.
       */
      let expiresAt = new Date(
        Date.now() + validDuration * 60 * 1000
      );

      if (
        typeof papiData.linkExpirationDateTime === "string"
      ) {
        const parsedDate = new Date(
          papiData.linkExpirationDateTime
        );

        if (!Number.isNaN(parsedDate.getTime())) {
          expiresAt = parsedDate;
        }
      }


      return {
        success: true,
        providerRef,
        checkoutUrl,
        notificationToken,
        expiresAt,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);


      return {
        success: false,
        error: `Papi connection error: ${message}`,
      };
    }
  }

  /**
   * Vérification du paiement.
   *
   * Le statut final est normalement reçu via webhook Papi.
   */
  async verifyPayment(
    _providerRef: string
  ): Promise<{
    status: PaymentStatus;
    amount?: number;
  }> {

    return {
      status: PaymentStatus.PENDING,
    };
  }

  /**
   * Traitement du webhook Papi.
   */
  async handleWebhook(
    payload: Record<string, unknown>,
    _headers: Record<string, string>
  ): Promise<WebhookResult> {
    const paymentStatus =
      typeof payload.paymentStatus === "string"
        ? payload.paymentStatus
        : undefined;

    const providerRef =
      typeof payload.merchantPaymentReference === "string"
        ? payload.merchantPaymentReference
        : typeof payload.paymentReference === "string"
          ? payload.paymentReference
          : typeof payload.orderId === "string"
            ? payload.orderId
            : undefined;

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

    if (!providerRef) {
      throw new Error(
        "Papi webhook: missing payment reference"
      );
    }

    if (!paymentStatus) {
      throw new Error(
        "Papi webhook: missing paymentStatus"
      );
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
      providerRef,
      status,
      notificationToken,
      providerPaymentMethod,
      raw: payload as Prisma.InputJsonValue,
    };
  }

  /**
   * Papi ne supporte pas actuellement les remboursements
   * automatisés dans cette intégration.
   */
  async refund(
    _providerRef: string,
    _amount: number
  ): Promise<boolean> {
    throw new Error(
      "Papi does not support automated refunds. " +
        "Please process manually via the Papi dashboard."
    );
  }
}
