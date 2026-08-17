"use client";

import { PaymentMethod } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Smartphone, QrCode, Building2, CreditCard } from "lucide-react";

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: (method: PaymentMethod) => void;
  recommended?: boolean;
}

const methodDetails: Record<
  PaymentMethod,
  { title: string; description: string; icon: React.ComponentType<{ className?: string }> }
> = {
  [PaymentMethod.PAPI]: {
    title: "Paiement en ligne (Papi)",
    description: "Paiement rapide et sécurisé par MVola, Orange Money, Airtel Money ou Carte bancaire",
    icon: Smartphone,
  },
  [PaymentMethod.BINANCE_PAY]: {
    title: "Binance Pay",
    description: "Paiement rapide et sécurisé en cryptomonnaies (USDT, BUSD, BTC...)",
    icon: QrCode,
  },
  [PaymentMethod.BANK_TRANSFER]: {
    title: "Virement Bancaire",
    description: "Virement SEPA / Manuel avec coordonnées bancaires et référence unique",
    icon: Building2,
  },
};

export function PaymentMethodCard({
  method,
  selected,
  onSelect,
  recommended = false,
}: PaymentMethodCardProps) {
  const details = methodDetails[method] || {
    title: method,
    description: "Mode de paiement",
    icon: CreditCard,
  };
  const Icon = details.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(method)}
      className={cn(
        "relative flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer w-full",
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border hover:border-primary/40 bg-card hover:bg-muted/30"
      )}
    >
      {recommended && (
        <span className="absolute -top-2.5 right-4 bg-amber-500 text-amber-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs">
          Recommandé
        </span>
      )}

      <div
        className={cn(
          "flex items-center justify-center w-11 h-11 rounded-lg shrink-0 transition-colors",
          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm text-foreground">{details.title}</h4>
          <div
            className={cn(
              "w-4 h-4 rounded-full border flex items-center justify-center",
              selected ? "border-primary bg-primary" : "border-muted-foreground/40"
            )}
          >
            {selected && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{details.description}</p>
      </div>
    </button>
  );
}
