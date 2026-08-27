"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Menu,
  LayoutDashboard,
  Star,
  Bell,
  Send,
  LogIn,
  Home,
  Compass,
  Phone,
  Sparkles,
} from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CurrencySelector } from "@/components/ui/CurrencySelector";

interface MobileNavProps {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  userRole?: string;
  unreadNotifications?: number;
}

export function MobileNav({
  user,
  userRole,
  unreadNotifications = 0,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const getDashboardLink = () => {
    if (userRole === "admin") return "/admin/dashboard";
    if (userRole === "conseiller") return "/conseiller/dashboard";
    return "/dashboard";
  };

  const navLinks = [
    { href: "/home", label: "Accueil", icon: Home },
    { href: "/circuits", label: "Circuits", icon: Compass },
    { href: "/devis/nouveau", label: "Demander un devis", icon: Send },
    { href: "/contact", label: "Contact", icon: Phone },
  ];

  function getInitials(name?: string | null) {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground hover:bg-muted/50"
            aria-label="Ouvrir le menu de navigation"
          />
        }
      >
        <Menu className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <SheetHeader className="p-0 text-left">
            <SheetTitle className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Logo.svg"
                alt="Madaventure"
                className="h-8 w-auto object-contain"
              />
            </SheetTitle>
          </SheetHeader>

          {/* User profile card if logged in */}
          {user ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/60">
              <Avatar className="h-10 w-10 border border-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-xs font-bold text-primary-foreground">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground truncate">
                  {user.name || "Utilisateur"}
                </span>
                {userRole && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-primary">
                    <Sparkles className="h-2.5 w-2.5" />
                    {userRole}
                  </span>
                )}
              </div>
            </div>
          ) : null}

          {/* Main Navigation Links */}
          <nav className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1">
              Navigation
            </span>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <SheetClose key={item.href} render={
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    {item.label}
                  </Link>
                } />
              );
            })}
          </nav>

          {/* User Section / Account Links */}
          {user && (
            <div className="flex flex-col gap-1 pt-2 border-t border-border/60">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                Espace Client
              </span>
              <SheetClose render={
                <Link
                  href={getDashboardLink()}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  Tableau de bord
                </Link>
              } />
              <SheetClose render={
                <Link
                  href="/favoris"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Star className="h-4 w-4 text-amber-500" />
                  Mes favoris
                </Link>
              } />
              <SheetClose render={
                <Link
                  href="/notifications"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-primary" />
                    Notifications
                  </span>
                  {unreadNotifications > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadNotifications}
                    </span>
                  )}
                </Link>
              } />
            </div>
          )}
        </div>

        {/* Footer Actions & Currency */}
        <div className="pt-4 border-t border-border/60 space-y-3">
          <div className="flex items-center justify-between px-1 py-1">
            <span className="text-xs font-medium text-muted-foreground">Devise :</span>
            <CurrencySelector />
          </div>

          {user ? (
            <div onClick={() => setOpen(false)}>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <SheetClose render={
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({
                    variant: "outline",
                    className: "w-full justify-center",
                  })}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Se connecter
                </Link>
              } />
              <SheetClose render={
                <Link
                  href="/devis/nouveau"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({
                    variant: "default",
                    className: "w-full justify-center bg-gradient-to-r from-primary to-primary/80",
                  })}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Devis Express
                </Link>
              } />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
