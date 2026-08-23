import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { paymentService } from "@/lib/services/payment/payment.service";
import { PaymentMethod } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { reservationId, devisId, method } = body;

    if (!method || !Object.values(PaymentMethod).includes(method)) {
      return NextResponse.json({ error: "Méthode de paiement invalide" }, { status: 400 });
    }

    if (devisId) {
      const result = await paymentService.initiateFromDevis(devisId, method as PaymentMethod, session.user.id);
      return NextResponse.json({ success: true, data: result });
    } else if (reservationId) {
      const result = await paymentService.initiatePayment(reservationId, method as PaymentMethod, session.user.id);
      return NextResponse.json({ success: true, data: { reservationId, paymentResult: result } });
    } else {
      return NextResponse.json({ error: "reservationId ou devisId requis" }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
