"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteReservationAction } from "@/app/actions/reservation/delete-reservation.action";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteReservationButtonProps {
  reservationId: number;
  label?: string;
  variant?: "destructive" | "outline" | "ghost";
  size?: "xs" | "sm" | "default";
  className?: string;
  redirectTo?: string;
}

export function DeleteReservationButton({
  reservationId,
  label = "Supprimer",
  variant = "destructive",
  size = "sm",
  className,
  redirectTo,
}: DeleteReservationButtonProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    deleteReservationAction,
    null,
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (
      !confirm(
        "Supprimer définitivement cette réservation ? Cette action est irréversible.",
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
      <input type="hidden" name="reservationId" value={reservationId} />
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
