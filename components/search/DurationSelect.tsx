"use client"

import { Calendar } from "lucide-react"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface DurationSelectProps {
  value?: string | null
  onChange: (value: string | null) => void
  className?: string
}

const durationOptions = [
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
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        Durée
      </Label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none shrink-0 z-10" />
        <Select
          value={value ?? null}
          onValueChange={(val) => onChange(val || null)}
        >
          <SelectTrigger className="pl-10 h-9 rounded-lg">
            <SelectValue placeholder="Toutes les durées" />
          </SelectTrigger>
          <SelectContent>
            {durationOptions.map((opt) => (
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
