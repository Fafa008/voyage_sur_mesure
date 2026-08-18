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
  LucideIcon,
  User,
  Home,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// Groupe de navigation (toujours déployés)
const NAV_GROUPS: NavGroup[] = [
  {
    label: "Tableau de bord",
    items: [
      {
        title: "Vue d'ensemble",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    label: "Gestion du contenu",
    items: [
      { title: "Circuits", href: "/admin/circuits", icon: Compass },
      { title: "Thèmes & Régions", href: "/admin/themes", icon: Tag },
    ],
  },
  {
    label: "Utilisateurs",
    items: [
      { title: "Utilisateurs", href: "/admin/utilisateurs", icon: Users },
      { title: "Modération Avis", href: "/admin/avis", icon: Star },
    ],
  },
  {
    label: "Finance & Réservations",
    items: [
      { title: "Devis", href: "/admin/devis", icon: FileText },
      { title: "Réservations", href: "/admin/reservations", icon: CalendarCheck },
      { title: "Paiements", href: "/admin/paiements", icon: CreditCard },
    ],
  },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean = false) => {
    return exact ? pathname === href : pathname.startsWith(href);
  };

  return (
    <nav className="h-full w-full overflow-hidden bg-background px-2 py-4">
      <div className="flex flex-col gap-4 h-full">
        {NAV_GROUPS.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              {group.label}
            </span>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors",
                      active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Shortcuts */}
        <div className="pt-2 border-t border-border/40">
          <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Raccourcis
          </p>
          <nav className="space-y-0.5">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2.5 py-2 rounded-lg text-[13px] text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-all duration-200 font-medium"
            >
              <div className="w-7 h-7 rounded-md flex items-center justify-center group-hover:bg-muted">
                <User className="w-3.5 h-3.5 text-muted-foreground/70 group-hover:text-foreground" />
              </div>
              <span>Mon profil client</span>
            </Link>
            <Link
              href="/home"
              className="group flex items-center gap-2.5 py-2 rounded-lg text-[13px] text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-all duration-200 font-medium"
            >
              <div className="w-7 h-7 rounded-md flex items-center justify-center group-hover:bg-muted">
                <Home className="w-3.5 h-3.5 text-muted-foreground/70 group-hover:text-foreground" />
              </div>
              <span>Site public</span>
            </Link>
          </nav>
        </div>
      </div>
    </nav>
  );
}