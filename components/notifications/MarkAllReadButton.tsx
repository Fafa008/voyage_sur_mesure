"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAllNotificationsRead } from "@/app/actions/notification/mark-notification-read.action";
import { Button } from "@/components/ui/Button";
import { CheckCheck, Loader2 } from "lucide-react";

interface MarkAllReadButtonProps {
  hasUnread: boolean;
}

export function MarkAllReadButton({ hasUnread }: MarkAllReadButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!hasUnread) return null;

  const handleClick = () => {
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={handleClick}
    >
      {pending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <CheckCheck className="w-3.5 h-3.5" />
      )}
      Tout marquer comme lu
    </Button>
  );
}
