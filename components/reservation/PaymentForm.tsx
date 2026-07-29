"use client";

import { useActionState } from "react";
import { createReservation } from "@/app/actions/reservation/create-reservation.action";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";

interface PaymentFormProps {
  devisId: number;
  montant: string;
  modesPaiement: { id: number; nom: string }[];
}

export function PaymentForm({ devisId, montant, modesPaiement }: PaymentFormProps) {
  const [state, formAction, pending] = useActionState(createReservation, null);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="devisId" value={devisId} />

      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Montant à régler
          </p>
          <p className="text-3xl font-extrabold text-primary">{montant} €</p>
        </div>
        <CreditCard className="w-8 h-8 text-primary/40" />
      </div>

      <SelectField
        label="Mode de paiement"
        id="modeId"
        required
        defaultValue=""
        options={[
          { value: "", label: "Sélectionnez un mode de paiement" },
          ...modesPaiement.map((m) => ({
            value: String(m.id),
            label: m.nom,
          })),
        ]}
      />

      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
        <p>
          Paiement simulé à des fins de démonstration. Aucun prélèvement réel ne sera effectué.
          En production, cette étape serait connectée à un prestataire de paiement sécurisé.
        </p>
      </div>

      {state?.error && (
        <p className="text-destructive text-sm font-medium">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full" size="lg">
        {pending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Traitement en cours…
          </>
        ) : (
          <>Confirmer le paiement et réserver</>
        )}
      </Button>
    </form>
  );
}
