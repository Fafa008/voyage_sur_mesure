"use client";

import { useState } from "react";
import { markBankTransferAsPaidAction } from "@/actions/payments.actions";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  transactionId: string;
}

export function AdminBankTransferAction({ transactionId }: Props) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!confirm("Confirmer la réception du virement pour cette transaction ?"))
      return;
    setLoading(true);
    try {
      await markBankTransferAsPaidAction(transactionId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleConfirm}
      disabled={loading}
      className="text-xs bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-500/30"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          Valider Virement
        </>
      )}
    </Button>
  );
}
