"use client"

import { useState } from "react"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { SelectField } from "@/components/ui/select-field"

const FRUIT_OPTIONS = [
  { value: "pomme", label: "🍎 Pomme" },
  { value: "banane", label: "🍌 Banane" },
  { value: "cerise", label: "🍒 Cerise" },
  { value: "datte", label: "🌴 Datte" },
  { value: "elder", label: "🫐 Sureau" },
  { value: "figue", label: "🍇 Figue" },
  { value: "goyave", label: "🍈 Goyave" },
  { value: "kiwi", label: "🥝 Kiwi" },
  { value: "litchi", label: "🍑 Litchi" },
  { value: "mangue", label: "🥭 Mangue" },
]

const STATUT_OPTIONS = [
  { value: "all", label: "Tous les statuts" },
  { value: "en_cours", label: "En cours" },
  { value: "en_modification", label: "En modification" },
  { value: "valide", label: "Validé" },
  { value: "annule", label: "Annulé" },
]

export default function TestSelectPage() {
  const [fruit, setFruit] = useState<string | null>(null)
  const [statut, setStatut] = useState<string>("all")
  const [fieldValue, setFieldValue] = useState<string>("")

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl space-y-10">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Page de test — Select</h1>
          <p className="text-sm text-muted-foreground">
            Validez les bugs : fond des items, scroll, valeur sélectionnée.
          </p>
        </div>

        {/* Test 1 — Select simple avec items longue liste (test scroll) */}
        <section className="space-y-3 border border-border rounded-xl p-5 bg-card">
          <h2 className="font-semibold text-sm text-foreground">
            Test 1 — Long scroll (10 items)
          </h2>
          <p className="text-xs text-muted-foreground">
            Attendu : scrollbar visible, fond blanc sur les items, hover bleu-gris.
          </p>
          <Select
            items={FRUIT_OPTIONS}
            value={fruit}
            onValueChange={(val) => setFruit(val)}
          >
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Choisissez un fruit…" />
            </SelectTrigger>
            <SelectContent>
              {FRUIT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs font-mono text-primary">
            Valeur sélectionnée : <strong>{fruit ?? "null"}</strong>
          </p>
        </section>

        {/* Test 2 — Select avec valeur par défaut (test synchronisation) */}
        <section className="space-y-3 border border-border rounded-xl p-5 bg-card">
          <h2 className="font-semibold text-sm text-foreground">
            Test 2 — Valeur par défaut ("all") + items
          </h2>
          <p className="text-xs text-muted-foreground">
            Attendu : le trigger affiche "Tous les statuts" dès le départ.
          </p>
          <Select
            items={STATUT_OPTIONS}
            value={statut}
            onValueChange={(val) => setStatut(val ?? "all")}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              {STATUT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs font-mono text-primary">
            Valeur sélectionnée : <strong>{statut}</strong>
          </p>
        </section>

        {/* Test 3 — SelectField avec valeur vide (test bug || vs ??) */}
        <section className="space-y-3 border border-border rounded-xl p-5 bg-card">
          <h2 className="font-semibold text-sm text-foreground">
            Test 3 — SelectField avec valeur contrôlée
          </h2>
          <p className="text-xs text-muted-foreground">
            Attendu : le placeholder s&apos;affiche quand aucune valeur n&apos;est sélectionnée.
          </p>
          <SelectField
            id="test-field"
            label="Thème de voyage"
            options={FRUIT_OPTIONS}
            value={fieldValue || null}
            onValueChange={setFieldValue}
            placeholder="Choisissez un thème…"
          />
          <div className="flex gap-3">
            <button
              className="text-xs underline text-primary"
              onClick={() => setFieldValue("")}
            >
              Reset (valeur vide)
            </button>
            <button
              className="text-xs underline text-primary"
              onClick={() => setFieldValue("mangue")}
            >
              Forcer "mangue"
            </button>
          </div>
          <p className="text-xs font-mono text-primary">
            fieldValue : <strong>&quot;{fieldValue}&quot;</strong>
          </p>
        </section>
      </div>
    </div>
  )
}
