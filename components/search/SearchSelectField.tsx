"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface SearchSelectOption {
  value: string
  label: string
}

interface SearchSelectFieldProps {
  /** Label affiché au-dessus du champ */
  label: string
  /** Icône Lucide positionnée à gauche dans le trigger */
  icon: React.ReactNode
  /** Liste des options */
  options: SearchSelectOption[]
  /** Valeur sélectionnée (string ou null = aucune sélection) */
  value: string | null
  /** Callback déclenché à chaque changement de sélection */
  onChange: (value: string | null) => void
  /** Texte affiché quand aucune option n'est sélectionnée */
  placeholder?: string
  /** Classes CSS additionnelles sur le wrapper */
  className?: string
}

/**
 * Composant Select générique pour la SearchBar.
 * Encapsule le Label + l'icône + le Select de shadcn/ui (Base UI).
 * Utilisé par : DestinationSelect, ThemeSelect, RegionSelect,
 *               DurationSelect, BudgetSelect, TravelersSelect.
 */
export function SearchSelectField({
  label,
  icon,
  options,
  value,
  onChange,
  placeholder = "Tous",
  className,
}: SearchSelectFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-foreground/80">
        {label}
      </Label>
      <div className="relative">
        {/* Icône flottante à gauche, non-interactive */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none shrink-0 z-10">
          {icon}
        </div>

        <Select
          items={options}
          value={value}
          onValueChange={(val) => onChange(val)}
        >
          <SelectTrigger className="pl-10 h-10 rounded-xl bg-background text-foreground border-input shadow-2xs hover:border-primary/50 focus:border-ring">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
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
