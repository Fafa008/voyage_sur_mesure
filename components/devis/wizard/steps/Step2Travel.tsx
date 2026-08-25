// components/devis/wizard/steps/Step2Travel.tsx
"use client";

import { TravelSection } from "@/components/devis/sections/TravelSection";
import type { DevisFormData, DevisOption, CircuitPreview } from "@/types/devis";

interface Step2Props {
  data: DevisFormData;
  updateData: (newData: Partial<DevisFormData>) => void;
  circuits: DevisOption[];
  themes: DevisOption[];
  regions: DevisOption[];
  preselectedCircuit?: CircuitPreview | null;
}

export function Step2Travel({
  data,
  updateData,
  circuits,
  themes,
  regions,
  preselectedCircuit,
}: Step2Props) {
  return (
    <TravelSection
      data={data}
      updateData={updateData}
      circuits={circuits}
      themes={themes}
      regions={regions}
      preselectedCircuit={preselectedCircuit}
    />
  );
}
