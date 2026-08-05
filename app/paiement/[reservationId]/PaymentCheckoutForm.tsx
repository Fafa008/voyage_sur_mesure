"use client";

import { useState } from "react";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { initiatePaymentAction } from "@/actions/payments.actions";
import { PaymentMethodCard } from "@/components/payment/PaymentMethodCard";
import { BinancePayPanel } from "@/components/payment/BinancePayPanel";
import { BankTransferPanel } from "@/components/payment/BankTransferPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Loader2, ArrowRight } from "lucide-react";
import { PaymentResult } from "@/types/payment.types";

interface Props {
  reservationId: number;
  amount: string;
  userId: string;
  latestTransaction: {
    id: string;
    method: PaymentMethod;
    status: PaymentStatus;
    providerRef: string | null;
  } | null;
}

export function PaymentCheckoutForm({ reservationId, amount, userId, latestTransaction }: Props) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    latestTransaction?.method || PaymentMethod.BINANCE_PAY
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activePayment, setActivePayment] = useState<{
    method: PaymentMethod;
    result: PaymentResult;
  } | null>(
    latestTransaction && latestTransaction.status === PaymentStatus.PENDING
      ? {
          method: latestTransaction.method,
          result: {
            success: true,
            transactionId: latestTransaction.id,
            providerRef: latestTransaction.providerRef || undefined,
            checkoutUrl: latestTransaction.method === PaymentMethod.BINANCE_PAY
              ? `https://pay.binance.com/checkout/${latestTransaction.providerRef}`
              : undefined,
          },
        }
      : null
  );

  const handleInitiate = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await initiatePaymentAction(reservationId, selectedMethod, userId);
      if (!res.success || !res.data) {
        setError(res.error || "Erreur lors de l'initiation du paiement");
      } else {
        setActivePayment({
          method: selectedMethod,
          result: res.data,
        });
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (activePayment) {
    if (activePayment.method === PaymentMethod.BINANCE_PAY) {
      return (
        <BinancePayPanel
          paymentResult={activePayment.result}
          reservationId={reservationId}
          amount={amount}
        />
      );
    }

    if (activePayment.method === PaymentMethod.BANK_TRANSFER) {
      return (
        <BankTransferPanel
          paymentResult={activePayment.result}
          reservationId={reservationId}
          amount={amount}
        />
      );
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Sélection du mode de paiement</CardTitle>
        <CardDescription>
          Choisissez la méthode qui vous convient le mieux pour finaliser votre commande.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-3">
          <PaymentMethodCard
            method={PaymentMethod.BINANCE_PAY}
            selected={selectedMethod === PaymentMethod.BINANCE_PAY}
            onSelect={setSelectedMethod}
            recommended
          />
          <PaymentMethodCard
            method={PaymentMethod.BANK_TRANSFER}
            selected={selectedMethod === PaymentMethod.BANK_TRANSFER}
            onSelect={setSelectedMethod}
          />
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        <Button
          onClick={handleInitiate}
          disabled={loading}
          className="w-full h-12 text-base font-bold shadow-md cursor-pointer"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Traitement en cours...
            </>
          ) : (
            <>
              Confirmer et procéder au paiement ({selectedMethod === PaymentMethod.BINANCE_PAY ? "Binance Pay" : "Virement"})
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
