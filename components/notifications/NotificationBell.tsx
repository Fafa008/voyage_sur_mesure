import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface NotificationBellProps {
  unreadCount: number;
}

export function NotificationBell({ unreadCount }: NotificationBellProps) {
  return (
    <Link
      href="/notifications"
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "relative shrink-0"
      )}
      aria-label={
        unreadCount > 0
          ? `${unreadCount} notification(s) non lue(s)`
          : "Notifications"
      }
    >
      <Bell className="w-4 h-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
