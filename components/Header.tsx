import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/auth/LogoutButton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Compass, User as UserIcon, LayoutDashboard, Send, Star } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";

import { getCachedUserWithRole } from "@/lib/auth-utils";
import { getUnreadNotificationCount } from "@/lib/notifications-utils";

export default async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let userRole: string | undefined;
  let unreadNotifications = 0;
  if (session) {
    const user = await getCachedUserWithRole(session.user.id);
    userRole = user?.role?.nom;
    unreadNotifications = await getUnreadNotificationCount(session.user.id);
  }

  const getDashboardLink = () => {
    if (userRole === "admin") return "/admin/dashboard";
    if (userRole === "conseiller") return "/conseiller/dashboard";
    return "/dashboard";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
            <Compass className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-foreground leading-none">
              Mon Voyage
            </span>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-widest mt-0.5">
              Sur Mesure
            </span>
          </div>
        </Link>

        {/* Navigation principale */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <Link
            href="/home"
            className="px-3.5 py-2 rounded-md hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            Accueil
          </Link>

          <Link
            href="/circuits"
            className="px-3.5 py-2 rounded-md hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            Circuits
          </Link>

          <Link
            href="/devis/nouveau"
            className="px-3.5 py-2 rounded-md hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            Demander un devis
          </Link>

          <Link
            href="/contact"
            className="px-3.5 py-2 rounded-md hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Action / Auth */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!session ? (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Se connecter
              </Link>
              <Link
                href="/devis/nouveau"
                className={buttonVariants({ variant: "default", size: "sm" })}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Devis Express
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <NotificationBell unreadCount={unreadNotifications} />
              <Link
                href="/favoris"
                className={buttonVariants({ variant: "ghost", size: "icon" })}
                aria-label="Mes favoris"
              >
                <Star className="w-4 h-4" />
              </Link>
              <Link
                href={getDashboardLink()}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
                Tableau de bord
              </Link>

              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {getInitials(session.user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold leading-tight text-foreground">
                    {session.user.name}
                  </span>
                  {userRole && (
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {userRole}
                    </span>
                  )}
                </div>

                <LogoutButton />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function getInitials(name: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}
