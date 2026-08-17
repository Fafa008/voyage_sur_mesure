// components/devis/sections/ComplementarySection.tsx
"use client";

import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Share2 } from "lucide-react";

interface ComplementarySectionProps {
  data: {
    commentaire: string;
    source: string;
    newsletter: boolean;
  };
  onChange: (field: string, value: string | boolean) => void;
}

export function ComplementarySection({
  data,
  onChange,
}: ComplementarySectionProps) {
  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
          6
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            Précisions Complémentaires
          </h2>
          <p className="text-xs text-muted-foreground">
            Dernières remarques pour créer votre devis sur-mesure idéal
          </p>
        </div>
      </div>

      {/* Commentaire libre */}
      <div className="p-6 rounded-xl bg-card space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <Label htmlFor="commentaire" className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Vos souhaits particuliers, envies ou contraintes
          </Label>
        </div>

        <Textarea
          id="commentaire"
          name="commentaire"
          rows={5}
          value={data.commentaire}
          onChange={(e) => onChange("commentaire", e.target.value)}
          className="resize-none"
          placeholder="Ex: Nous célébrons nos 10 ans de mariage. Nous aimerions une nuit insolite sous les étoiles, et un guide francophone pour les visites."
        />
        <p className="text-[11px] text-muted-foreground">
          Indiquez ici tout élément utile (rythme souhaité, étape incontournable, événements spéciaux...).
        </p>
      </div>

      {/* Source & Newsletter */}
      <div className="p-6 rounded-xl bg-card space-y-5">
        <SelectField
          label="Comment avez-vous découvert Mon Voyage Sur Mesure ?"
          id="source"
          icon={<Share2 className="w-4 h-4" />}
          options={[
            { value: "", label: "-- Sélectionnez une option --" },
            { value: "moteur", label: "Moteur de recherche (Google, Bing...)" },
            { value: "reseau", label: "Réseaux sociaux (Instagram, Facebook...)" },
            { value: "ami", label: "Recommandation d'un proche ou ami" },
            { value: "blog", label: "Blog de voyage ou article de presse" },
            { value: "foire", label: "Foire / Salon du Voyage" },
            { value: "autre", label: "Autre" },
          ]}
          value={data.source}
          onValueChange={(val) => onChange("source", val)}
        />

        <div className="pt-2 border-t border-border">
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-accent/40 transition-colors">
            <input
              type="checkbox"
              name="newsletter"
              checked={data.newsletter}
              onChange={(e) => onChange("newsletter", e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-primary border-border focus:ring-primary/40"
            />
            <div>
              <span className="block text-sm font-semibold text-foreground">
                S'abonner aux offres exclusives & inspirations de voyage
              </span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Recevez nos meilleures idées d'itinéraires sur-mesure (max 1 mail/mois, désinscription en 1 clic).
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
