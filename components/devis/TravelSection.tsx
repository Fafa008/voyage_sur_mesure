import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";

interface TravelSectionProps {
  circuits: { id: number; titre: string }[];
  themes: { id: number; nom: string }[];
  regions: { id: number; nom: string }[];
  preselectedCircuitId?: string;
}

export function TravelSection({
  circuits,
  themes,
  regions,
  preselectedCircuitId,
}: TravelSectionProps) {
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
            ...circuits.map((c) => ({ value: String(c.id), label: c.titre })),
          ]}
          defaultValue={preselectedCircuitId || ""}
        />
        <p className="text-xs text-gray-400 mt-1">
          Vous pouvez vous inspirer d'un circuit existant ou créer le vôtre.
        </p>
      </div>

      <CheckboxGroup
        label="Type de voyage *"
        name="typeVoyage"
        options={[
          "Aventure",
          "Détente",
          "Culturel",
          "Nature",
          "Romantique",
          "Familial",
          "Sportif",
          "Gastronomique",
        ]}
        className="mb-4"
      />

      <CheckboxGroup
        label="Thèmes qui vous intéressent"
        name="themeIds"
        options={themes.map((t) => t.nom)}
        className="mb-4"
      />

      <CheckboxGroup
        label="Régions à visiter"
        name="regionIds"
        options={regions.map((r) => r.nom)}
        className="mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Date de début souhaitée *"
          id="dateDebut"
          type="date"
          required
        />
        <InputField
          label="Date de fin souhaitée *"
          id="dateFin"
          type="date"
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
          defaultValue="false"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <InputField
          label="Adultes *"
          id="adultes"
          type="number"
          min="1"
          defaultValue="2"
          required
        />
        <InputField
          label="Enfants (0-12 ans)"
          id="enfants"
          type="number"
          min="0"
          defaultValue="0"
        />
        <InputField
          label="Ados (13-17 ans)"
          id="ados"
          type="number"
          min="0"
          defaultValue="0"
        />
        <InputField
          label="Âges des enfants"
          id="enfantsAge"
          placeholder="ex: 4, 7, 10"
        />
      </div>
    </section>
  );
}
