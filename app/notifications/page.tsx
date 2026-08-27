import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MarkAllReadButton } from "@/components/notifications/MarkAllReadButton";
import { MarkNotificationReadButton } from "@/components/notifications/MarkNotificationReadButton";
import { cn } from "@/lib/utils";

export default async function NotificationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { dateEnvoi: "desc" },
  });

  const unreadCount = notifications.filter((n) => !n.lu).length;

  return (
    <main className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "-ml-2"
            )}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour au tableau de bord
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="w-7 h-7 text-primary" />
            Notifications
          </h1>
          <p className="text-muted-foreground text-sm">
            Suivez l&apos;avancement de vos devis, réservations et messages de
            vos conseillers.
          </p>
        </div>
        <MarkAllReadButton hasUnread={unreadCount > 0} />
      </div>

      {notifications.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Vous n&apos;avez aucune notification pour le moment.
            </p>
            <Link
              href="/circuits"
              className={buttonVariants({ variant: "default" })}
            >
              Explorer les circuits
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notif) => (
            <li key={notif.id}>
              <Card
                className={cn(
                  "border transition-colors",
                  !notif.lu && "border-primary/30 bg-primary/5",
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base">
                          {notif.titre}
                        </CardTitle>
                        {!notif.lu && (
                          <Badge variant="secondary" className="text-[10px]">
                            Nouveau
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs">
                        {new Date(notif.dateEnvoi).toLocaleString("fr-FR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </CardDescription>
                    </div>
                    {!notif.lu && (
                      <MarkNotificationReadButton notificationId={notif.id} />
                    )}
                  </div>
                </CardHeader>
                {notif.message && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">
                      {notif.message}
                    </p>
                  </CardContent>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
