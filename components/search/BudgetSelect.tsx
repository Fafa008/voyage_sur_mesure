"use client";

import { DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface BudgetSelectProps {
  value?: number | null;
  onChange: (value: number | null) => void;
  className?: string;
}

const budgetOptions = [
  { value: 500000, label: `Jusqu'à ${formatCurrency(500000)}` },
  { value: 1000000, label: `Jusqu'à ${formatCurrency(1000000)}` },
  { value: 1500000, label: `Jusqu'à ${formatCurrency(1500000)}` },
  { value: 2000000, label: `Jusqu'à ${formatCurrency(2000000)}` },
  { value: 3000000, label: `Jusqu'à ${formatCurrency(3000000)}` },
];

export function BudgetSelect({
  value,
  onChange,
  className = "",
}: BudgetSelectProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        Budget Max
      </label>
      <div className="relative flex items-center">
        <DollarSign className="absolute left-3.5 w-4 h-4 text-primary pointer-events-none shrink-0" />
        <select
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : null)
          }
          className="w-full py-2.5 pl-10 pr-8 text-sm text-foreground bg-card border border-border/60 rounded-xl shadow-xs transition-all hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer appearance-none"
        >
          <option value="">Tous les budgets</option>
          {budgetOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
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
