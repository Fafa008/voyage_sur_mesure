"use client";

import { PriceDisplay } from "@/components/currency/PriceDisplay";

interface CircuitPriceDisplayProps {
  amount: number | null | undefined;
}

export function CircuitPriceDisplay({ amount }: CircuitPriceDisplayProps) {
  return (
    <PriceDisplay 
      amount={amount} 
      fallback="-"
      size="sm"
    />
  );
}
