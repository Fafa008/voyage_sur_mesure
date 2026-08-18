"use client"

import { MapPin } from "lucide-react"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
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
  placeholder = "Toutes les destinations",
  className = "",
}: DestinationSelectProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        Destination
      </Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none shrink-0 z-10" />
        <Select
          items={options.map((dest) => ({ label: dest, value: dest }))}
          value={value || null}
          onValueChange={(val) => onChange(val ?? "")}
        >
          <SelectTrigger className="pl-10 h-9 rounded-lg">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((dest) => (
              <SelectItem key={dest} value={dest}>
                {dest}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
