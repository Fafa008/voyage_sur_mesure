import { CheckCircle2, CreditCard, ArrowRight } from "lucide-react";
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

interface StripePaymentPanelProps {
  paymentResult: PaymentResult;
  reservationId: number;
  amount: string;
}

export function StripePaymentPanel({
  paymentResult,
  reservationId,
  amount,
}: StripePaymentPanelProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="w-5 h-5 text-primary" />
          Paiement par carte bancaire
        </CardTitle>
        <CardDescription>
          La transaction est préparée en mode sécurisé avec une simulation
          Stripe localement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-primary/20 bg-background/70 p-4 text-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-semibold">Préparation réussie</span>
          </div>
          <p>Montant à régler : {amount} €</p>
          {paymentResult.providerRef && (
            <p className="font-mono text-xs">
              Référence : {paymentResult.providerRef}
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
            Ouvrir le paiement Stripe
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
