// components/devis/wizard/steps/Step5Budget.tsx
"use client";

import { BudgetSection } from "@/components/devis/sections/BudgetSection";
import type { DevisFormData } from "@/types/devis";

interface Step5Props {
  data: DevisFormData;
  updateData: (newData: Partial<DevisFormData>) => void;
}

export function Step5Budget({ data, updateData }: Step5Props) {
  const handleChange = (field: string, value: string | number) => {
    updateData({ [field]: value });
  };

  return <BudgetSection data={data} onChange={handleChange} />;
}
