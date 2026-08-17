"use client"

import { Users } from "lucide-react"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface TravelersSelectProps {
  value?: number | null
  onChange: (value: number | null) => void
  className?: string
}

const travelerOptions = [
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
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        Voyageurs
      </Label>
      <div className="relative">
        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none shrink-0 z-10" />
        <Select
          value={value?.toString() ?? null}
          onValueChange={(val) => onChange(val ? Number(val) : null)}
        >
          <SelectTrigger className="pl-10 h-9 rounded-lg">
            <SelectValue placeholder="Tous les voyageurs" />
          </SelectTrigger>
          <SelectContent>
            {travelerOptions.map((opt) => (
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
