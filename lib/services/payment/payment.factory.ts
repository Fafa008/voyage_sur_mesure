import { PaymentMethod } from "@prisma/client";
import { IPaymentProvider } from "@/types/payment.types";
import { BinanceProvider } from "./providers/binance.provider";
import { BankTransferProvider } from "./providers/bank-transfer.provider";
import { StripeProvider } from "./providers/stripe.provider";
import { MobileMoneyProvider } from "./providers/mobile-money.provider";

export class PaymentFactory {
  static getProvider(method: PaymentMethod): IPaymentProvider {
    switch (method) {
      case PaymentMethod.BINANCE_PAY:
        return new BinanceProvider();
      case PaymentMethod.BANK_TRANSFER:
        return new BankTransferProvider();
      case PaymentMethod.STRIPE:
        return new StripeProvider();
      case PaymentMethod.MOBILE_MONEY:
        return new MobileMoneyProvider();
      default:
        throw new Error(`Payment method ${method} is not supported yet.`);
    }
  }
}
