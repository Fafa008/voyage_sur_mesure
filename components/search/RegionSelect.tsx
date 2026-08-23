"use client"

import { Globe } from "lucide-react"
import type { SearchFilterOption } from "@/types/search"
import { SearchSelectField } from "./SearchSelectField"

interface RegionSelectProps {
  value?: number | null
  onChange: (value: number | null) => void
  options: SearchFilterOption[]
  className?: string
}

export function RegionSelect({
  value,
  onChange,
  options = [],
  className = "",
}: RegionSelectProps) {
  return (
    <SearchSelectField
      label="Région"
      icon={<Globe className="w-4 h-4" />}
      options={options.map((region) => ({
        value: region.id.toString(),
        label: region.nom,
      }))}
      value={value?.toString() ?? null}
      onChange={(val) => onChange(val ? Number(val) : null)}
      placeholder="Toutes les régions"
      className={className}
    />
  )
}
