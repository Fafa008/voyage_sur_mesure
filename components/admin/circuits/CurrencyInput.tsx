"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SUPPORTED_CURRENCIES, CurrencyCode } from "@/lib/services/currency.service";

interface CurrencyInputProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
  sublabel?: string;
  defaultCurrency?: CurrencyCode;
  onCurrencyChange?: (currency: CurrencyCode) => void;
  name?: string; // Required for form submission
}

function CurrencyInput({
  label,
  id,
  error,
  sublabel,
  defaultCurrency = "MGA",
  onCurrencyChange,
  name,
  className,
  ...props
}: CurrencyInputProps) {
  const [currency, setCurrency] = React.useState<CurrencyCode>(defaultCurrency);
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const currentConfig = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.MGA;

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    onCurrencyChange?.(newCurrency);
    setIsOpen(false);
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Generate currency field name
  const currencyFieldName = name ? `${name}Currency` : undefined;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {sublabel && (
          <span className="text-xs text-muted-foreground">{sublabel}</span>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id={id}
            name={name}
            data-slot="currency-input"
            className={cn(
              "h-9 rounded-lg",
              error && "border-destructive focus-visible:ring-destructive/30",
              className
            )}
            {...props}
          />
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-xs font-semibold text-foreground shadow-xs transition-all hover:bg-muted/80 hover:border-primary/40 focus:outline-hidden focus:ring-2 focus:ring-primary/20 h-9 min-w-[80px]"
          >
            <span className="text-sm leading-none">{currentConfig.flag}</span>
            <span className="font-bold">{currentConfig.code}</span>
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-1.5 w-40 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95 z-50">
              <div className="space-y-0.5">
                {Object.values(SUPPORTED_CURRENCIES).map((item) => {
                  const isSelected = item.code === currency;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => handleCurrencyChange(item.code)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors text-left cursor-pointer",
                        isSelected
                          ? "bg-primary/10 text-primary font-bold backdrop-blur-sm"
                          : "text-foreground hover:bg-muted/80 hover:backdrop-blur-sm font-medium"
                      )}
                    >
                      <span className="text-base leading-none">{item.flag}</span>
                      <div className="flex flex-col">
                        <span className="font-semibold leading-none">{item.code}</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {item.symbol}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden field to submit selected currency */}
      {currencyFieldName && (
        <input type="hidden" name={currencyFieldName} value={currency} />
      )}

      {error && (
        <p className="text-destructive text-xs font-medium">{error}</p>
      )}
    </div>
  );
}

export { CurrencyInput };
