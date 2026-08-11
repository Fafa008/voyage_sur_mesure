import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/lib/services/payment/payment.service";
import { PaymentMethod } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const providerUpper = provider.toUpperCase();

    let method: PaymentMethod;
    if (providerUpper === "PAPI") {
      method = PaymentMethod.PAPI;
    } else if (providerUpper === "BINANCE" || providerUpper === "BINANCE_PAY") {
      method = PaymentMethod.BINANCE_PAY;
    } else if (providerUpper === "BANK_TRANSFER") {
      method = PaymentMethod.BANK_TRANSFER;
    } else {
      return NextResponse.json({ error: "Provider inconnu" }, { status: 400 });
    }

    const payload = await req.json();
    const headersObj: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    await paymentService.processWebhook(method, payload, headersObj);

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur Webhook";
    console.error("Erreur Webhook:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
