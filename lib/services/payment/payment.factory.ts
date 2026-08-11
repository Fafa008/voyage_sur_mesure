import { PaymentMethod } from "@prisma/client";
import { IPaymentProvider } from "@/types/payment.types";
import { BinanceProvider } from "./providers/binance.provider";
import { BankTransferProvider } from "./providers/bank-transfer.provider";
import { PapiProvider } from "./providers/papi.provider";

export class PaymentFactory {
  static getProvider(method: PaymentMethod): IPaymentProvider {
    switch (method) {
      case PaymentMethod.PAPI:
        return new PapiProvider();
      case PaymentMethod.BINANCE_PAY:
        return new BinanceProvider();
      case PaymentMethod.BANK_TRANSFER:
        return new BankTransferProvider();
      default:
        throw new Error(`Payment method ${method} is not supported yet.`);
    }
  }
}
