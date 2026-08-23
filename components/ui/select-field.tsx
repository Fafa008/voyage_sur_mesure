"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

interface SelectFieldProps {
  label: string
  id: string
  name?: string
  options: { value: string; label: string }[]
  error?: string
  icon?: React.ReactNode
  sublabel?: string
  defaultValue?: string
  value?: string | null
  onValueChange?: (value: string) => void
  className?: string
  placeholder?: string
}

function SelectField({
  label,
  id,
  name,
  options,
  error,
  icon,
  sublabel,
  defaultValue,
  value,
  onValueChange,
  className,
  placeholder = "Sélectionner...",
}: SelectFieldProps) {
  const isControlled = value !== undefined

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {sublabel && (
          <span className="text-xs text-muted-foreground">{sublabel}</span>
        )}
      </div>

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
            {icon}
          </div>
        )}
        <Select
          items={options}
          name={name || id}
          {...(isControlled
            ? { value: value ?? null }
            : { defaultValue: defaultValue ?? null })}
          onValueChange={(val) => {
            if (onValueChange) {
              onValueChange(val ?? "")
            }
          }}
        >
          <SelectTrigger
            id={id}
            data-slot="select-field"
            className={cn(
              "h-9 rounded-lg",
              icon && "pl-10",
              error && "border-destructive focus:ring-destructive/30",
              className
            )}
          >
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

      {error && (
        <p className="text-destructive text-xs font-medium">{error}</p>
      )}
    </div>
  )
}

export { SelectField }
