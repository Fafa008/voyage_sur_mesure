import { CheckCircle2, Smartphone, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentResult } from "@/types/payment.types";

interface MobileMoneyPanelProps {
  paymentResult: PaymentResult;
  reservationId: number;
  amount: string;
}

export function MobileMoneyPanel({
  paymentResult,
  reservationId,
  amount,
}: MobileMoneyPanelProps) {
  return (
    <Card className="border-amber-500/20 bg-amber-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Smartphone className="w-5 h-5 text-amber-600" />
          Paiement Mobile Money
        </CardTitle>
        <CardDescription>
          Validez votre paiement depuis votre application mobile money en
          quelques secondes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-amber-500/20 bg-background/70 p-4 text-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-semibold">Demande de paiement initiée</span>
          </div>
          <p>Montant à régler : {amount} €</p>
          {paymentResult.providerRef && (
            <p className="font-mono text-xs">
              Référence : {paymentResult.providerRef}
            </p>
          )}
          {paymentResult.instructions && (
            <p className="text-xs text-muted-foreground">
              {paymentResult.instructions}
            </p>
          )}
        </div>

        {paymentResult.checkoutUrl && (
          <a
            href={paymentResult.checkoutUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Ouvrir le paiement Mobile Money
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        )}

        <Link
          href={`/paiement/${reservationId}/confirmation`}
          className="text-sm text-primary hover:underline inline-flex items-center"
        >
          Voir la confirmation de réservation
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </CardContent>
    </Card>
  );
}
