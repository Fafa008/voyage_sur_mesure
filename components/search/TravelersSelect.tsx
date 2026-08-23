"use client"

import { Users } from "lucide-react"
import { SearchSelectField } from "./SearchSelectField"

interface TravelersSelectProps {
  value?: number | null
  onChange: (value: number | null) => void
  className?: string
}

const TRAVELER_OPTIONS = [
  { value: "1", label: "1 voyageur" },
  { value: "2", label: "2 voyageurs" },
  { value: "3", label: "3 voyageurs" },
  { value: "4", label: "4 voyageurs" },
  { value: "5", label: "5+ voyageurs" },
]

export function TravelersSelect({
  value,
  onChange,
  className = "",
}: TravelersSelectProps) {
  return (
    <SearchSelectField
      label="Voyageurs"
      icon={<Users className="w-4 h-4" />}
      options={TRAVELER_OPTIONS}
      value={value?.toString() ?? null}
      onChange={(val) => onChange(val ? Number(val) : null)}
      placeholder="Tous les voyageurs"
      className={className}
    />
  )
}
