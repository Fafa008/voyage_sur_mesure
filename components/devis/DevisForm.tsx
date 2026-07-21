"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createDevis } from "@/app/actions/devis/create-devis.action";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { TravelSection } from "./TravelSection";
import { AccommodationSection } from "./AccommodationSection";
import { ActivitiesTransportSection } from "./ActivitiesTransportSection";
import { BudgetSection } from "./BudgetSection";
import { ComplementarySection } from "./ComplementarySection";

interface DevisFormProps {
  user: any;
  circuits: any;
  themes: any;
  regions: any;
  preselectedCircuitId?: string;
}

export function DevisForm({
  user,
  circuits,
  themes,
  regions,
  preselectedCircuitId,
}: DevisFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(createDevis, null);

  // Redirection en cas de succès
  if (state?.success) {
    router.push("/devis/merci");
  }

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}
      <PersonalInfoSection user={user} />
      <TravelSection
        circuits={circuits}
        themes={themes}
        regions={regions}
        preselectedCircuitId={preselectedCircuitId}
      />
      <AccommodationSection />
      <ActivitiesTransportSection />
      <BudgetSection />
      <ComplementarySection />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  return (
    <div>
      <button
        type="submit"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Envoyer
      </button>
    </div>
  );
}
