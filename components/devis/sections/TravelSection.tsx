// components/devis/sections/TravelSection.tsx
"use client";

import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { CounterInput } from "@/components/ui/counter-input";
import type { DevisFormData, DevisOption, CircuitPreview } from "@/types/devis";
import {
  Compass,
  Calendar,
  Users,
  Sparkles,
  MapPin,
  Lock,
  Info,
} from "lucide-react";

interface TravelSectionProps {
  data: DevisFormData;
  updateData: (newData: Partial<DevisFormData>) => void;
  circuits: DevisOption[];
  themes: DevisOption[];
  regions: DevisOption[];
  /** Données enrichies du circuit pré-sélectionné (injectées côté serveur) */
  preselectedCircuit?: CircuitPreview | null;
}

export function TravelSection({
  data,
  updateData,
  circuits,
  themes,
  regions,
  preselectedCircuit,
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

  const typeOptions = [
    { value: "Aventure", label: "Aventure" },
    { value: "Détente", label: "Détente & Playa" },
    { value: "Culturel", label: "Culture & Histoire" },
    { value: "Nature", label: "Espaces Naturels" },
    { value: "Romantique", label: "Lune de Miel" },
    { value: "Familial", label: "En Famille" },
    { value: "Sportif", label: "Sport & Rando" },
    { value: "Gastronomique", label: "Saveurs & Terroir" },
  ];

  const themeOptions = themes.map((t) => ({
    value: String(t.id),
    label: t.nom ?? "Thème",
  }));

  const regionOptions = regions.map((r) => ({
    value: String(r.id),
    label: r.nom ?? "Région",
  }));

  // Région définie par le circuit (verrouillée, non désélectionnable)
  const circuitRegion = preselectedCircuit?.region ?? null;
  const circuitRegionIdStr = circuitRegion ? String(circuitRegion.id) : null;

  // Dates du circuit (indicatives, pré-remplies)
  const hasCircuitDates =
    preselectedCircuit?.dateDebut || preselectedCircuit?.dateFin;
  const circuitDateDebutDisplay = preselectedCircuit?.dateDebut
    ? new Date(preselectedCircuit.dateDebut).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;
  const circuitDateFinDisplay = preselectedCircuit?.dateFin
    ? new Date(preselectedCircuit.dateFin).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  // Lieux de départ / arrivée du circuit
  const lieuDepart = preselectedCircuit?.lieuDepartNom ?? null;
  const lieuArrivee = preselectedCircuit?.lieuArriveeNom ?? null;

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
          2
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            Votre Projet de Voyage
          </h2>
          <p className="text-xs text-muted-foreground">
            Définissez l&apos;inspiration, le style, les dates et la composition
            de votre groupe
          </p>
        </div>
      </div>

      {/* ── BLOC A : Informations du Circuit (lecture seule si circuit pré-sélectionné) ── */}
      <div className="p-6 rounded-xl bg-card space-y-4">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Circuit sélectionné
          </h3>
        </div>

        <SelectField
          label="Circuit de référence *"
          id="circuitId"
          icon={<Compass className="w-4 h-4" />}
          options={[
            { value: "", label: "Sélectionnez un circuit…" },
            ...circuits.map((c) => ({
              value: String(c.id),
              label: c.titre ?? "Circuit",
            })),
          ]}
          value={data.circuitId ?? ""}
          onValueChange={(val) => updateData({ circuitId: val })}
          sublabel="Le devis doit être rattaché à un circuit existant"
        />

        {/* Informations fixes du circuit sélectionné */}
        {preselectedCircuit && (
          <div className="mt-2 space-y-3">
            {/* Région du circuit — information verrouillée */}
            {circuitRegion && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/15">
                <Lock className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-primary uppercase tracking-wider text-[10px]">
                    Région définie par le circuit
                  </span>
                  <p className="text-foreground font-medium mt-0.5">
                    {circuitRegion.nom}
                  </p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    Cette région est automatiquement associée au circuit choisi.
                    Vous pouvez ajouter des régions complémentaires ci-dessous si votre voyage en couvre plusieurs.
                  </p>
                </div>
              </div>
            )}

            {/* Lieux de départ / arrivée */}
            {(lieuDepart || lieuArrivee) && (
              <div className="flex flex-wrap gap-3">
                {lieuDepart && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/40 text-xs">
                    <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Départ :</span>
                    <span className="font-medium text-foreground">{lieuDepart}</span>
                  </div>
                )}
                {lieuArrivee && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/40 text-xs">
                    <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="text-muted-foreground">Arrivée :</span>
                    <span className="font-medium text-foreground">{lieuArrivee}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Type de voyage & Thèmes */}
      <div className="p-6 rounded-xl bg-card space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Style & Environnement
          </h3>
        </div>

        <CheckboxGroup
          label="Style de voyage *"
          sublabel="Sélectionnez une ou plusieurs ambiances"
          name="typeVoyage"
          options={typeOptions}
          values={data.typeVoyage}
          onChange={(value, checked) =>
            handleArrayChange("typeVoyage", value, checked)
          }
        />

        {themeOptions.length > 0 && (
          <CheckboxGroup
            label="Thèmes préférés"
            sublabel="Centres d'intérêt prioritaires"
            name="themeIds"
            options={themeOptions}
            values={data.themeIds}
            onChange={(value, checked) =>
              handleArrayChange("themeIds", value, checked)
            }
          />
        )}

        {regionOptions.length > 0 && (
          <div className="space-y-2">
            <CheckboxGroup
              label={
                circuitRegion
                  ? "Régions complémentaires"
                  : "Régions d'intérêt"
              }
              sublabel={
                circuitRegion
                  ? `La région "${circuitRegion.nom}" est déjà incluse via le circuit. Cochez ici des régions supplémentaires si votre voyage en couvre d'autres.`
                  : "Régions que vous souhaitez explorer"
              }
              name="regionIds"
              options={regionOptions.map((opt) => ({
                ...opt,
                // La région du circuit est verrouillée (toujours cochée)
                disabled: opt.value === circuitRegionIdStr,
              }))}
              values={data.regionIds}
              onChange={(value, checked) => {
                // Empêcher la désélection de la région du circuit
                if (value === circuitRegionIdStr && !checked) return;
                handleArrayChange("regionIds", value, checked);
              }}
            />
            {circuitRegion && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pl-1">
                <Lock className="w-3 h-3 text-primary shrink-0" />
                La région {circuitRegion.nom} est verrouillée car elle est
                définie par le circuit.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. Dates & Durée */}
      <div className="p-6 rounded-xl bg-card space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Période & Durée
          </h3>
        </div>

        {/* Bandeau informatif si le circuit a des dates */}
        {hasCircuitDates && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/8 border border-amber-500/20 text-amber-800 dark:text-amber-200">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
            <div className="text-xs space-y-0.5">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Dates du circuit
              </span>
              <p>
                Ce circuit se déroule du{" "}
                <strong>{circuitDateDebutDisplay ?? "—"}</strong>
                {circuitDateFinDisplay && (
                  <>
                    {" "}au <strong>{circuitDateFinDisplay}</strong>
                  </>
                )}
                . Ces dates ont été pré-remplies. Vous pouvez les ajuster si
                nécessaire.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            label="Date de départ souhaitée *"
            id="dateDebut"
            type="date"
            icon={<Calendar className="w-4 h-4" />}
            value={data.dateDebut}
            onChange={(e) => updateData({ dateDebut: e.target.value })}
            required
          />
          <InputField
            label="Date de retour estimée *"
            id="dateFin"
            type="date"
            icon={<Calendar className="w-4 h-4" />}
            value={data.dateFin}
            onChange={(e) => updateData({ dateFin: e.target.value })}
            required
          />
        </div>

        <SelectField
          label="Vos dates sont-elles flexibles ?"
          id="dureeFlexible"
          options={[
            { value: "false", label: "Non, mes dates de vacances sont fixes" },
            {
              value: "true",
              label: "Oui, je peux me décaler de quelques jours",
            },
          ]}
          value={data.dureeFlexible ? "true" : "false"}
          onValueChange={(val) =>
            updateData({ dureeFlexible: val === "true" })
          }
        />
      </div>

      {/* 4. Composition des voyageurs */}
      <div className="p-6 rounded-xl bg-card space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Les Voyageurs
            </h3>
          </div>
          <span className="text-xs font-semibold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            Total : {data.adultes + data.enfants + data.ados} personne(s)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CounterInput
            label="Adultes"
            sublabel="18 ans et plus"
            value={data.adultes}
            min={1}
            onChange={(val) => updateData({ adultes: val })}
          />

          <CounterInput
            label="Enfants"
            sublabel="2 à 12 ans"
            value={data.enfants}
            min={0}
            onChange={(val) => updateData({ enfants: val })}
          />

          <CounterInput
            label="Ados"
            sublabel="13 à 17 ans"
            value={data.ados}
            min={0}
            onChange={(val) => updateData({ ados: val })}
          />
        </div>

        {(data.enfants > 0 || data.ados > 0) && (
          <InputField
            label="Âges des enfants / ados lors du voyage"
            id="enfantsAge"
            placeholder="Ex: 4, 8 et 15 ans"
            value={data.enfantsAge}
            onChange={(e) => updateData({ enfantsAge: e.target.value })}
            sublabel="Permet d'adapter les tarifs hôteliers et activités"
          />
        )}
      </div>
    </div>
  );
}
