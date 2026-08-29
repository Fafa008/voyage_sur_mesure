"use client";

import { useState } from "react";
import { getOrCreateReservationFromDevisAction } from "@/actions/payments.actions";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, ShieldCheck, ArrowRight, Smartphone, Coins, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { PriceDisplay } from "@/components/currency/PriceDisplay";


interface PaymentFormProps {
  devisId: number;
  montant: string;
  modesPaiement?: { id: number; nom: string }[];
}

export function PaymentForm({ devisId, montant }: PaymentFormProps) {
  const router = useRouter();
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProceed = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getOrCreateReservationFromDevisAction(devisId);
      if (!res.success || !res.reservationId) {
        setError(res.error || "Impossible d'accéder à l'espace de paiement");
        setLoading(false);
      } else {
        router.push(`/paiement/${res.reservationId}`);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête Montant Total */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 p-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Montant total de la réservation
            </p>
          </div>
          <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
            <PriceDisplay amount={montant} size="xl" priceClassName="text-emerald-700 dark:text-emerald-400" />
          </p>
          {currency !== "MGA" && (
            <p className="text-xs font-medium text-emerald-600/90 dark:text-emerald-300/90 mt-0.5">
              (facturation en Ariary)
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <CreditCard className="w-6 h-6" />
        </div>
      </div>

      {/* Reassurance visual badges for supported payment methods */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
          Moyens de paiement acceptés sur l'espace sécurisé
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border/60 bg-background text-xs font-medium">
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Papi.mg</p>
              <p className="text-[10px] text-muted-foreground">Mobile Money & CB</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border/60 bg-background text-xs font-medium">
            <div className="w-7 h-7 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Binance Pay</p>
              <p className="text-[10px] text-muted-foreground">Crypto (USDT, BTC...)</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border/60 bg-background text-xs font-medium">
            <div className="w-7 h-7 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Virement</p>
              <p className="text-[10px] text-muted-foreground">Bancaire direct</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/50">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
        <p>
          Accès sécurisé SSL. Votre choix définitif de règlement s'effectuera à l'étape suivante.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {/* Unique clear CTA */}
      <Button
        onClick={handleProceed}
        disabled={loading}
        className="w-full h-12 text-base font-bold cursor-pointer"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Redirection vers l'espace de paiement…
          </>
        ) : (
          <>
            Accéder à l'espace de paiement
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}
