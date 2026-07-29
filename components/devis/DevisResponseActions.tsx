"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { acceptDevis, refuseDevis } from "@/app/actions/devis/accept-devis.action";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

interface DevisResponseActionsProps {
  devisId: number;
}

export function DevisResponseActions({ devisId }: DevisResponseActionsProps) {
  const router = useRouter();
  const [acceptState, acceptAction, acceptPending] = useActionState(acceptDevis, null);
  const [refuseState, refuseAction, refusePending] = useActionState(refuseDevis, null);

  const error = acceptState?.error ?? refuseState?.error;
  const success = acceptState?.success || refuseState?.success;

  useEffect(() => {
    if (success) router.refresh();
  }, [success, router]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Votre conseiller a chiffré ce devis. Acceptez-le pour procéder au paiement, ou refusez-le si
        le tarif ne vous convient pas.
      </p>

      <div className="flex flex-wrap gap-3">
        <form action={acceptAction}>
          <input type="hidden" name="devisId" value={devisId} />
          <Button type="submit" disabled={acceptPending || refusePending}>
            <CheckCircle2 className="w-4 h-4" />
            {acceptPending ? "Acceptation…" : "Accepter le devis"}
          </Button>
        </form>

        <form action={refuseAction}>
          <input type="hidden" name="devisId" value={devisId} />
          <Button
            type="submit"
            variant="outline"
            disabled={acceptPending || refusePending}
          >
            <XCircle className="w-4 h-4" />
            {refusePending ? "Refus…" : "Refuser"}
          </Button>
        </form>
      </div>

      {error && <p className="text-destructive text-sm font-medium">{error}</p>}
    </div>
  );
}
