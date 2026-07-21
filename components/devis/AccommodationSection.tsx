import { SelectField } from "@/components/ui/SelectField";
import { InputField } from "@/components/ui/InputField";

export function AccommodationSection() {
  return (
    <section className="border rounded-lg p-6 bg-gray-50">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
          3
        </span>
        Hébergement & Restauration
      </h2>

      <div className="space-y-4">
        <SelectField
          label="Type d'hébergement souhaité"
          id="typeHebergement"
          options={[
            { value: "", label: "-- Choisissez --" },
            { value: "hotel", label: "Hôtel standard" },
            { value: "luxe", label: "Hôtel de luxe" },
            { value: "lodge", label: "Lodge / Écolodge" },
            { value: "camp", label: "Camping / Bivouac" },
            { value: "gite", label: "Gîte / Chambre d'hôtes" },
            { value: "mixte", label: "Mixte (plusieurs types)" },
          ]}
        />

        <SelectField
          label="Régime alimentaire particulier"
          id="regime"
          options={[
            { value: "aucun", label: "Aucun" },
            { value: "vegetarien", label: "Végétarien" },
            { value: "vegan", label: "Végétalien" },
            { value: "sansGluten", label: "Sans gluten" },
            { value: "allergie", label: "Allergie alimentaire" },
            { value: "autre", label: "Autre" },
          ]}
        />

        <InputField label="Précisions (allergies, etc.)" id="regimePrecision" />
      </div>
    </section>
  );
}
