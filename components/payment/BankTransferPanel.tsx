"use client";

import { PaymentResult } from "@/types/payment.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Copy, Check, Info } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface BankTransferPanelProps {
  paymentResult: PaymentResult;
  reservationId: number;
  amount: string;
}

export function BankTransferPanel({ paymentResult, reservationId, amount }: BankTransferPanelProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const iban = "FR76 1234 5678 9101 1121 3141 516";
  const bic = "BNPAFR2XXX";
  const ref = paymentResult.providerRef || `BT-${reservationId}`;
  const beneficiary = "MON VOYAGE MADAGASCAR SARL";

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Card className="border-blue-200/60 bg-blue-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
          <Building2 className="w-4 h-4" />
          Instructions pour Virement Bancaire
        </div>
        <CardTitle className="text-xl">Coordonnées Bancaires de l'Agence</CardTitle>
        <CardDescription>
          Veuillez effectuer le virement de <strong className="text-foreground">{amount} €</strong> en indiquant impérativement la référence ci-dessous.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-3 bg-card p-4 rounded-xl border border-border/80 text-sm">
          <div className="flex items-center justify-between py-1.5 border-b border-border/40">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Bénéficiaire</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{beneficiary}</span>
              <button
                type="button"
                onClick={() => handleCopy(beneficiary, "ben")}
                className="text-muted-foreground hover:text-primary p-1"
                title="Copier"
              >
                {copiedField === "ben" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-border/40">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">IBAN</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs">{iban}</span>
              <button
                type="button"
                onClick={() => handleCopy(iban.replace(/\s/g, ""), "iban")}
                className="text-muted-foreground hover:text-primary p-1"
                title="Copier IBAN"
              >
                {copiedField === "iban" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-border/40">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">BIC / SWIFT</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs">{bic}</span>
              <button
                type="button"
                onClick={() => handleCopy(bic, "bic")}
                className="text-muted-foreground hover:text-primary p-1"
                title="Copier BIC"
              >
                {copiedField === "bic" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-1.5 bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20">
            <span className="text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wider">Référence obligatoire</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-blue-800 dark:text-blue-200">{ref}</span>
              <button
                type="button"
                onClick={() => handleCopy(ref, "ref")}
                className="text-blue-700 hover:text-blue-900 p-1"
                title="Copier référence"
              >
                {copiedField === "ref" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/40">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p>
            Votre réservation est actuellement enregistrée en attente de paiement. Dès réception de votre virement (généralement 24-48h), votre conseiller validera définitivement votre voyage.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href={`/reservations/${reservationId}`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Accéder à ma réservation
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
