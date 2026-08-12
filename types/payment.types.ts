import { PaymentStatus, type Prisma } from "@prisma/client";

export interface PaymentOptions {
  reservationId: number;
  userId: string;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
  clientName?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  providerRef?: string;
  checkoutUrl?: string;
  qrCodeUrl?: string;
  instructions?: string;
  notificationToken?: string;
  expiresAt?: Date;
  error?: string;
}

export interface WebhookResult {
  providerRef: string;
  status: PaymentStatus;
  notificationToken?: string;
  providerPaymentMethod?: string;
  raw: Prisma.InputJsonValue;
}

export interface IPaymentProvider {
  createCharge(amount: number, currency: string, options: PaymentOptions): Promise<PaymentResult>;
  verifyPayment(providerRef: string): Promise<{ status: PaymentStatus; amount?: number }>;
  handleWebhook(payload: Record<string, unknown>, headers: Record<string, string>): Promise<WebhookResult>;
  refund(providerRef: string, amount: number): Promise<boolean>;
}

export interface CreateReservationDTO {
  circuitId?: number;
  devisId?: number;
  userId: string;
  dateDebut?: Date;
  dateFin?: Date;
  nbVoyageurs: number;
  montantFinal: number;
}
