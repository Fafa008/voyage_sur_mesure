"use client"

import { DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { SearchSelectField } from "./SearchSelectField"

interface BudgetSelectProps {
  value?: number | null
  onChange: (value: number | null) => void
  className?: string
}

const BUDGET_OPTIONS = [
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
    <SearchSelectField
      label="Budget Max"
      icon={<DollarSign className="w-4 h-4" />}
      options={BUDGET_OPTIONS}
      value={value?.toString() ?? null}
      onChange={(val) => onChange(val ? Number(val) : null)}
      placeholder="Tous les budgets"
      className={className}
    />
  )
}
