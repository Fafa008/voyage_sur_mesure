// components/devis/sections/ActivitiesTransportSection.tsx
"use client";

import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import type { DevisFormData } from "@/types/devis";
import { Activity, Car, Compass, Waves, Trees, Bike, Footprints, ShieldCheck } from "lucide-react";

interface ActivitiesTransportSectionProps {
  data: Pick<DevisFormData, "activites" | "transport">;
  onArrayChange: (field: string, value: string, checked: boolean) => void;
}

export function ActivitiesTransportSection({
  data,
  onArrayChange,
}: ActivitiesTransportSectionProps) {
  const activiteOptions = [
    { value: "Randonnée pédestre", label: "Randonnée / Trek", icon: <Footprints className="w-3.5 h-3.5" /> },
    { value: "Plongée", label: "Plongée & Snorkeling", icon: <Waves className="w-3.5 h-3.5" /> },
    { value: "Kayak", label: "Kayak / Canoe", icon: <Waves className="w-3.5 h-3.5" /> },
    { value: "Observation faune", label: "Safari & Faune", icon: <Trees className="w-3.5 h-3.5" /> },
    { value: "Visite culturelle", label: "Visites & Musées", icon: <Compass className="w-3.5 h-3.5" /> },
    { value: "Détente", label: "Spa & Détente", icon: <Activity className="w-3.5 h-3.5" /> },
    { value: "Sport nautique", label: "Sports Nautiques", icon: <Waves className="w-3.5 h-3.5" /> },
    { value: "VTT", label: "VTT / Vélo", icon: <Bike className="w-3.5 h-3.5" /> },
    { value: "Quad", label: "Quad & 4x4", icon: <Car className="w-3.5 h-3.5" /> },
    { value: "Excursion en pirogue", label: "Pirogue & Bateau", icon: <Waves className="w-3.5 h-3.5" /> },
  ];

  const transportOptions = [
    { value: "Voiture 4x4", label: "4x4 Privatisé avec Chauffeur", icon: <Car className="w-3.5 h-3.5" /> },
    { value: "Minibus", label: "Minibus Confort", icon: <Car className="w-3.5 h-3.5" /> },
    { value: "Avion local", label: "Vols Intérieurs / Avion", icon: <Compass className="w-3.5 h-3.5" /> },
    { value: "Bateau", label: "Transferts en Bateau", icon: <Waves className="w-3.5 h-3.5" /> },
    { value: "Train", label: "Train Panoramique", icon: <Compass className="w-3.5 h-3.5" /> },
    { value: "A pied", label: "Rando & À Pied", icon: <Footprints className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base shadow-xs">
          4
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Activités & Transport
          </h2>
          <p className="text-xs text-muted-foreground">
            Sélectionnez les loisirs souhaités et le mode de déplacement idéal
          </p>
        </div>
      </div>

      {/* 1. Activités */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Activités souhaitées
          </h3>
        </div>

        <CheckboxGroup
          label="Sélectionnez vos envies"
          sublabel="Nos concepteurs intégreront ces étapes à votre feuille de route"
          name="activites"
          options={activiteOptions}
          values={data.activites}
          onChange={(value, checked) =>
            onArrayChange("activites", value, checked)
          }
        />
      </div>

      {/* 2. Transports */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Mode de Transport
          </h3>
        </div>

        <CheckboxGroup
          label="Moyens de transport favoris"
          sublabel="Adaptez votre confort de déplacement selon vos besoins"
          name="transport"
          options={transportOptions}
          values={data.transport}
          onChange={(value, checked) =>
            onArrayChange("transport", value, checked)
          }
        />
      </div>
    </div>
  );
}
