"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDevis } from "@/app/actions/devis/create-devis.action";
import type { DevisFormData, DevisOption } from "@/types/devis";
import { ProgressBar } from "./ProgressBar";
import { NavigationButtons } from "./NavigationButtons";
import { Step1PersonalInfo } from "./steps/Step1PersonalInfo";
import { Step2Travel } from "./steps/Step2Travel";
import { Step3Accommodation } from "./steps/Step3Accommodation";
import { Step4Activities } from "./steps/Step4Activities";
import { Step5Budget } from "./steps/Step5Budget";
import { Step6Complementary } from "./steps/Step6Complementary";

const initialData: DevisFormData = {
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  circuitId: "",
  typeVoyage: [],
  themeIds: [],
  regionIds: [],
  dateDebut: "",
  dateFin: "",
  dureeFlexible: false,
  adultes: 2,
  enfants: 0,
  ados: 0,
  enfantsAge: "",
  typeHebergement: "",
  regime: "",
  regimePrecision: "",
  activites: [],
  transport: [],
  budgetMin: 0,
  budgetMax: 0,
  commentaire: "",
  source: "",
  newsletter: false,
};

const steps = [
  { id: 1, label: "Informations", component: Step1PersonalInfo },
  { id: 2, label: "Votre voyage", component: Step2Travel },
  { id: 3, label: "Hébergement", component: Step3Accommodation },
  { id: 4, label: "Activités & Transport", component: Step4Activities },
  { id: 5, label: "Budget", component: Step5Budget },
  { id: 6, label: "Compléments", component: Step6Complementary },
];

interface DevisWizardProps {
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

export function DevisWizard({
  user,
  circuits,
  themes,
  regions,
  preselectedCircuitId,
}: DevisWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<DevisFormData>({
    ...initialData,
    email: user.email,
    prenom: user.prenom || "",
    nom: user.name || "",
    telephone: user.telephone || "",
    circuitId: preselectedCircuitId || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mettre à jour les données d'une étape
  const updateFormData = (newData: Partial<DevisFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  // Navigation
  const goToNext = () => {
    // Validation optionnelle de l'étape courante
    if (currentStep === 0 && !formData.prenom) {
      setError("Le prénom est requis.");
      return;
    }
    // (ajouter d'autres validations)
    setError(null);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Soumission finale
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    // Convertir le formData en FormData pour la Server Action
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => form.append(key, v));
      } else if (typeof value === "boolean") {
        form.append(key, value ? "true" : "false");
      } else if (value !== undefined && value !== null) {
        form.append(key, value.toString());
      }
    });

    const result = await createDevis(null, form);
    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }
    if (result?.success) {
      router.push("/devis/merci");
    }
  };

  const StepComponent = steps[currentStep].component;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">✈️ Demander un devis</h1>
      <p className="text-gray-600 mb-6">
        Étape {currentStep + 1} sur {steps.length}
      </p>

      <ProgressBar currentStep={currentStep} totalSteps={steps.length} />

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg my-4">
          {error}
        </div>
      )}

      <div className="mt-6">
        <StepComponent
          data={formData}
          updateData={updateFormData}
          circuits={circuits}
          themes={themes}
          regions={regions}
        />
      </div>

      <NavigationButtons
        currentStep={currentStep}
        totalSteps={steps.length}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
