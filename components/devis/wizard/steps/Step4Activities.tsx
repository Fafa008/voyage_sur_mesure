// components/devis/wizard/steps/Step4Activities.tsx
"use client";

import { ActivitiesTransportSection } from "@/components/devis/sections/ActivitiesTransportSection";
import type { DevisFormData } from "@/types/devis";

interface Step4Props {
  data: DevisFormData;
  updateData: (newData: Partial<DevisFormData>) => void;
}

export function Step4Activities({ data, updateData }: Step4Props) {
  const handleArrayChange = (
    field: string,
    value: string,
    checked: boolean,
  ) => {
    const current = (data[field as keyof DevisFormData] as string[]) ?? [];
    if (checked) {
      updateData({ [field]: [...current, value] } as Partial<DevisFormData>);
    } else {
      updateData({
        [field]: current.filter((v) => v !== value),
      } as Partial<DevisFormData>);
    }
  };

  return (
    <ActivitiesTransportSection data={data} onArrayChange={handleArrayChange} />
  );
}
