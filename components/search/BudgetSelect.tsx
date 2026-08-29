"use client"

import { DollarSign } from "lucide-react"
import { SearchSelectField } from "./SearchSelectField"
import { useCurrency } from "@/components/providers/CurrencyProvider"

interface BudgetSelectProps {
  value?: number | null
  onChange: (value: number | null) => void
  className?: string
}

const BUDGET_VALUES = [500000, 1000000, 1500000, 2000000, 3000000]

export function BudgetSelect({
  value,
  onChange,
  className = "",
}: BudgetSelectProps) {
  const { formatPrice } = useCurrency()
  
  const BUDGET_OPTIONS = BUDGET_VALUES.map(budget => ({
    value: budget.toString(),
    label: `Jusqu'à ${formatPrice(budget)}`
  }))

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
