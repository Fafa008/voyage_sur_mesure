"use client";

import { useState } from "react";
import { PaymentMethod } from "@prisma/client";
import { initiatePaymentFromDevisAction } from "@/actions/payments.actions";
import { PaymentMethodCard } from "@/components/payment/PaymentMethodCard";
import { Button } from "@/components/ui/Button";
import { CreditCard, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentFormProps {
  devisId: number;
  montant: string;
  modesPaiement?: { id: number; nom: string }[];
}

export function PaymentForm({ devisId, montant }: PaymentFormProps) {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    PaymentMethod.PAPI,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await initiatePaymentFromDevisAction(devisId, selectedMethod);
      if (!res.success || !res.data) {
        setError(res.error || "Erreur lors de l'initiation du paiement");
        setLoading(false);
      } else {
        router.push(`/paiement/${res.data.reservationId}`);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dynamic Amount Header */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Montant total à régler
          </p>
          <p className="text-3xl font-extrabold text-primary">{montant} MGA</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <CreditCard className="w-6 h-6" />
        </div>
      </div>

      {/* Payment Methods Selection */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground block">
          Choisissez votre mode de paiement
        </label>

        <div className="grid grid-cols-1 gap-3">
          <PaymentMethodCard
            method={PaymentMethod.PAPI}
            selected={selectedMethod === PaymentMethod.PAPI}
            onSelect={setSelectedMethod}
            recommended
          />
          <PaymentMethodCard
            method={PaymentMethod.BINANCE_PAY}
            selected={selectedMethod === PaymentMethod.BINANCE_PAY}
            onSelect={setSelectedMethod}
          />
          <PaymentMethodCard
            method={PaymentMethod.BANK_TRANSFER}
            selected={selectedMethod === PaymentMethod.BANK_TRANSFER}
            onSelect={setSelectedMethod}
          />
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-3.5 rounded-xl border border-border/50">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
        <p>
          Transaction 100% sécurisée. Vos données personnelles sont protégées
          par le chiffrement SSL.
          {selectedMethod === PaymentMethod.PAPI &&
            " Paiement direct par Mobile Money ou Carte bancaire via Papi.mg."}
          {selectedMethod === PaymentMethod.BINANCE_PAY &&
            " Le taux de conversion crypto/MGA est garanti pendant 15 minutes."}
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-base font-bold shadow-md cursor-pointer"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Redirection vers le paiement…
          </>
        ) : (
          <>
            Procéder au paiement (
            {selectedMethod === PaymentMethod.PAPI
              ? "Paiement en ligne Papi"
              : selectedMethod === PaymentMethod.BINANCE_PAY
                ? "Binance Pay"
                : "Virement"}
            )
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </form>
  );
}
