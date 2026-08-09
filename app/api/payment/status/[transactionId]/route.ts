import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { transactionId } = await params;

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { reservation: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction non trouvée" }, { status: 404 });
    }

    if (transaction.userId !== session.user.id) {
      // Vérifier si admin/conseiller
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true },
      });
      if (dbUser?.role?.nom !== "admin" && dbUser?.role?.nom !== "conseiller") {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: transaction.id,
        status: transaction.status,
        amount: transaction.amount.toString(),
        currency: transaction.currency,
        method: transaction.method,
        reservationId: transaction.reservationId,
        providerRef: transaction.providerRef,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur interne";
    console.error("Erreur GET /api/payment/status:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
