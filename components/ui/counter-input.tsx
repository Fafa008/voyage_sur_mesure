"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CounterInputProps {
  label: string
  sublabel?: string
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  className?: string
}

function CounterInput({
  label,
  sublabel,
  value,
  min = 0,
  max = 99,
  onChange,
  className = "",
}: CounterInputProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  return (
    <div
      data-slot="counter-input"
      className={`flex items-center justify-between p-3 rounded-xl border border-border bg-card transition-colors hover:border-primary/30 ${className}`}
    >
      <div>
        <span className="block text-sm font-semibold text-foreground">
          {label}
        </span>
        {sublabel && (
          <span className="block text-xs text-muted-foreground mt-0.5">
            {sublabel}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label={`Diminuer ${label}`}
        >
          <Minus className="size-3.5" />
        </Button>

        <span className="w-7 text-center font-bold text-base text-foreground select-none">
          {value}
        </span>

        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label={`Augmenter ${label}`}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

export { CounterInput }
