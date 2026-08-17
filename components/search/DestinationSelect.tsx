"use client"

import { MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  placeholder = "Où souhaitez-vous aller ?",
  className = "",
}: DestinationSelectProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        Destination
      </Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none shrink-0" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          list="destinations-list"
          className="pl-10 h-9 rounded-lg"
        />
        {options.length > 0 && (
          <datalist id="destinations-list">
            {options.map((dest, i) => (
              <option key={i} value={dest} />
            ))}
          </datalist>
        )}
      </div>
    </div>
  )
}
