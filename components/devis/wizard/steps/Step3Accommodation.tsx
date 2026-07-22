// components/devis/wizard/steps/Step3Accommodation.tsx
"use client";

import { AccommodationSection } from "@/components/devis/sections/AccommodationSection";
import type { DevisFormData } from "@/types/devis";

interface Step3Props {
  data: DevisFormData;
  updateData: (newData: Partial<DevisFormData>) => void;
}

export function Step3Accommodation({ data, updateData }: Step3Props) {
  const handleChange = (field: string, value: string) => {
    updateData({ [field]: value });
  };

  return <AccommodationSection data={data} onChange={handleChange} />;
}
