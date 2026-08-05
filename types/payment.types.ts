import { PaymentMethod, PaymentStatus, Reservation, PaymentTransaction, Invoice } from "@prisma/client";

export interface PaymentOptions {
  reservationId: number;
  userId: string;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  providerRef?: string;
  checkoutUrl?: string;
  qrCodeUrl?: string;
  instructions?: string;
  error?: string;
}

export interface WebhookResult {
  providerRef: string;
  status: PaymentStatus;
  raw: any;
}

export interface IPaymentProvider {
  createCharge(amount: number, currency: string, options: PaymentOptions): Promise<PaymentResult>;
  verifyPayment(providerRef: string): Promise<{ status: PaymentStatus; amount?: number }>;
  handleWebhook(payload: any, headers: any): Promise<WebhookResult>;
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
