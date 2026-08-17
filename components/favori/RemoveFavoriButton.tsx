"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { removeFavori } from "@/app/actions/favori/remove-favori.action";
import { Button } from "@/components/ui/button";
import { HeartOff, Loader2 } from "lucide-react";

interface RemoveFavoriButtonProps {
  circuitId: number;
}

export function RemoveFavoriButton({ circuitId }: RemoveFavoriButtonProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(removeFavori, null);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <form action={formAction}>
      <input type="hidden" name="circuitId" value={circuitId} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={pending}
        className="text-destructive hover:text-destructive"
      >
        {pending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <HeartOff className="w-3.5 h-3.5" />
        )}
        Retirer
      </Button>
      {state?.error && (
        <p className="text-destructive text-xs mt-1">{state.error}</p>
      )}
    </form>
  );
}
