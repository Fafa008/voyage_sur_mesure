// components/devis/sections/PersonalInfoSection.tsx
"use client";

import { InputField } from "@/components/ui/InputField";

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
    <section className="border rounded-lg p-6 bg-gray-50">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
          1
        </span>
        Vos informations
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Prénom *"
          id="prenom"
          value={data.prenom}
          onChange={(e) => onChange("prenom", e.target.value)}
          required
        />
        <InputField
          label="Nom *"
          id="nom"
          value={data.nom}
          onChange={(e) => onChange("nom", e.target.value)}
          required
        />
        <InputField
          label="Email *"
          id="email"
          value={data.email}
          readOnly
          className="bg-gray-100"
        />
        <InputField
          label="Téléphone *"
          id="telephone"
          value={data.telephone}
          onChange={(e) => onChange("telephone", e.target.value)}
          required
        />
      </div>
    </section>
  );
}
