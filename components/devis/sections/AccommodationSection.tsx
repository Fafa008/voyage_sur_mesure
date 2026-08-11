// components/devis/sections/AccommodationSection.tsx
"use client";

import { SelectField } from "@/components/ui/SelectField";
import { InputField } from "@/components/ui/InputField";
import {
  Building,
  Utensils,
  Hotel,
  Tent,
  Home,
  Sparkles,
  Check,
} from "lucide-react";

interface AccommodationSectionProps {
  data: {
    typeHebergement: string;
    regime: string;
    regimePrecision: string;
  };
  onChange: (field: string, value: string) => void;
}

const accommodationTypes = [
  {
    id: "hotel",
    title: "Hôtel Standard",
    desc: "Établissements 3★ à 4★ confortables & bien situés",
    icon: Hotel,
  },
  {
    id: "luxe",
    title: "Hôtel & Resort Luxe",
    desc: "Service 5★, spas, prestations haut de gamme",
    icon: Sparkles,
  },
  {
    id: "lodge",
    title: "Lodge & Écolodge",
    desc: "Hébergements typiques intégrés dans la nature",
    icon: Building,
  },
  {
    id: "camp",
    title: "Camping / Bivouac",
    desc: "Nuits sous tente, expérience immersive",
    icon: Tent,
  },
  {
    id: "gite",
    title: "Gîte & Chambre d'Hôtes",
    desc: "Convivialité et rencontres avec les locaux",
    icon: Home,
  },
  {
    id: "mixte",
    title: "Combinaison Mixte",
    desc: "Un mélange selon les étapes du circuit",
    icon: Building,
  },
];

export function AccommodationSection({
  data,
  onChange,
}: AccommodationSectionProps) {
  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base shadow-xs">
          3
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Hébergement & Restauration
          </h2>
          <p className="text-xs text-muted-foreground">
            Choisissez la gamme d&apos;hébergement souhaitée et vos préférences
            de repas
          </p>
        </div>
      </div>

      {/* 1. Sélection visuelle du type d'hébergement */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-foreground">
          Type d'hébergement privilégié
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {accommodationTypes.map((item) => {
            const Icon = item.icon;
            const isSelected = data.typeHebergement === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange("typeHebergement", item.id)}
                className={`relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 border-primary shadow-xs"
                    : "bg-card border-border hover:border-primary/40 hover:bg-accent/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground/30 bg-background"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Restauration & Régimes */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-5 shadow-xs">
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Régime alimentaire & Restauration
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SelectField
            label="Régime alimentaire particulier"
            id="regime"
            icon={<Utensils className="w-4 h-4" />}
            options={[
              { value: "aucun", label: "Sans restriction particulière" },
              { value: "vegetarien", label: "Végétarien" },
              { value: "vegan", label: "Végétalien / Vegan" },
              { value: "sansGluten", label: "Sans gluten" },
              { value: "allergie", label: "Allergie(s) alimentaire(s)" },
              { value: "autre", label: "Autre précision" },
            ]}
            value={data.regime || "aucun"}
            onChange={(e) => onChange("regime", e.target.value)}
          />

          <InputField
            label="Précisions régimes ou allergies"
            id="regimePrecision"
            placeholder="Ex: Allergie aux arachides, casher, halal..."
            value={data.regimePrecision}
            onChange={(e) => onChange("regimePrecision", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
