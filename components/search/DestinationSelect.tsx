"use client"

import { MapPin } from "lucide-react"
import { SearchSelectField } from "./SearchSelectField"

interface DestinationSelectProps {
  value?: string
  onChange: (value: string) => void
  options?: string[]
  placeholder?: string
  className?: string
}

export function DestinationSelect({
  value = "",
  onChange,
  options = [],
  placeholder = "Toutes les destinations",
  className = "",
}: DestinationSelectProps) {
  return (
    <SearchSelectField
      label="Destination"
      icon={<MapPin className="w-4 h-4" />}
      options={options.map((dest) => ({ value: dest, label: dest }))}
      // "" signifie "aucun filtre" → null pour Base UI (affiche le placeholder)
      value={value || null}
      onChange={(val) => onChange(val ?? "")}
      placeholder={placeholder}
      className={className}
    />
  )
}
