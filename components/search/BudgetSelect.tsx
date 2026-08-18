"use client"

import { DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface BudgetSelectProps {
  value?: number | null
  onChange: (value: number | null) => void
  className?: string
}

const budgetOptions = [
  { value: "500000", label: `Jusqu'à ${formatCurrency(500000)}` },
  { value: "1000000", label: `Jusqu'à ${formatCurrency(1000000)}` },
  { value: "1500000", label: `Jusqu'à ${formatCurrency(1500000)}` },
  { value: "2000000", label: `Jusqu'à ${formatCurrency(2000000)}` },
  { value: "3000000", label: `Jusqu'à ${formatCurrency(3000000)}` },
]

export function BudgetSelect({
  value,
  onChange,
  className = "",
}: BudgetSelectProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        Budget Max
      </Label>
      <div className="relative">
        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none shrink-0 z-10" />
        <Select
          items={budgetOptions}
          value={value?.toString() ?? null}
          onValueChange={(val) => onChange(val ? Number(val) : null)}
        >
          <SelectTrigger className="pl-10 h-9 rounded-lg">
            <SelectValue placeholder="Tous les budgets" />
          </SelectTrigger>
          <SelectContent>
            {budgetOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
