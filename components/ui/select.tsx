"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

function Select<Value = string | null>({ ...props }: SelectPrimitive.Root.Props<Value>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectTrigger({
  className,
  placeholder,
  ...props
}: SelectPrimitive.Trigger.Props & {
  placeholder?: string
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "group flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-2xs transition-colors",
        "placeholder:text-muted-foreground",
        "hover:border-primary/50",
        "focus:border-ring focus:outline-hidden focus:ring-2 focus:ring-ring/30",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    >
      <SelectPrimitive.Value placeholder={placeholder} className="truncate text-foreground" />
      <SelectPrimitive.Icon className="shrink-0 text-muted-foreground transition-transform duration-200 group-hover:text-foreground">
        <ChevronDown className="size-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  alignItemWithTrigger = false,
  ...props
}: SelectPrimitive.Popup.Props & {
  alignItemWithTrigger?: boolean
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner sideOffset={4} alignItemWithTrigger={alignItemWithTrigger} className="z-50">
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            // Fond 100% opaque avec bordure et ombre nette en Light et Dark Mode
            "z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl outline-hidden",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          <SelectPrimitive.List className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
            {children}
          </SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg py-2 pl-8 pr-3 text-sm text-popover-foreground outline-hidden transition-colors",
        // Hover et focus clairs
        "hover:bg-accent hover:text-accent-foreground",
        "focus:bg-accent focus:text-accent-foreground",
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
        // État sélectionné clairement visible
        "data-selected:bg-primary/10 data-selected:text-primary data-selected:font-semibold",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      <span className="absolute left-2.5 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4 text-primary stroke-[2.5]" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText className="truncate">{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value {...props} />
}

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
}
