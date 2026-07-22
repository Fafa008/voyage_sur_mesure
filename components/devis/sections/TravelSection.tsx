// components/devis/sections/TravelSection.tsx
"use client";

import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import type { DevisFormData, DevisOption } from "@/types/devis";

interface TravelSectionProps {
  data: DevisFormData;
  updateData: (newData: Partial<DevisFormData>) => void;
  circuits: DevisOption[];
  themes: DevisOption[];
  regions: DevisOption[];
}

export function TravelSection({
  data,
  updateData,
  circuits,
  themes,
  regions,
}: TravelSectionProps) {
  type TravelArrayField = keyof Pick<
    TravelSectionProps["data"],
    "typeVoyage" | "themeIds" | "regionIds"
  >;

  const handleArrayChange = (
    field: TravelArrayField,
    value: string,
    checked: boolean,
  ) => {
    const current = data[field];
    const newArray = checked
      ? [...current, value]
      : current.filter((v) => v !== value);
    updateData({ [field]: newArray });
  };

  // Construire les options pour les checkbox
  const typeOptions = [
    "Aventure",
    "Détente",
    "Culturel",
    "Nature",
    "Romantique",
    "Familial",
    "Sportif",
    "Gastronomique",
  ].map((v) => ({ value: v, label: v }));

  const themeOptions = themes.map((t) => ({
    value: String(t.id),
    label: t.nom ?? "Thème",
  }));
  const regionOptions = regions.map((r) => ({
    value: String(r.id),
    label: r.nom ?? "Région",
  }));

  return (
    <section className="border rounded-lg p-6 bg-white">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
          2
        </span>
        Votre voyage
      </h2>

      <div className="mb-4">
        <SelectField
          label="Circuit d'inspiration (optionnel)"
          id="circuitId"
          options={[
            { value: "", label: "-- Je construis mon voyage sur mesure --" },
            ...circuits.map((c) => ({
              value: String(c.id),
              label: c.titre ?? "Circuit",
            })),
          ]}
          value={data.circuitId}
          onChange={(e) => updateData({ circuitId: e.target.value })}
        />
        <p className="text-xs text-gray-400 mt-1">
          Vous pouvez vous inspirer d'un circuit existant ou créer le vôtre.
        </p>
      </div>

      <CheckboxGroup
        label="Type de voyage *"
        name="typeVoyage"
        options={typeOptions}
        values={data.typeVoyage}
        onChange={(value, checked) =>
          handleArrayChange("typeVoyage", value, checked)
        }
        className="mb-4"
      />

      <CheckboxGroup
        label="Thèmes qui vous intéressent"
        name="themeIds"
        options={themeOptions}
        values={data.themeIds}
        onChange={(value, checked) =>
          handleArrayChange("themeIds", value, checked)
        }
        className="mb-4"
      />

      <CheckboxGroup
        label="Régions à visiter"
        name="regionIds"
        options={regionOptions}
        values={data.regionIds}
        onChange={(value, checked) =>
          handleArrayChange("regionIds", value, checked)
        }
        className="mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Date de début souhaitée *"
          id="dateDebut"
          type="date"
          value={data.dateDebut}
          onChange={(e) => updateData({ dateDebut: e.target.value })}
          required
        />
        <InputField
          label="Date de fin souhaitée *"
          id="dateFin"
          type="date"
          value={data.dateFin}
          onChange={(e) => updateData({ dateFin: e.target.value })}
          required
        />
      </div>

      <div className="mt-4">
        <SelectField
          label="La durée est-elle flexible ?"
          id="dureeFlexible"
          options={[
            { value: "false", label: "Non, dates fixes" },
            { value: "true", label: "Oui, je peux adapter" },
          ]}
          value={data.dureeFlexible ? "true" : "false"}
          onChange={(e) =>
            updateData({ dureeFlexible: e.target.value === "true" })
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <InputField
          label="Adultes *"
          id="adultes"
          type="number"
          min="1"
          value={String(data.adultes)}
          onChange={(e) =>
            updateData({ adultes: parseInt(e.target.value) || 1 })
          }
          required
        />
        <InputField
          label="Enfants (0-12 ans)"
          id="enfants"
          type="number"
          min="0"
          value={String(data.enfants)}
          onChange={(e) =>
            updateData({ enfants: parseInt(e.target.value) || 0 })
          }
        />
        <InputField
          label="Ados (13-17 ans)"
          id="ados"
          type="number"
          min="0"
          value={String(data.ados)}
          onChange={(e) => updateData({ ados: parseInt(e.target.value) || 0 })}
        />
        <InputField
          label="Âges des enfants"
          id="enfantsAge"
          placeholder="ex: 4, 7, 10"
          value={data.enfantsAge}
          onChange={(e) => updateData({ enfantsAge: e.target.value })}
        />
      </div>
    </section>
  );
}
