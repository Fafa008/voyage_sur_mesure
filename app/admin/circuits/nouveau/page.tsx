import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageManager } from "@/components/admin/circuits/ImageManager";
import { LocationPickerWrapper } from "@/components/admin/circuits/LocationPickerWrapper";
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
          <h1 className="text-xl sm:text-2xl font-bold">Ajouter un nouveau circuit</h1>
          <p className="text-muted-foreground text-sm">
            Créer un circuit pour l&apos;administration.
          </p>
        </div>
        <Button variant="outline">
          <Link href="/admin/circuits">← Retour à la liste</Link>
        </Button>
      </div>

      <form action={createCircuit} className="space-y-5">
        <div className="grid gap-6 md:grid-cols-2">
          <InputField id="titre" label="Titre" required />
          <InputField id="slug" label="Slug" required />
          <InputField
            id="dureeJours"
            label="Durée (jours)"
            type="number"
            min={1}
            required
          />
          <InputField
            id="prixEstime"
            label="Prix estimé"
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
            label="Date de départ estimée"
            type="date"
            defaultValue={formatDateInput(undefined)}
          />
          <InputField
            id="dateFin"
            label="Date de retour estimée"
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
            label="Thème"
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
            label="Région"
            options={[
              { value: "", label: "Aucune" },
              ...regions.map((region) => ({
                value: String(region.id),
                label: region.nom,
              })),
            ]}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            rows={5}
            placeholder="Décrivez l'itinéraire, les points forts et le programme du circuit..."
          />
        </div>

        {/* Section : Lieux de départ et d'arrivée */}
        <div className="p-5 rounded-xl bg-card border space-y-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              📍 Lieux de départ et d&apos;arrivée
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sélectionnez les lieux exacts sur la carte ou recherchez par nom.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <LocationPickerWrapper
              prefix="lieuDepart"
              label="Lieu de départ"
            />
            <LocationPickerWrapper
              prefix="lieuArrivee"
              label="Lieu d'arrivée"
            />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-card">
          <ImageManager />
        </div>

        <div className="flex flex-wrap gap-3 justify-end">
          <Button type="submit">Creer le circuit</Button>
        </div>
      </form>
    </div>
  );
}
