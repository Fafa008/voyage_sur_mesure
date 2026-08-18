"use client"

import { Globe } from "lucide-react"
import type { SearchFilterOption } from "@/types/search"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

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
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        Région
      </Label>
      <div className="relative">
        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none shrink-0 z-10" />
        <Select
          items={options.map((region) => ({ label: region.nom, value: region.id.toString() }))}
          value={value?.toString() ?? null}
          onValueChange={(val) => onChange(val ? Number(val) : null)}
        >
          <SelectTrigger className="pl-10 h-9 rounded-lg">
            <SelectValue placeholder="Toutes les régions" />
          </SelectTrigger>
          <SelectContent>
            {options.map((region) => (
              <SelectItem key={region.id} value={region.id.toString()}>
                {region.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
