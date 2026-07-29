// components/devis/sections/BudgetSection.tsx
"use client";

import { InputField } from "@/components/ui/InputField";
import { Coins, Euro, Sparkles, Check } from "lucide-react";

interface BudgetSectionProps {
  data: {
    budgetMin: number;
    budgetMax: number;
  };
  onChange: (field: string, value: number) => void;
}

const budgetPresets = [
  { label: "Économique", min: 500, max: 1200, desc: "Essentiel & Logements simples" },
  { label: "Équilibré", min: 1200, max: 2500, desc: "Très bon confort & Activités incluses" },
  { label: "Premium", min: 2500, max: 4500, desc: "Hôtels 4-5★ & Excursions privées" },
  { label: "Luxe & Prestige", min: 4500, max: 10000, desc: "Sur-mesure d'exception & Conciergerie" },
];

export function BudgetSection({ data, onChange }: BudgetSectionProps) {
  const applyPreset = (min: number, max: number) => {
    onChange("budgetMin", min);
    onChange("budgetMax", max);
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base shadow-xs">
          5
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Votre Enveloppe Budgétaire
          </h2>
          <p className="text-xs text-muted-foreground">
            Précisez le budget estimé par personne pour nous aider à sélectionner les prestations adaptées
          </p>
        </div>
      </div>

      {/* Presets rapides */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-foreground">
          Options de budget indicatif (par personne)
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {budgetPresets.map((preset) => {
            const isMatch =
              data.budgetMin === preset.min && data.budgetMax === preset.max;

            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.min, preset.max)}
                className={`relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                  isMatch
                    ? "bg-primary/10 border-primary shadow-xs"
                    : "bg-card border-border hover:border-primary/40 hover:bg-accent/40"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-sm text-foreground">
                    {preset.label}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                      isMatch
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground/30 bg-background"
                    }`}
                  >
                    {isMatch && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <span className="text-xs font-bold text-primary">
                  {preset.min} € - {preset.max} €
                </span>
                <span className="text-[10px] text-muted-foreground mt-1">
                  {preset.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Champs manuels */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Budget Personnalisé (par personne)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            label="Budget minimum (€)"
            id="budgetMin"
            type="number"
            min="0"
            step="100"
            placeholder="Ex: 1000"
            icon={<Euro className="w-4 h-4" />}
            value={data.budgetMin ? String(data.budgetMin) : ""}
            onChange={(e) =>
              onChange("budgetMin", parseFloat(e.target.value) || 0)
            }
          />

          <InputField
            label="Budget maximum (€)"
            id="budgetMax"
            type="number"
            min="0"
            step="100"
            placeholder="Ex: 2500"
            icon={<Euro className="w-4 h-4" />}
            value={data.budgetMax ? String(data.budgetMax) : ""}
            onChange={(e) =>
              onChange("budgetMax", parseFloat(e.target.value) || 0)
            }
          />
        </div>
      </div>
    </div>
  );
}
