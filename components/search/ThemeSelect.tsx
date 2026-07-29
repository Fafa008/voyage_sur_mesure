"use client";

import { Compass } from "lucide-react";
import type { SearchFilterOption } from "@/types/search";

interface ThemeSelectProps {
  value?: number | null;
  onChange: (value: number | null) => void;
  options: SearchFilterOption[];
  className?: string;
}

export function ThemeSelect({
  value,
  onChange,
  options = [],
  className = "",
}: ThemeSelectProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        Thème
      </label>
      <div className="relative flex items-center">
        <Compass className="absolute left-3.5 w-4 h-4 text-primary pointer-events-none shrink-0" />
        <select
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : null)
          }
          className="w-full py-2.5 pl-10 pr-8 text-sm text-foreground bg-card border border-border/60 rounded-xl shadow-xs transition-all hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer appearance-none"
        >
          <option value="">Tous les thèmes</option>
          {options.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.nom}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 pointer-events-none text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
