"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  FileText,
  Home,
  User,
  XCircle,
  Inbox,
} from "lucide-react";

interface ConseillerSidebarNavProps {
  counts?: {
    total: number;
    enCours: number;
    enModification: number;
    valide: number;
    refuse: number;
  };
}

export function ConseillerSidebarNav({ counts }: ConseillerSidebarNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatut = searchParams.get("statut");

  const navItems = [
    {
      title: "Tous les dossiers",
      href: "/conseiller/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/conseiller/dashboard" && !currentStatut,
      count: counts?.total,
      color: "text-primary",
      dotColor: "bg-primary",
      badgeBg: "bg-primary/10 text-primary",
    },
    {
      title: "À traiter",
      href: "/conseiller/dashboard?statut=en_cours",
      icon: Clock,
      active: pathname === "/conseiller/dashboard" && currentStatut === "en_cours",
      count: counts?.enCours,
      color: "text-amber-500",
      dotColor: "bg-amber-500",
      badgeBg: "bg-amber-500/10 text-amber-600",
    },
    {
      title: "Modifications",
      href: "/conseiller/dashboard?statut=en_modification",
      icon: FileText,
      active: pathname === "/conseiller/dashboard" && currentStatut === "en_modification",
      count: counts?.enModification,
      color: "text-orange-500",
      dotColor: "bg-orange-500",
      badgeBg: "bg-orange-500/10 text-orange-600",
    },
    {
      title: "Devis envoyés",
      href: "/conseiller/dashboard?statut=valide",
      icon: CheckCircle2,
      active: pathname === "/conseiller/dashboard" && currentStatut === "valide",
      count: counts?.valide,
      color: "text-emerald-500",
      dotColor: "bg-emerald-500",
      badgeBg: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Refusés",
      href: "/conseiller/dashboard?statut=refuse",
      icon: XCircle,
      active: pathname === "/conseiller/dashboard" && currentStatut === "refuse",
      count: counts?.refuse,
      color: "text-rose-500",
      dotColor: "bg-rose-500",
      badgeBg: "bg-rose-500/10 text-rose-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sidebar Header */}
      <div className="px-3 pt-1">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
            <Inbox className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground leading-tight">
              Espace Conseiller
            </h2>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Gestion des demandes
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="px-2">
        <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          Dossiers
        </p>
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-200 font-medium",
                  item.active
                    ? "bg-primary/8 text-primary shadow-[inset_0_0_0_1px] shadow-primary/15 font-semibold"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center transition-colors shrink-0",
                    item.active
                      ? "bg-primary/10"
                      : "bg-transparent group-hover:bg-muted"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-3.5 h-3.5 transition-colors",
                      item.active ? item.color : "text-muted-foreground/70 group-hover:text-foreground"
                    )}
                  />
                </div>
                <span className="flex-1 truncate">{item.title}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={cn(
                      "min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center tabular-nums transition-colors",
                      item.active
                        ? item.badgeBg
                        : "bg-muted text-muted-foreground group-hover:bg-foreground/10"
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Shortcuts */}
      <div className="px-2 pt-2 border-t border-border/40">
        <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          Raccourcis
        </p>
        <nav className="space-y-0.5">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-all duration-200 font-medium"
          >
            <div className="w-7 h-7 rounded-md flex items-center justify-center group-hover:bg-muted">
              <User className="w-3.5 h-3.5 text-muted-foreground/70 group-hover:text-foreground" />
            </div>
            <span>Mon profil client</span>
          </Link>
          <Link
            href="/home"
            className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-all duration-200 font-medium"
          >
            <div className="w-7 h-7 rounded-md flex items-center justify-center group-hover:bg-muted">
              <Home className="w-3.5 h-3.5 text-muted-foreground/70 group-hover:text-foreground" />
            </div>
            <span>Site public</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
