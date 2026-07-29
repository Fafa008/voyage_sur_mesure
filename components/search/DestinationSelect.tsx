"use client";

import { MapPin } from "lucide-react";

interface DestinationSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options?: string[];
  placeholder?: string;
  className?: string;
}

export function DestinationSelect({
  value = "",
  onChange,
  options = [],
  placeholder = "Où souhaitez-vous aller ?",
  className = "",
}: DestinationSelectProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        Destination
      </label>
      <div className="relative flex items-center">
        <MapPin className="absolute left-3.5 w-4 h-4 text-primary pointer-events-none shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          list="destinations-list"
          className="w-full py-2.5 pl-10 pr-3.5 text-sm text-foreground bg-card border border-border/60 rounded-xl shadow-xs transition-all hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground/70"
        />
        {options.length > 0 && (
          <datalist id="destinations-list">
            {options.map((dest, i) => (
              <option key={i} value={dest} />
            ))}
          </datalist>
        )}
      </div>
    </div>
  );
}
