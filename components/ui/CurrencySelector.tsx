"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useIsClient } from "@/hooks/useIsClient";
import { CurrencyCode, SUPPORTED_CURRENCIES } from "@/lib/services/currency.service";
import { Check, ChevronDown, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface CurrencySelectorProps {
  className?: string;
  variant?: "header" | "compact" | "inline" | "fixed";
}

export function CurrencySelector({
  className,
  variant = "header",
}: CurrencySelectorProps) {
  const { currency, setCurrency, supportedCurrencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useIsClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentConfig = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.MGA;

  // For fixed bottom-right variant, use different positioning
  const isFixed = variant === "fixed";

  // Fermer au clic extérieur
  useEffect(() => {
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

  // Fermer avec la touche Échap
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code: CurrencyCode) => {
    setCurrency(code);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative inline-block text-left", className, isFixed && "fixed bottom-4 right-4 z-50")} ref={dropdownRef}>
      <button
        type="button"
        id="currency-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={mounted ? `Changer la devise d'affichage (actuelle : ${currentConfig.name})` : "Changer la devise d'affichage"}
        className={cn(
          "inline-flex items-center justify-between gap-1.5 rounded-lg border border-border/60 bg-background/80 px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-all hover:bg-muted/80 hover:border-primary/40 focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer",
          variant === "compact" && "px-2 py-1 text-[11px]",
          isFixed && "bg-background/95 backdrop-blur-md shadow-lg",
          isOpen && "border-primary/60 ring-2 ring-primary/20"
        )}
      >
        <span className="text-base leading-none">{mounted ? currentConfig.flag : SUPPORTED_CURRENCIES.MGA.flag}</span>
        <span className="font-bold">{mounted ? currentConfig.code : SUPPORTED_CURRENCIES.MGA.code}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Sélectionner une devise"
          className={cn(
            "w-52 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95",
            isFixed ? "absolute bottom-full right-0 mb-2" : "absolute right-0 mt-1.5"
          )}
        >
          <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5 border-b border-border/40 mb-1">
            <Coins className="w-3 h-3 text-primary" />
            <span>Devise d&apos;affichage</span>
          </div>

          <div className="space-y-0.5">
            {supportedCurrencies.map((item) => {
              const isSelected = item.code === currency;
              return (
                <button
                  key={item.code}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => handleSelect(item.code)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors text-left cursor-pointer",
                    isSelected
                      ? "bg-primary/10 text-primary font-bold backdrop-blur-sm"
                      : "text-foreground hover:bg-muted/80 hover:backdrop-blur-sm font-medium"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{item.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-semibold leading-none">{item.code}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        {item.name} ({item.symbol})
                      </span>
                    </div>
                  </div>

                  {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="mt-1.5 pt-1.5 border-t border-border/40 px-2 text-[9px] text-muted-foreground text-center">
            Paiement de référence en <strong>MGA</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrencySelector;
