import { PaymentMethod } from "@prisma/client";
import { IPaymentProvider } from "@/types/payment.types";
import { BinanceProvider } from "./providers/binance.provider";
import { BankTransferProvider } from "./providers/bank-transfer.provider";

export class PaymentFactory {
  static getProvider(method: PaymentMethod): IPaymentProvider {
    switch (method) {
      case PaymentMethod.BINANCE_PAY:
        return new BinanceProvider();
      case PaymentMethod.BANK_TRANSFER:
        return new BankTransferProvider();
      // Stripe, Paypal etc à rajouter ici dans le futur
      default:
        throw new Error(`Payment method ${method} is not supported yet.`);
    }
  }
}
