// components/devis/sections/PersonalInfoSection.tsx
"use client";

import { InputField } from "@/components/ui/input-field";
import { User, Mail, Phone, Lock } from "lucide-react";

interface PersonalInfoSectionProps {
  data: {
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
  };
  onChange: (field: string, value: string) => void;
}

export function PersonalInfoSection({
  data,
  onChange,
}: PersonalInfoSectionProps) {
  return (
    <div className="space-y-6">
      {/* En-tête de section */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
          1
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            Vos Informations Personnelles
          </h2>
          <p className="text-xs text-muted-foreground">
            Aidez nos conseillers à personnaliser votre dossier et vous recontacter
          </p>
        </div>
      </div>

      {/* Grille de champs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 rounded-xl bg-card">
        <InputField
          label="Prénom *"
          id="prenom"
          placeholder="Ex: Sophie"
          icon={<User className="w-4 h-4" />}
          value={data.prenom}
          onChange={(e) => onChange("prenom", e.target.value)}
          required
        />

        <InputField
          label="Nom *"
          id="nom"
          placeholder="Ex: Dupont"
          icon={<User className="w-4 h-4" />}
          value={data.nom}
          onChange={(e) => onChange("nom", e.target.value)}
          required
        />

        <InputField
          label="Adresse Email *"
          id="email"
          icon={<Mail className="w-4 h-4" />}
          value={data.email}
          readOnly
          sublabel="Synchronisé avec votre compte"
        />

        <InputField
          label="Téléphone *"
          id="telephone"
          placeholder="Ex: +33 6 12 34 56 78"
          icon={<Phone className="w-4 h-4" />}
          value={data.telephone}
          onChange={(e) => onChange("telephone", e.target.value)}
          required
          sublabel="Pour vous transmettre votre devis"
        />
      </div>

      <div className="flex items-center gap-2 p-3.5 rounded-xl bg-muted/60 text-xs text-muted-foreground">
        <Lock className="w-4 h-4 text-primary shrink-0" />
        <span>Vos données personnelles restent strictement confidentielles et ne seront jamais revendues.</span>
      </div>
    </div>
  );
}
