import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageManager } from "@/components/admin/circuits/ImageManager";
import { CircuitRouteMapPickerWrapper } from "@/components/admin/circuits/CircuitRouteMapPickerWrapper";
import { CurrencyInput } from "@/components/admin/circuits/CurrencyInput";
import { updateCircuit } from "@/app/admin/circuits/actions/update-circuit.action";
import { CurrencyService, CurrencyCode } from "@/lib/services/currency.service";

interface EditCircuitPageProps {
  params: Promise<{ id: string }>;
}

function formatDateInput(value: Date | null | undefined) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

function convertMgaToDisplayCurrency(amountMga: number | null | undefined, targetCurrency: CurrencyCode): string {
  if (!amountMga) return "";
  const converted = CurrencyService.convert(amountMga, targetCurrency);
  return converted.toString();
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
            label="Titre du circuit"
            placeholder="Ex: Circuit Baobabs et Lémuriens"
            defaultValue={circuit.titre}
            required
          />
          <InputField
            id="slug"
            label="Slug (URL)"
            placeholder="Ex: circuit-baobabs-lemuriens"
            defaultValue={circuit.slug}
            required
          />
          <InputField
            id="dureeJours"
            label="Durée du circuit"
            placeholder="Ex: 7"
            type="number"
            min={1}
            defaultValue={circuit.dureeJours?.toString() ?? ""}
            sublabel="en jours"
            required
          />
          <CurrencyInput
            id="prixEstime"
            name="prixEstime"
            label="Prix estimé"
            placeholder="Ex: 1500"
            type="number"
            min={0}
            step="0.01"
            defaultValue={convertMgaToDisplayCurrency(circuit.prixEstime?.toNumber(), "EUR")}
            sublabel="devise de référence"
            defaultCurrency="EUR"
          />
          <InputField
            id="nbPlacesDisponibles"
            label="Places disponibles"
            placeholder="Ex: 12"
            type="number"
            min={0}
            defaultValue={circuit.nbPlacesDisponibles.toString()}
            sublabel="nombre de participants maximum"
          />
          <InputField
            id="dateDebut"
            label="Date de départ"
            type="date"
            defaultValue={formatDateInput(circuit.dateDebut)}
            sublabel="date estimée de début du circuit"
          />
          <InputField
            id="dateFin"
            label="Date de retour"
            type="date"
            defaultValue={formatDateInput(circuit.dateFin)}
            sublabel="date estimée de fin du circuit"
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

        {/* Section : Lieux de départ et d'arrivée (Carte Interactive Unique) */}
        <div className="p-5 rounded-xl bg-card border space-y-5">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              🗺️ Itinéraire &amp; Lieux géographiques
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Positionnez le point de départ (🟢) et le point d&apos;arrivée (🔴) directement sur la carte interactive ou via la barre de recherche.
            </p>
          </div>

          <CircuitRouteMapPickerWrapper
            initialDepart={{
              nom: circuit.lieuDepartNom ?? "",
              lat: circuit.lieuDepartLat ? Number(circuit.lieuDepartLat) : null,
              lng: circuit.lieuDepartLng ? Number(circuit.lieuDepartLng) : null,
            }}
            initialArrivee={{
              nom: circuit.lieuArriveeNom ?? "",
              lat: circuit.lieuArriveeLat ? Number(circuit.lieuArriveeLat) : null,
              lng: circuit.lieuArriveeLng ? Number(circuit.lieuArriveeLng) : null,
            }}
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
