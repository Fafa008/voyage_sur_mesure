"use client"

import { Calendar } from "lucide-react"
import { SearchSelectField } from "./SearchSelectField"

interface DurationSelectProps {
  value?: string | null
  onChange: (value: string | null) => void
  className?: string
}

const DURATION_OPTIONS = [
  { value: "3-5", label: "3 – 5 jours" },
  { value: "5-8", label: "5 – 8 jours" },
  { value: "8-15", label: "8 – 15 jours" },
  { value: "15+", label: "15 jours et +" },
]

export function DurationSelect({
  value,
  onChange,
  className = "",
}: DurationSelectProps) {
  return (
    <SearchSelectField
      label="Durée"
      icon={<Calendar className="w-4 h-4" />}
      options={DURATION_OPTIONS}
      value={value ?? null}
      onChange={(val) => onChange(val || null)}
      placeholder="Toutes les durées"
      className={className}
    />
  )
}
