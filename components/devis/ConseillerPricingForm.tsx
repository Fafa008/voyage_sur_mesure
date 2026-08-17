"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validateDevisWithPricing } from "@/app/actions/devis/update-devis-pricing.action";
import { InputField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatutDevis } from "@prisma/client";

interface ConseillerPricingFormProps {
  devisId: number;
  statut: StatutDevis;
  defaultMontant?: string | null;
  defaultCommentaire?: string | null;
}

export function ConseillerPricingForm({
  devisId,
  statut,
  defaultMontant,
  defaultCommentaire,
}: ConseillerPricingFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    validateDevisWithPricing,
    null,
  );

  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state?.success, router]);

  const canValidate =
    statut === StatutDevis.en_cours || statut === StatutDevis.en_modification;

  if (!canValidate) return null;

  return (
    <form action={formAction} className="space-y-4 border-t pt-6">
      <h3 className="font-bold text-base">Chiffrage et validation</h3>
      <p className="text-sm text-muted-foreground">
        Définissez le montant total et un message pour le client avant de
        valider le devis.
      </p>

      <InputField
        label="Montant total (MGA)"
        id="montantTotal"
        type="number"
        min="1"
        step="0.01"
        required
        defaultValue={defaultMontant ?? ""}
        placeholder="Ex : 2450"
      />

      <div className="space-y-1.5">
        <Label htmlFor="commentaireConseiller">
          Message au client
        </Label>
        <Textarea
          id="commentaireConseiller"
          name="commentaireConseiller"
          required
          rows={4}
          defaultValue={defaultCommentaire ?? ""}
          placeholder="Détaillez le chiffrage, les inclusions, les conditions…"
          className="resize-y min-h-[100px]"
        />
      </div>

      <input type="hidden" name="devisId" value={devisId} />

      {state?.error && (
        <p className="text-destructive text-sm font-medium">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-emerald-600 text-sm font-medium">
          Devis validé et notification envoyée au client.
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Validation en cours…" : "Valider et envoyer au client"}
      </Button>
    </form>
  );
}
