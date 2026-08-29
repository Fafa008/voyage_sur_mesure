"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { deleteReservationAction } from "@/app/actions/reservation/delete-reservation.action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

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
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    deleteReservationAction,
    null
  );

// Ferme le dialogue dès que l'action réussit (ajustement d'état pendant
// le rendu, comparé à la valeur précédente — pas d'effet nécessaire).
const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state?.success) {
      setOpen(false);
    }
  }

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button
          variant={variant}
          size={size}
          className={className}
          aria-label={`Supprimer la réservation #${reservationId}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          {label && <span>{label}</span>}
        </Button>
      } />
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-2">
          <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <DialogTitle className="text-base font-bold">
            Supprimer la réservation #{reservationId} ?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Cette action est irréversible. La réservation sera définitivement supprimée de votre dossier.
          </DialogDescription>
        </DialogHeader>

        {state?.error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
            {state.error}
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
          <DialogClose render={
            <Button variant="outline" size="sm" disabled={pending}>
              Annuler
            </Button>
          } />
          <form ref={formRef} action={action}>
            <input type="hidden" name="reservationId" value={reservationId} />
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={pending}
              className="w-full sm:w-auto"
            >
              {pending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Suppression...
                </>
              ) : (
                "Confirmer la suppression"
              )}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
