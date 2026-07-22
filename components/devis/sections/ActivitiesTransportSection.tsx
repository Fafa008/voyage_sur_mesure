// components/devis/sections/ActivitiesTransportSection.tsx
"use client";

import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import type { DevisFormData } from "@/types/devis";

interface ActivitiesTransportSectionProps {
  data: Pick<DevisFormData, "activites" | "transport">;
  onArrayChange: (field: string, value: string, checked: boolean) => void;
}

export function ActivitiesTransportSection({
  data,
  onArrayChange,
}: ActivitiesTransportSectionProps) {
  const activiteOptions = [
    "Randonnée pédestre",
    "Trek",
    "Plongée",
    "Snorkeling",
    "Kayak",
    "Observation faune",
    "Visite culturelle",
    "Détente",
    "Sport nautique",
    "Quad",
    "VTT",
    "Excursion en pirogue",
  ].map((v) => ({ value: v, label: v }));

  const transportOptions = [
    "Voiture 4x4",
    "Minibus",
    "Avion local",
    "Bateau",
    "Train",
    "A pied",
  ].map((v) => ({ value: v, label: v }));

  return (
    <section className="border rounded-lg p-6 bg-white">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
          4
        </span>
        Activités & Transport
      </h2>
      <div className="space-y-4">
        <CheckboxGroup
          label="Activités souhaitées"
          name="activites"
          options={activiteOptions}
          values={data.activites}
          onChange={(value, checked) =>
            onArrayChange("activites", value, checked)
          }
        />

        <CheckboxGroup
          label="Type de transport préféré"
          name="transport"
          options={transportOptions}
          values={data.transport}
          onChange={(value, checked) =>
            onArrayChange("transport", value, checked)
          }
        />
      </div>
    </section>
  );
}
