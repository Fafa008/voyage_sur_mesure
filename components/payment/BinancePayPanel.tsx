"use client";

import { useEffect, useState } from "react";
import { PaymentResult } from "@/types/payment.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, ExternalLink, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { checkPaymentStatusAction } from "@/actions/payments.actions";
import { useRouter } from "next/navigation";

interface BinancePayPanelProps {
  paymentResult: PaymentResult;
  reservationId: number;
  amount: string;
}

export function BinancePayPanel({ paymentResult, reservationId, amount }: BinancePayPanelProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll status periodically
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
    }, 4000);

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
            Paiement Binance Pay confirmé !
          </CardTitle>
          <CardDescription className="text-emerald-700 dark:text-emerald-400">
            Redirection vers votre récapitulatif en cours...
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200/60 bg-amber-500/5">
      <CardHeader className="pb-3 text-center">
        <div className="flex items-center justify-center gap-2 mb-1 text-amber-600 font-bold text-sm">
          <QrCode className="w-4 h-4" />
          Paiement via Binance Pay
        </div>
        <CardTitle className="text-2xl font-extrabold text-primary">{amount} €</CardTitle>
        <CardDescription>
          Scannez le QR Code depuis votre application Binance ou cliquez sur le lien
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-6 bg-card rounded-xl border border-border/80 shadow-xs max-w-xs mx-auto text-center space-y-3">
          <div className="w-44 h-44 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-xl p-3 flex items-center justify-center border border-amber-500/30 relative group">
            {/* SVG QR Code Simulation */}
            <svg
              className="w-full h-full text-foreground"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <rect x="5" y="5" width="25" height="25" fill="currentColor" />
              <rect x="9" y="9" width="17" height="17" fill="var(--card)" />
              <rect x="13" y="13" width="9" height="9" fill="currentColor" />

              <rect x="70" y="5" width="25" height="25" fill="currentColor" />
              <rect x="74" y="9" width="17" height="17" fill="var(--card)" />
              <rect x="78" y="13" width="9" height="9" fill="currentColor" />

              <rect x="5" y="70" width="25" height="25" fill="currentColor" />
              <rect x="9" y="74" width="17" height="17" fill="var(--card)" />
              <rect x="13" y="78" width="9" height="9" fill="currentColor" />

              {/* Data dots */}
              <rect x="35" y="10" width="8" height="8" />
              <rect x="50" y="10" width="8" height="8" />
              <rect x="35" y="25" width="8" height="8" />
              <rect x="45" y="35" width="12" height="12" />
              <rect x="65" y="45" width="8" height="8" />
              <rect x="35" y="60" width="8" height="8" />
              <rect x="50" y="70" width="12" height="12" />
              <rect x="70" y="70" width="12" height="12" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-xl">
              <span className="text-xs font-bold text-amber-600">Binance Pay</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground font-mono">
            Réf: {paymentResult.providerRef}
          </div>

          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
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
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-sm transition-colors shadow-xs"
            >
              Payer sur Binance.com
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
                J'ai effectué le paiement (Vérifier)
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
