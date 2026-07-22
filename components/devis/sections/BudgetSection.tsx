// components/devis/sections/BudgetSection.tsx
"use client";

import { InputField } from "@/components/ui/InputField";

interface BudgetSectionProps {
  data: {
    budgetMin: number;
    budgetMax: number;
  };
  onChange: (field: string, value: number) => void;
}

export function BudgetSection({ data, onChange }: BudgetSectionProps) {
  return (
    <section className="border rounded-lg p-6 bg-gray-50">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
          5
        </span>
        Budget
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Budget minimum (par personne)"
          id="budgetMin"
          type="number"
          min="0"
          placeholder="500"
          value={String(data.budgetMin)}
          onChange={(e) =>
            onChange("budgetMin", parseFloat(e.target.value) || 0)
          }
        />
        <InputField
          label="Budget maximum (par personne)"
          id="budgetMax"
          type="number"
          min="0"
          placeholder="3000"
          value={String(data.budgetMax)}
          onChange={(e) =>
            onChange("budgetMax", parseFloat(e.target.value) || 0)
          }
        />
      </div>
    </section>
  );
}
