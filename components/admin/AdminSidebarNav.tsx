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
      title: "Paiements & Transactions",
      href: "/admin/paiements",
      icon: CreditCard,
      exact: false,
    },
    {
      title: "Espace Client (Devis)",
      href: "/dashboard",
      icon: FileText,
      exact: true,
    },
  ];

  return (
    <nav className="space-y-1 text-sm font-medium">
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
              "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all duration-200",
              isActive
                ? "bg-primary/15 text-primary font-bold shadow-xs border border-primary/20"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent"
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
