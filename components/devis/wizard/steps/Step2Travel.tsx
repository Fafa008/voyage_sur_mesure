// components/devis/wizard/steps/Step2Travel.tsx
"use client";

import { TravelSection } from "@/components/devis/sections/TravelSection";
import type { DevisFormData, DevisOption } from "@/types/devis";

interface Step2Props {
  data: DevisFormData;
  updateData: (newData: Partial<DevisFormData>) => void;
  circuits: DevisOption[];
  themes: DevisOption[];
  regions: DevisOption[];
}

export function Step2Travel({
  data,
  updateData,
  circuits,
  themes,
  regions,
}: Step2Props) {
  // Fonctions pour gérer les tableaux (checkbox)
  const handleArrayChange = (
    field: keyof DevisFormData,
    value: string,
    checked: boolean,
  ) => {
    const current = (data[field] as string[]) ?? [];
    if (checked) {
      updateData({ [field]: [...current, value] });
    } else {
      updateData({ [field]: current.filter((v) => v !== value) });
    }
  };

  return (
    <TravelSection
      data={data}
      updateData={updateData}
      circuits={circuits}
      themes={themes}
      regions={regions}
    />
  );
}
