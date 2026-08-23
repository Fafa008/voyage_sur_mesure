"use client"

import { Compass } from "lucide-react"
import type { SearchFilterOption } from "@/types/search"
import { SearchSelectField } from "./SearchSelectField"

interface ThemeSelectProps {
  value?: number | null
  onChange: (value: number | null) => void
  options: SearchFilterOption[]
  className?: string
}

export function ThemeSelect({
  value,
  onChange,
  options = [],
  className = "",
}: ThemeSelectProps) {
  return (
    <SearchSelectField
      label="Thème"
      icon={<Compass className="w-4 h-4" />}
      options={options.map((theme) => ({
        value: theme.id.toString(),
        label: theme.nom,
      }))}
      value={value?.toString() ?? null}
      onChange={(val) => onChange(val ? Number(val) : null)}
      placeholder="Tous les thèmes"
      className={className}
    />
  )
}
