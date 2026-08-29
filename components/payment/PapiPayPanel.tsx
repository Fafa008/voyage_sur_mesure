//components/payment/PapiPayPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { PaymentResult } from "@/types/payment.types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Smartphone,
  ExternalLink,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Shield,
} from "lucide-react";
import { checkPaymentStatusAction } from "@/actions/payments.actions";
import { useRouter } from "next/navigation";

import { PriceDisplay } from "@/components/currency/PriceDisplay";


interface PapiPayPanelProps {
  paymentResult: PaymentResult;
  reservationId: number;
  amount: string;
}

export function PapiPayPanel({
  paymentResult,
  reservationId,
  amount,
}: PapiPayPanelProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Compute initial remaining seconds from paymentResult.expiresAt
  const initialTimeLeft = () => {
    if (paymentResult.expiresAt) {
      const expiryDate = new Date(paymentResult.expiresAt);
      const remainingMs = expiryDate.getTime() - Date.now();
      return Math.max(0, Math.floor(remainingMs / 1000));
    }
    return 900; // 15 minutes fallback UX
  };

  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll payment status periodically
  useEffect(() => {
    if (!paymentResult.transactionId || isPaid) return;

    const interval = setInterval(async () => {
      const res = await checkPaymentStatusAction(paymentResult.transactionId!);
      if (res.success && res.data?.status === "PAID") {
        setIsPaid(true);
        clearInterval(interval);
        setTimeout(() => {
          router.push(`/paiement/${reservationId}/confirmation`);
        }, 1500);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentResult.transactionId, isPaid, reservationId, router]);

  const handleManualCheck = async () => {
    if (!paymentResult.transactionId) return;
    setChecking(true);
    try {
      const res = await checkPaymentStatusAction(paymentResult.transactionId);
      if (res.success && res.data?.status === "PAID") {
        setIsPaid(true);
        setTimeout(() => {
          router.push(`/paiement/${reservationId}/confirmation`);
        }, 1000);
      }
    } finally {
      setChecking(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  if (isPaid) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 text-center py-8">
        <CardContent className="space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
          <CardTitle className="text-xl text-emerald-800 dark:text-emerald-300">
            Paiement confirmé !
          </CardTitle>
          <CardDescription className="text-emerald-700 dark:text-emerald-400">
            Redirection vers votre récapitulatif en cours...
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3 text-center">
        <div className="flex items-center justify-center gap-2 mb-1 text-primary font-bold text-sm">
          <Smartphone className="w-4 h-4" />
          Paiement en ligne via Papi
        </div>
        <CardTitle className="text-2xl font-extrabold text-primary">
          <PriceDisplay amount={amount} size="lg" priceClassName="text-primary" />
        </CardTitle>
        <div className="text-xs font-medium text-muted-foreground mt-0.5">
          (facturation en Ariary)
        </div>
        <CardDescription className="mt-1">
          Payez en toute sécurité via MVola, Orange Money, Airtel Money ou Carte
          bancaire (facturation en Ariary)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Payment info */}
        <div className="bg-card rounded-xl border border-border/80 p-5 space-y-4 max-w-sm mx-auto">
          <div className="flex items-center gap-3 text-sm">
            <Shield className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-muted-foreground">
              Vous allez être redirigé vers la page de paiement sécurisée
              Papi.mg
            </span>
          </div>

          {paymentResult.providerRef && (
            <div className="text-xs text-muted-foreground font-mono text-center">
              Réf: {paymentResult.providerRef}
            </div>
          )}

          <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-center">
            Temps restant : {formattedTime}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 max-w-sm mx-auto">
          {paymentResult.checkoutUrl && (
            <a
              href={paymentResult.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-colors"
            >
              Payer maintenant
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <Button
            variant="outline"
            onClick={handleManualCheck}
            disabled={checking}
            className="w-full text-xs"
          >
            {checking ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Vérification...
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                J&apos;ai effectué le paiement (Vérifier)
              </>
            )}
          </Button>
        </div>

        {/* Supported methods */}
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground pt-2">
          <span className="px-2 py-0.5 rounded-full bg-muted border border-border/40">
            MVola
          </span>
          <span className="px-2 py-0.5 rounded-full bg-muted border border-border/40">
            Orange Money
          </span>
          <span className="px-2 py-0.5 rounded-full bg-muted border border-border/40">
            Airtel Money
          </span>
          <span className="px-2 py-0.5 rounded-full bg-muted border border-border/40">
            Visa
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
