"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

const DRAFT_KEY = "mon-voyage-devis-draft";
const STEP_KEY = "mon-voyage-devis-step";

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

const contentSteps = [
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
  } | null;
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
  const [formData, setFormData] = useState<DevisFormData>(() => ({
    ...initialData,
    email: user?.email ?? "",
    prenom: user?.prenom ?? "",
    nom: user?.name ?? "",
    telephone: user?.telephone ?? "",
    circuitId: preselectedCircuitId || "",
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const totalSteps = contentSteps.length + 1;
  const isAuthStep = currentStep === contentSteps.length;

  // Restaure le brouillon et l'étape courante
  useEffect(() => {
    try {
      const savedDraft = sessionStorage.getItem(DRAFT_KEY);
      const savedStep = sessionStorage.getItem(STEP_KEY);

      if (savedDraft) {
        const parsed = JSON.parse(savedDraft) as Partial<DevisFormData>;
        setFormData((prev) => ({
          ...prev,
          ...parsed,
          email: user?.email ?? parsed.email ?? "",
          prenom: user?.prenom ?? parsed.prenom ?? "",
          nom: user?.name ?? parsed.nom ?? "",
          telephone: user?.telephone ?? parsed.telephone ?? "",
          circuitId: preselectedCircuitId || parsed.circuitId || "",
        }));
      }

      if (savedStep) {
        const stepNumber = Number(savedStep);
        if (!Number.isNaN(stepNumber) && stepNumber >= 0) {
          setCurrentStep(Math.min(stepNumber, contentSteps.length));
        }
      }
    } finally {
      setHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sauvegarde du brouillon
  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
  }, [formData, hydrated]);

  // Sauvegarde de l'étape courante
  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(STEP_KEY, String(currentStep));
  }, [currentStep, hydrated]);

  const updateFormData = (newData: Partial<DevisFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const goToNext = () => {
    if (!isAuthStep) {
      if (currentStep === 0 && !formData.prenom) {
        setError("Le prénom est requis.");
        return;
      }

      setError(null);

      if (currentStep < contentSteps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        // Dernière étape du formulaire -> étape de connexion / validation
        setCurrentStep(contentSteps.length);
      }
    }
  };

  const goToPrevious = () => {
    setError(null);

    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError("Connectez-vous pour finaliser et envoyer votre demande.");
      setCurrentStep(contentSteps.length);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const form = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => form.append(key, String(v)));
      } else if (typeof value === "boolean") {
        form.append(key, value ? "true" : "false");
      } else if (value !== undefined && value !== null) {
        form.append(key, String(value));
      }
    });

    const result = await createDevis(null, form);

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    sessionStorage.removeItem(DRAFT_KEY);
    sessionStorage.removeItem(STEP_KEY);

    if (result?.success) {
      router.push("/devis/merci");
    } else {
      setIsSubmitting(false);
    }
  };

  const StepComponent = !isAuthStep
    ? contentSteps[currentStep].component
    : null;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-3xl font-bold">✈️ Demander un devis</h1>

      <p className="mb-6 text-muted-foreground">
        {isAuthStep
          ? "Dernière étape : connectez-vous pour envoyer votre demande."
          : `Étape ${currentStep + 1} sur ${totalSteps}`}
      </p>

      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      {error && (
        <div className="my-4 rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6">
        {!isAuthStep && StepComponent && (
          <StepComponent
            data={formData}
            updateData={updateFormData}
            circuits={circuits}
            themes={themes}
            regions={regions}
          />
        )}

        {isAuthStep && (
          <FinalStep
            user={user}
            formData={formData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {!isAuthStep ? (
        <NavigationButtons
          currentStep={currentStep}
          totalSteps={contentSteps.length}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      ) : (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={goToPrevious}
            className="rounded-lg border px-5 py-3 font-medium transition hover:bg-accent"
          >
            Précédent
          </button>

          {user ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-5 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Envoi..." : "Confirmer la demande"}
            </button>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login?redirect=/devis/nouveau"
                className="rounded-lg bg-primary px-5 py-3 text-center font-medium text-white transition hover:opacity-90"
              >
                Se connecter
              </Link>

              <Link
                href="/register?redirect=/devis/nouveau"
                className="rounded-lg border px-5 py-3 text-center font-medium transition hover:bg-accent"
              >
                Créer un compte
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FinalStep({
  user,
  formData,
  onSubmit,
  isSubmitting,
}: {
  user: DevisWizardProps["user"];
  formData: DevisFormData;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}) {
  return (
    <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold">Résumé de votre demande</h2>
        <p className="text-sm text-muted-foreground">
          Vérifiez les informations avant l’envoi final.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryItem label="Nom" value={`${formData.prenom} ${formData.nom}`} />
        <SummaryItem label="Email" value={formData.email} />
        <SummaryItem label="Téléphone" value={formData.telephone || "-"} />
        <SummaryItem label="Circuit" value={formData.circuitId || "-"} />
        <SummaryItem
          label="Période"
          value={
            formData.dateDebut && formData.dateFin
              ? `${formData.dateDebut} → ${formData.dateFin}`
              : "Non définie"
          }
        />
        <SummaryItem
          label="Budget"
          value={
            formData.budgetMax
              ? `${formData.budgetMin} - ${formData.budgetMax}`
              : "Non défini"
          }
        />
      </div>

      {!user && (
        <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
          Vous avez presque terminé. Connectez-vous pour envoyer votre demande
          sans perdre vos informations.
        </div>
      )}

      {user && (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary px-5 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Envoi..." : "Confirmer la demande"}
        </button>
      )}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
