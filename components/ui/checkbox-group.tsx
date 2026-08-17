"use client"

import { Check } from "lucide-react"

interface Option {
  value: string
  label: string
  sublabel?: string
  icon?: React.ReactNode
}

interface CheckboxGroupProps {
  label: string
  name: string
  options: Option[]
  values: string[]
  onChange: (value: string, checked: boolean) => void
  className?: string
  sublabel?: string
}

function CheckboxGroup({
  label,
  name,
  options,
  values = [],
  onChange,
  className = "",
  sublabel,
}: CheckboxGroupProps) {
  return (
    <div data-slot="checkbox-group" className={`space-y-2.5 ${className}`}>
      <div>
        <div className="flex items-center justify-between">
          <span className="block text-sm font-semibold text-foreground">
            {label}
          </span>
          {values.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {values.length} sélectionné{values.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {sublabel && (
          <span className="block text-xs text-muted-foreground mt-0.5">
            {sublabel}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {options.map(({ value, label: itemLabel, sublabel: itemSublabel, icon }) => {
          const isSelected = values.includes(value)

          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value, !isSelected)}
              data-slot="checkbox-item"
              className={`relative flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer select-none ${
                isSelected
                  ? "bg-primary/10 border-primary/50 text-foreground"
                  : "bg-card border-border hover:border-primary/30 hover:bg-muted/30 text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5 pr-2 min-w-0">
                {icon && (
                  <span
                    className={`transition-colors shrink-0 ${
                      isSelected ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {icon}
                  </span>
                )}
                <div className="min-w-0">
                  <span className="block text-xs sm:text-sm font-medium truncate">
                    {itemLabel}
                  </span>
                  {itemSublabel && (
                    <span className="block text-[10px] text-muted-foreground truncate">
                      {itemSublabel}
                    </span>
                  )}
                </div>
              </div>

              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/30 bg-background"
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>

              <input
                type="checkbox"
                name={name}
                value={value}
                checked={isSelected}
                onChange={() => {}}
                className="sr-only"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { CheckboxGroup }
