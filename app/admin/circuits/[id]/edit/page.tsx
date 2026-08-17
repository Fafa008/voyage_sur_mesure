import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageManager } from "@/components/admin/circuits/ImageManager";
import { updateCircuit } from "@/app/admin/circuits/actions/update-circuit.action";

interface EditCircuitPageProps {
  params: Promise<{ id: string }>;
}

function formatDateInput(value: Date | null | undefined) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

export default async function EditCircuitPage({
  params,
}: EditCircuitPageProps) {
  const { id } = await params;
  const circuitId = parseInt(id, 10);

  const [circuit, themes, regions] = await Promise.all([
    prisma.circuit.findUnique({
      where: { id: circuitId },
      include: {
        theme: true,
        region: true,
        images: {
          orderBy: { ordre: "asc" },
        },
      },
    }),
    prisma.theme.findMany({ orderBy: { nom: "asc" } }),
    prisma.region.findMany({ orderBy: { nom: "asc" } }),
  ]);

  if (!circuit) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Modifier le circuit</h1>
          <p className="text-muted-foreground text-sm">ID #{circuit.id}</p>
        </div>
        <Button variant="outline">
          <Link href="/admin/circuits">← Retour à la liste</Link>
        </Button>
      </div>

      <form action={updateCircuit} className="space-y-5">
        <input type="hidden" name="id" value={circuit.id} />

        <div className="grid gap-6 md:grid-cols-2">
          <InputField
            id="titre"
            label="Titre"
            defaultValue={circuit.titre}
            required
          />
          <InputField
            id="slug"
            label="Slug"
            defaultValue={circuit.slug}
            required
          />
          <InputField
            id="dureeJours"
            label="Durée (jours)"
            type="number"
            min={1}
            defaultValue={circuit.dureeJours?.toString() ?? ""}
            required
          />
          <InputField
            id="prixEstime"
            label="Prix estimé"
            type="number"
            min={0}
            step="0.01"
            defaultValue={circuit.prixEstime?.toString() ?? ""}
          />
          <InputField
            id="nbPlacesDisponibles"
            label="Nombre de places"
            type="number"
            min={0}
            defaultValue={circuit.nbPlacesDisponibles.toString()}
          />
          <InputField
            id="dateDebut"
            label="Date de début"
            type="date"
            defaultValue={formatDateInput(circuit.dateDebut)}
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
            defaultValue={circuit.estGroupe ? "true" : "false"}
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
            defaultValue={circuit.themeId ? String(circuit.themeId) : ""}
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
            defaultValue={circuit.regionId ? String(circuit.regionId) : ""}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={circuit.description ?? ""}
            rows={5}
            placeholder="Décrivez l'itinéraire, les points forts et le programme du circuit..."
          />
        </div>

        <div className="p-5 rounded-xl bg-card">
          <ImageManager
            initialImages={circuit.images.map((img) => ({
              url: img.url,
              legende: img.legende,
              ordre: img.ordre,
            }))}
          />
        </div>

        <div className="flex flex-wrap gap-3 justify-end">
          <Button type="submit">Enregistrer les modifications</Button>
        </div>
      </form>
    </div>
  );
}
