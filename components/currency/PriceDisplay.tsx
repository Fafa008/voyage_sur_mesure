"use client";

import React, { useState, useRef, useEffect, useId, useCallback } from "react";
import { createPortal } from "react-dom";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useIsClient } from "@/hooks/useIsClient";
import {
  CurrencyCode,
  SUPPORTED_CURRENCIES,
} from "@/lib/services/currency.service";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  amount: number | string | { toString(): string } | null | undefined;
  fallback?: string;
  label?: string;
  showSelector?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  priceClassName?: string;
}

const sizeClasses: Record<NonNullable<PriceDisplayProps["size"]>, string> = {
  xs: "text-xs font-semibold",
  sm: "text-sm font-semibold",
  md: "text-base font-bold",
  lg: "text-xl font-bold",
  xl: "text-2xl font-extrabold",
};

const selectorSizeClasses: Record<
  NonNullable<PriceDisplayProps["size"]>,
  string
> = {
  xs: "px-1.5 py-0.5 text-[10px]",
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2 py-1 text-xs",
  lg: "px-2.5 py-1 text-xs",
  xl: "px-2.5 py-1.5 text-xs",
};

const DROPDOWN_WIDTH = 180;
const DROPDOWN_MARGIN = 8;
const DROPDOWN_GAP = 4;

export function PriceDisplay({
  amount,
  fallback = "Sur devis",
  label,
  showSelector = false,
  size = "md",
  className,
  priceClassName,
}: PriceDisplayProps) {
  const { currency, setCurrency, formatPrice, supportedCurrencies } =
    useCurrency();

  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const mounted = useIsClient();

  const id = useId();

  // ---------------------------------------------------------
  // Conversion du montant
  // ---------------------------------------------------------

  const numericAmount =
    amount === null || amount === undefined
      ? null
      : typeof amount === "number"
        ? amount
        : parseFloat(amount.toString());

  const isEmptyAmount =
    numericAmount === null ||
    Number.isNaN(numericAmount) ||
    numericAmount === 0;

  // Only format price after mount to prevent hydration mismatch
  // During SSR, show the amount in MGA to avoid hydration mismatch
  const displayValue = mounted && !isEmptyAmount ? formatPrice(numericAmount) : (numericAmount ? `${numericAmount.toLocaleString('fr-FR')} MGA` : null);
  
  // Use the mounted displayValue for rendering, or fallback to MGA format
  const renderedValue = displayValue || (numericAmount ? `${numericAmount.toLocaleString('fr-FR')} MGA` : fallback);

  const currentConfig =
    SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.MGA;

  // ---------------------------------------------------------
  // Position du dropdown
  // ---------------------------------------------------------

  const updatePosition = useCallback(() => {
    if (!buttonRef.current || !isOpen) {
      setDropdownPosition(null);
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    /*
     * On privilégie TOUJOURS l'affichage en dessous
     * du bouton.
     */
    const top = rect.bottom + DROPDOWN_GAP;

    let left = rect.left;

    // -------------------------------------------------------
    // Évite que le menu sorte à droite
    // -------------------------------------------------------

    if (left + DROPDOWN_WIDTH > viewportWidth - DROPDOWN_MARGIN) {
      left = viewportWidth - DROPDOWN_WIDTH - DROPDOWN_MARGIN;
    }

    // -------------------------------------------------------
    // Évite que le menu sorte à gauche
    // -------------------------------------------------------

    if (left < DROPDOWN_MARGIN) {
      left = DROPDOWN_MARGIN;
    }

    // -------------------------------------------------------
    // Si le bas de l'écran est trop proche
    // on réduit simplement la hauteur disponible.
    // On ne passe PAS automatiquement au-dessus.
    // -------------------------------------------------------

    const maxHeight = viewportHeight - top - DROPDOWN_MARGIN;

    setDropdownPosition({
      top,
      left,
    });

    /*
     * Stockage de la hauteur maximale dans
     * une variable CSS du dropdown.
     */
    document.documentElement.style.setProperty(
      "--currency-dropdown-max-height",
      `${Math.max(160, maxHeight)}px`,
    );
  }, [isOpen]);

  // ---------------------------------------------------------
  // Position + scroll + resize
  // ---------------------------------------------------------

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      updatePosition();
    });

    window.addEventListener("scroll", updatePosition, true);

    window.addEventListener("resize", updatePosition);

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener("scroll", updatePosition, true);

      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  // ---------------------------------------------------------
  // Clic extérieur
  // ---------------------------------------------------------

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
        setDropdownPosition(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // ---------------------------------------------------------
  // Escape
  // ---------------------------------------------------------

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setDropdownPosition(null);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // ---------------------------------------------------------
  // Sélection devise
  // ---------------------------------------------------------

  const handleSelect = (code: CurrencyCode) => {
    setCurrency(code);
    setIsOpen(false);
    setDropdownPosition(null);

    requestAnimationFrame(() => {
      buttonRef.current?.focus();
    });
  };

  // ---------------------------------------------------------
  // Toggle
  // ---------------------------------------------------------

  const toggleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (isOpen) {
      setIsOpen(false);
      setDropdownPosition(null);
    } else {
      setIsOpen(true);
    }
  };

  // ---------------------------------------------------------
  // Dropdown
  // ---------------------------------------------------------

  const dropdown =
    isOpen &&
    mounted &&
    dropdownPosition &&
    createPortal(
      <div
        ref={dropdownRef}
        id={`currency-dropdown-${id}`}
        role="listbox"
        aria-label="Sélectionner une devise"
        className={cn(
          "fixed",

          // Taille compacte
          "w-[180px]",

          // Apparence
          "rounded-xl",
          "border border-border/70",

          // Fond légèrement transparent
          "bg-popover/95",

          // Blur
          "backdrop-blur-md",

          // Ombre
          "shadow-xl",

          // Padding
          "p-1",

          // Animation
          "animate-in",
          "fade-in-0",
          "zoom-in-95",
          "duration-150",

          // Empêche le texte de sortir
          "overflow-hidden",
        )}
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          zIndex: 999999,
          maxHeight: "var(--currency-dropdown-max-height, 360px)",
        }}
      >
        {/* -------------------------------------------------
            HEADER
        -------------------------------------------------- */}

        <div
          className={cn(
            "mb-0.5",
            "border-b border-border/40",
            "px-2 py-1.5",
            "text-[9px]",
            "font-semibold",
            "uppercase",
            "tracking-wider",
            "text-muted-foreground",
          )}
        >
          Devise d&apos;affichage
        </div>

        {/* -------------------------------------------------
            LISTE
        -------------------------------------------------- */}

        <div
          className={cn(
            "max-h-[250px]",
            "overflow-y-auto",
            "overscroll-contain",

            // Scrollbar discrète
            "[scrollbar-width:thin]",
          )}
        >
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
                    "flex w-full",
                    "items-center",
                    "justify-between",
                    "gap-2",

                    // Plus compact
                    "rounded-lg",
                    "px-2",
                    "py-1.5",

                    "text-left",
                    "text-xs",

                    "transition-colors",
                    "cursor-pointer",

                    "focus:outline-none",
                    "focus:ring-2",
                    "focus:ring-primary/20",

                    isSelected
                      ? ["bg-primary/10", "font-bold", "text-primary", "backdrop-blur-sm"]
                      : ["font-medium", "text-foreground", "hover:bg-muted/80", "hover:backdrop-blur-sm"],
                  )}
                >
                  {/* Gauche */}
                  <div className="flex min-w-0 items-center gap-2">
                    {/* Flag */}
                    <span
                      className="shrink-0 text-sm leading-none"
                      aria-hidden="true"
                    >
                      {item.flag}
                    </span>

                    {/* Textes */}
                    <div className="flex min-w-0 flex-col">
                      <span className="font-semibold leading-tight">
                        {item.code}
                      </span>

                      <span
                        className={cn(
                          "mt-0.5",
                          "truncate",
                          "text-[9px]",
                          "leading-tight",
                          "text-muted-foreground",
                        )}
                      >
                        {item.name}
                      </span>
                    </div>
                  </div>

                  {/* Check */}
                  {isSelected && (
                    <Check
                      className="h-3.5 w-3.5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* -------------------------------------------------
            FOOTER
        -------------------------------------------------- */}

        <div
          className={cn(
            "mt-0.5",
            "border-t border-border/40",
            "px-2 pt-1.5",
            "text-center",
            "text-[8px]",
            "leading-tight",
            "text-muted-foreground",
          )}
        >
          Paiement de référence en{" "}
          <strong className="font-semibold">MGA</strong>
        </div>
      </div>,
      document.body,
    );

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {/* Label */}
      {label && (
        <span
          className={cn(
            "block text-[10px]",
            "font-medium uppercase",
            "tracking-wider",
            "text-muted-foreground",
          )}
        >
          {label}
        </span>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {/* Prix */}
        <span
          className={cn(
            "whitespace-nowrap",
            "tabular-nums",
            sizeClasses[size],

            isEmptyAmount ? "italic text-muted-foreground" : "text-foreground",

            priceClassName,
          )}
        >
          {isEmptyAmount ? fallback : renderedValue}
        </span>

        {/* Sélecteur */}
        {showSelector && !isEmptyAmount && (
          <div className="relative inline-block text-left">
            <button
              ref={buttonRef}
              type="button"
              id={`currency-selector-${id}`}
              onClick={toggleOpen}
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              aria-controls={isOpen ? `currency-dropdown-${id}` : undefined}
              aria-label={mounted ? `Changer la devise d'affichage (actuelle : ${currentConfig.name})` : "Changer la devise d'affichage"}
              className={cn(
                "inline-flex",
                "items-center",
                "gap-1",

                "rounded-md",
                "border",
                "border-border/60",

                "bg-background/80",

                "font-semibold",
                "text-foreground",

                "shadow-sm",

                "transition-all",
                "cursor-pointer",

                "hover:border-primary/40",
                "hover:bg-muted/80",

                "focus:outline-none",
                "focus:ring-2",
                "focus:ring-primary/20",

                selectorSizeClasses[size],

                isOpen && "border-primary/60 ring-2 ring-primary/20",
              )}
            >
              <span className="leading-none" aria-hidden="true">
                {mounted ? currentConfig.flag : SUPPORTED_CURRENCIES.MGA.flag}
              </span>

              <span>{mounted ? currentConfig.code : SUPPORTED_CURRENCIES.MGA.code}</span>

              <ChevronDown
                className={cn(
                  "h-3 w-3",
                  "text-muted-foreground",
                  "transition-transform",
                  "duration-200",

                  isOpen && "rotate-180 text-primary",
                )}
                aria-hidden="true"
              />
            </button>
          </div>
        )}

        {/* Dropdown */}
        {dropdown}
      </div>
    </div>
  );
}

export default PriceDisplay;
