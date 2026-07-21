import { CheckboxGroup } from "@/components/ui/CheckboxGroup";

export function ActivitiesTransportSection() {
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
          options={[
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
          ]}
        />

        <CheckboxGroup
          label="Type de transport préféré"
          name="transport"
          options={[
            "Voiture 4x4",
            "Minibus",
            "Avion local",
            "Bateau",
            "Train",
            "A pied",
          ]}
        />
      </div>
    </section>
  );
}
