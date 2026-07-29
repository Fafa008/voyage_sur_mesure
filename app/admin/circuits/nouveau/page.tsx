import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import { createCircuit } from "@/app/admin/circuits/actions/create-circuit.action";

function formatDateInput(value: Date | null | undefined) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

export default async function NewCircuitPage() {
  const [themes, regions] = await Promise.all([
    prisma.theme.findMany({ orderBy: { nom: "asc" } }),
    prisma.region.findMany({ orderBy: { nom: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ajouter un nouveau circuit</h1>
          <p className="text-gray-500">Creer un circuit pour l'administration.</p>
        </div>
        <Button variant="outline">
          <Link href="/admin/circuits">← Retour à la liste</Link>
        </Button>
      </div>

      <form action={createCircuit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <InputField id="titre" label="Titre" required />
          <InputField id="slug" label="Slug" required />
          <InputField
            id="dureeJours"
            label="Duree (jours)"
            type="number"
            min={1}
            required
          />
          <InputField
            id="prixEstime"
            label="Prix estime"
            type="number"
            min={0}
            step="0.01"
          />
          <InputField
            id="nbPlacesDisponibles"
            label="Nombre de places"
            type="number"
            min={0}
            defaultValue="0"
          />
          <InputField
            id="dateDebut"
            label="Date de debut"
            type="date"
            defaultValue={formatDateInput(undefined)}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <SelectField
            id="estGroupe"
            label="Circuit groupe"
            options={[
              { value: "false", label: "Non" },
              { value: "true", label: "Oui" },
            ]}
            defaultValue="false"
          />
          <SelectField
            id="themeId"
            label="Theme"
            options={[
              { value: "", label: "Aucun" },
              ...themes.map((theme) => ({
                value: String(theme.id),
                label: theme.nom,
              })),
            ]}
          />
          <SelectField
            id="regionId"
            label="Region"
            options={[
              { value: "", label: "Aucune" },
              ...regions.map((region) => ({
                value: String(region.id),
                label: region.nom,
              })),
            ]}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            className="w-full p-2 border rounded bg-white"
          />
        </div>

        <div className="flex flex-wrap gap-3 justify-end">
          <Button type="submit">Creer le circuit</Button>
        </div>
      </form>
    </div>
  );
}
