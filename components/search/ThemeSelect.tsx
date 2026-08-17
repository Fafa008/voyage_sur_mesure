"use client"

import { Compass } from "lucide-react"
import type { SearchFilterOption } from "@/types/search"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

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
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        Thème
      </Label>
      <div className="relative">
        <Compass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none shrink-0 z-10" />
        <Select
          value={value?.toString() ?? null}
          onValueChange={(val) => onChange(val ? Number(val) : null)}
        >
          <SelectTrigger className="pl-10 h-9 rounded-lg">
            <SelectValue placeholder="Tous les thèmes" />
          </SelectTrigger>
          <SelectContent>
            {options.map((theme) => (
              <SelectItem key={theme.id} value={theme.id.toString()}>
                {theme.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
