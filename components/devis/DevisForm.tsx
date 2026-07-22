"use client";

import { DevisWizard } from "./wizard/DevisWizard";
import type { DevisOption } from "@/types/devis";

interface DevisFormProps {
  user: {
    email: string;
    prenom?: string | null;
    name?: string | null;
    telephone?: string | null;
  };
  circuits: DevisOption[];
  themes: DevisOption[];
  regions: DevisOption[];
  preselectedCircuitId?: string;
}

export function DevisForm({
  user,
  circuits,
  themes,
  regions,
  preselectedCircuitId,
}: DevisFormProps) {
  return (
    <DevisWizard
      user={user}
      circuits={circuits}
      themes={themes}
      regions={regions}
      preselectedCircuitId={preselectedCircuitId}
    />
  );
}
