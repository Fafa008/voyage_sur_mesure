import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface InputFieldProps extends React.ComponentProps<"input"> {
  label: string
  error?: string
  icon?: React.ReactNode
  sublabel?: string
}

function InputField({
  label,
  id,
  error,
  icon,
  sublabel,
  className,
  readOnly,
  ...props
}: InputFieldProps) {
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
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {icon}
          </div>
        )}
        <Input
          id={id}
          name={id}
          readOnly={readOnly}
          data-slot="input-field"
          className={cn(
            "h-9 rounded-lg",
            icon && "pl-10",
            readOnly && "bg-muted/60 text-muted-foreground cursor-not-allowed",
            error && "border-destructive focus-visible:ring-destructive/30",
            className
          )}
          {...props}
        />
      </div>

      {error && (
        <p className="text-destructive text-xs font-medium">{error}</p>
      )}
    </div>
  )
}

export { InputField }
