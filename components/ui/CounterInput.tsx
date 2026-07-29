// components/ui/CounterInput.tsx
"use client";

import { Minus, Plus } from "lucide-react";

interface CounterInputProps {
  label: string;
  sublabel?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
}

export function CounterInput({
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
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border border-border bg-card shadow-xs transition-colors hover:border-primary/40 ${className}`}
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
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="w-8 h-8 rounded-lg border border-border bg-muted/50 text-foreground flex items-center justify-center transition-all hover:bg-accent hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          aria-label={`Diminuer ${label}`}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <span className="w-7 text-center font-bold text-base text-foreground select-none">
          {value}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="w-8 h-8 rounded-lg border border-border bg-muted/50 text-foreground flex items-center justify-center transition-all hover:bg-accent hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          aria-label={`Augmenter ${label}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
