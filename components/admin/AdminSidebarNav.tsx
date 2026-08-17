"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Compass,
  Star,
  Tag,
  FileText,
  CreditCard,
  CalendarCheck,
} from "lucide-react";

export function AdminSidebarNav() {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Vue d'ensemble",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "Circuits & Voyage",
      href: "/admin/circuits",
      icon: Compass,
      exact: false,
    },
    {
      title: "Utilisateurs",
      href: "/admin/utilisateurs",
      icon: Users,
      exact: false,
    },
    {
      title: "Modération Avis",
      href: "/admin/avis",
      icon: Star,
      exact: false,
    },
    {
      title: "Thèmes & Régions",
      href: "/admin/themes",
      icon: Tag,
      exact: false,
    },
    {
      title: "Devis",
      href: "/admin/devis",
      icon: FileText,
      exact: false,
    },
    {
      title: "Réservations",
      href: "/admin/reservations",
      icon: CalendarCheck,
      exact: false,
    },
    {
      title: "Paiements & Transactions",
      href: "/admin/paiements",
      icon: CreditCard,
      exact: false,
    },
  ];

  return (
    <nav className="space-y-1 text-sm font-medium h-full">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
