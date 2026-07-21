import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";

export function ComplementarySection() {
  return (
    <section className="border rounded-lg p-6 bg-white">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
          6
        </span>
        Informations complémentaires
      </h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="commentaire"
            className="block text-sm font-medium mb-1"
          >
            Vos envies, contraintes ou remarques
          </label>
          <textarea
            id="commentaire"
            name="commentaire"
            rows={6}
            className="w-full p-2 border rounded bg-white"
            placeholder="Décrivez votre voyage idéal, vos souhaits particuliers, vos contraintes médicales, etc."
          />
        </div>

        <SelectField
          label="Comment nous avez-vous connu ?"
          id="source"
          options={[
            { value: "", label: "-- Choisissez --" },
            { value: "moteur", label: "Moteur de recherche" },
            { value: "reseau", label: "Réseaux sociaux" },
            { value: "ami", label: "Recommandation d'un ami" },
            { value: "blog", label: "Blog / Article" },
            { value: "foire", label: "Foire / Salon" },
            { value: "autre", label: "Autre" },
          ]}
        />

        <div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="newsletter"
              value="true"
              className="rounded"
            />
            Je souhaite recevoir la newsletter et les offres spéciales
          </label>
        </div>
      </div>
    </section>
  );
}
