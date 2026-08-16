"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteDevisAction } from "@/app/actions/devis/delete-devis.action";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

interface DeleteDevisButtonProps {
  devisId: number;
  label?: string;
  variant?: "destructive" | "outline" | "ghost";
  size?: "xs" | "sm" | "default";
  className?: string;
  redirectTo?: string;
}

export function DeleteDevisButton({
  devisId,
  label = "Supprimer",
  variant = "destructive",
  size = "sm",
  className,
  redirectTo,
}: DeleteDevisButtonProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(deleteDevisAction, null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (
      !confirm(
        "Supprimer définitivement ce devis ? Cette action est irréversible.",
      )
    ) {
      event.preventDefault();
    }
  };

  useEffect(() => {
    if (state?.success) {
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    }
  }, [state, router, redirectTo]);

  return (
    <form action={action} onSubmit={handleSubmit} className="inline">
      <input type="hidden" name="devisId" value={devisId} />
      <Button
        type="submit"
        variant={variant}
        size={size}
        disabled={pending}
        className={className}
      >
        <Trash2 className="w-3.5 h-3.5" />
        {pending ? "Suppression…" : label}
      </Button>
      {state?.error && (
        <p className="text-destructive text-xs font-medium mt-1">
          {state.error}
        </p>
      )}
    </form>
  );
}
