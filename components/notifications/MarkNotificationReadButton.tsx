"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { markNotificationRead } from "@/app/actions/notification/mark-notification-read.action";
import { Button } from "@/components/ui/Button";
import { Check, Loader2 } from "lucide-react";

interface MarkNotificationReadButtonProps {
  notificationId: number;
}

export function MarkNotificationReadButton({
  notificationId,
}: MarkNotificationReadButtonProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    markNotificationRead,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <form action={formAction}>
      <input type="hidden" name="notificationId" value={notificationId} />
      <Button type="submit" variant="ghost" size="sm" disabled={pending}>
        {pending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Check className="w-3.5 h-3.5" />
        )}
        Marquer lu
      </Button>
    </form>
  );
}
