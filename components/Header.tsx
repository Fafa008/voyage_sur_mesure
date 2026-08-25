import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import LogoutButton from "@/components/auth/LogoutButton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { LayoutDashboard, Send, Star, Sparkles } from "lucide-react";
import ThemeToggle from "@/components/ui/theme-toggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { getCachedUserWithRole } from "@/lib/auth-utils";
import { getUnreadNotificationCount } from "@/lib/notifications-utils";
import LoginButton from "./auth/LoginButton";
import { MobileNav } from "@/components/MobileNav";

export default async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let userRole: string | undefined;
  let unreadNotifications = 0;
  if (session) {
    const [user, count] = await Promise.all([
      getCachedUserWithRole(session.user.id),
      getUnreadNotificationCount(session.user.id),
    ]);
    userRole = user?.role?.nom;
    unreadNotifications = count;
  }

  const getDashboardLink = () => {
    if (userRole === "admin") return "/admin/dashboard";
    if (userRole === "conseiller") return "/conseiller/dashboard";
    return "/dashboard";
  };

  return (
    <header className="sticky top-0 z-70 w-full border-b border-border/30 bg-background/70 backdrop-blur-xl shadow-sm transition-all dark:bg-background/70">
      {/* Dégradé subtil en fond */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo - inchangé */}
        <Link
          href="/home"
          className="group flex items-center transition-transform duration-300 hover:scale-105"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Logo.svg"
            alt="Madaventure – Explorez Madagascar autrement"
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Navigation principale */}
        <nav className="hidden items-center gap-1 text-sm font-medium text-muted-foreground md:flex">
          {[
            { href: "/home", label: "Accueil" },
            { href: "/circuits", label: "Circuits" },
            { href: "/devis/nouveau", label: "Demander un devis" },
            { href: "/contact", label: "Contact" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative rounded-lg px-4 py-2 transition-all duration-200 hover:bg-muted/50 hover:text-foreground"
            >
              {item.label}
              <span className="absolute inset-x-2 -bottom-0.5 h-0.5 scale-x-0 rounded-full bg-primary transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        {/* Actions et authentification */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <MobileNav
            user={session?.user}
            userRole={userRole}
            unreadNotifications={unreadNotifications}
          />

          {!session ? (
            <>
              <LoginButton />
              <Link
                href="/devis/nouveau"
                className={buttonVariants({
                  variant: "default",
                  className:
                    "group relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-primary/30",
                })}
              >
                <Send className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                Devis Express
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <NotificationBell unreadCount={unreadNotifications} />

              <Link
                href="/favoris"
                className={buttonVariants({
                  variant: "ghost",
                  size: "icon",
                  className: "text-muted-foreground hover:text-primary",
                })}
                aria-label="Mes favoris"
              >
                <Star className="h-4.5 w-4.5" />
              </Link>

              <Link
                href={getDashboardLink()}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className:
                    "border-border bg-background/50 text-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-muted/30 hover:text-primary",
                })}
              >
                <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" />
                Tableau de bord
              </Link>

              <div className="flex items-center gap-3 border-l border-border pl-3">
                <Avatar className="h-9 w-9 border-2 border-border shadow-md shadow-muted/30 ring-2 ring-primary/10 transition-all hover:ring-primary/30">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-xs font-bold text-primary-foreground">
                    {getInitials(session.user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden flex-col text-left lg:flex">
                  <span className="text-sm font-semibold leading-tight text-foreground">
                    {session.user.name}
                  </span>
                  {userRole && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-primary">
                      <Sparkles className="h-2.5 w-2.5" />
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
