// components/devis/wizard/steps/Step6Complementary.tsx
"use client";

import { ComplementarySection } from "@/components/devis/sections/ComplementarySection";
import type { DevisFormData } from "@/types/devis";

interface Step6Props {
  data: DevisFormData;
  updateData: (newData: Partial<DevisFormData>) => void;
}

export function Step6Complementary({ data, updateData }: Step6Props) {
  const handleChange = (field: string, value: string | boolean) => {
    updateData({ [field]: value });
  };

  return <ComplementarySection data={data} onChange={handleChange} />;
}
