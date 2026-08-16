// components/devis/wizard/DevisWizard.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createDevis } from "@/app/actions/devis/create-devis.action";
import type { DevisFormData, DevisOption } from "@/types/devis";

import { ProgressBar } from "./ProgressBar";
import { NavigationButtons } from "./NavigationButtons";
import dynamic from "next/dynamic";

const Step1PersonalInfo = dynamic(() =>
  import("./steps/Step1PersonalInfo").then((m) => m.Step1PersonalInfo),
);
const Step2Travel = dynamic(() =>
  import("./steps/Step2Travel").then((m) => m.Step2Travel),
);
const Step3Accommodation = dynamic(() =>
  import("./steps/Step3Accommodation").then((m) => m.Step3Accommodation),
);
const Step4Activities = dynamic(() =>
  import("./steps/Step4Activities").then((m) => m.Step4Activities),
);
const Step5Budget = dynamic(() =>
  import("./steps/Step5Budget").then((m) => m.Step5Budget),
);
const Step6Complementary = dynamic(() =>
  import("./steps/Step6Complementary").then((m) => m.Step6Complementary),
);

import {
  CheckCircle2,
  AlertCircle,
  Compass,
  User,
  Calendar,
  Users,
  Building,
  Activity,
  Coins,
  Send,
  ArrowLeft,
  LogIn,
  UserPlus,
  Edit3,
  Lock,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";

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

      if (currentStep === 1 && (!formData.dateDebut || !formData.dateFin)) {
        setError("Veuillez indiquer vos dates de voyage estimées.");
        return;
      }

      if (currentStep === 1 && !formData.circuitId) {
        setError("Veuillez sélectionner un circuit d'inspiration.");
        return;
      }

      setError(null);

      if (currentStep < contentSteps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        // Dernière étape du formulaire -> récapitulatif
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
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* En-tête du Wizard */}
      <div className="mb-6 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase border border-primary/20">
          <Compass className="w-3.5 h-3.5" />
          Conception Sur Mesure
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Demande de Devis Personnalisé
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
          {isAuthStep
            ? "Vérifiez le récapitulatif de votre dossier avant de nous le transmettre."
            : "Complétez les détails de votre séjour pour recevoir une proposition adaptée sous 24h."}
        </p>
      </div>

      {/* Stepper avec progression */}
      <ProgressBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        onStepClick={(stepIdx) => setCurrentStep(stepIdx)}
      />

      {/* Message d'erreur */}
      {error && (
        <div className="my-5 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Conteneur de l'étape active */}
      <div className="mt-6 p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-sm transition-all duration-300">
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
            circuits={circuits}
            onEditStep={(stepIdx) => setCurrentStep(stepIdx)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {/* Navigation entre étapes */}
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
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={goToPrevious}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-accent transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Modifier mes choix
          </button>

          {user ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm hover:brightness-95 transition-all shadow-md disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              {isSubmitting
                ? "Transmission en cours..."
                : "Confirmer et Envoyer ma Demande"}
            </button>
          ) : (
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/login?redirect=/devis/nouveau"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:brightness-95 transition-all shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                Se connecter pour envoyer
              </Link>

              <Link
                href="/register?redirect=/devis/nouveau"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-accent transition-all shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
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
  circuits,
  onEditStep,
  onSubmit,
  isSubmitting,
}: {
  user: DevisWizardProps["user"];
  formData: DevisFormData;
  circuits: DevisOption[];
  onEditStep: (stepIdx: number) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}) {
  const selectedCircuit = circuits.find(
    (c) => String(c.id) === formData.circuitId,
  );

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            Récapitulatif de votre Demande
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Vérifiez l'ensemble des éléments avant la transmission définitive à
            nos spécialistes.
          </p>
        </div>
      </div>

      {/* Grille de cartes récapitulatives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1 : Voyageur */}
        <SummaryCard
          title="Demandeur"
          icon={<User className="w-4 h-4 text-primary" />}
          onEdit={() => onEditStep(0)}
        >
          <p className="font-semibold text-foreground">
            {formData.prenom} {formData.nom}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formData.email}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formData.telephone || "Non renseigné"}
          </p>
        </SummaryCard>

        {/* Card 2 : Projet & Inspiration */}
        <SummaryCard
          title="Circuit & Intention"
          icon={<Compass className="w-4 h-4 text-primary" />}
          onEdit={() => onEditStep(1)}
        >
          <p className="font-semibold text-foreground">
            {selectedCircuit
              ? `Basé sur : ${selectedCircuit.titre}`
              : "Création 100% sur-mesure"}
          </p>
          {formData.typeVoyage.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Styles :{" "}
              <span className="font-medium text-foreground">
                {formData.typeVoyage.join(", ")}
              </span>
            </p>
          )}
        </SummaryCard>

        {/* Card 3 : Dates & Groupe */}
        <SummaryCard
          title="Dates & Voyageurs"
          icon={<Calendar className="w-4 h-4 text-primary" />}
          onEdit={() => onEditStep(1)}
        >
          <p className="font-semibold text-foreground">
            {formData.dateDebut && formData.dateFin
              ? `Du ${new Date(formData.dateDebut).toLocaleDateString("fr-FR")} au ${new Date(formData.dateFin).toLocaleDateString("fr-FR")}`
              : "Dates non définies"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formData.adultes} Adulte(s)
            {formData.enfants > 0 ? `, ${formData.enfants} Enfant(s)` : ""}
            {formData.ados > 0 ? `, ${formData.ados} Ados(s)` : ""}
          </p>
        </SummaryCard>

        {/* Card 4 : Hébergement & Restauration */}
        <SummaryCard
          title="Hébergement & Régime"
          icon={<Building className="w-4 h-4 text-primary" />}
          onEdit={() => onEditStep(2)}
        >
          <p className="font-semibold text-foreground capitalize">
            {formData.typeHebergement || "Non spécifié"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Régime :{" "}
            <span className="font-medium text-foreground">
              {formData.regime || "Standard"}
            </span>
          </p>
        </SummaryCard>

        {/* Card 5 : Activités & Transport */}
        <SummaryCard
          title="Activités & Transport"
          icon={<Activity className="w-4 h-4 text-primary" />}
          onEdit={() => onEditStep(3)}
        >
          <p className="text-xs text-foreground font-medium">
            {formData.activites.length > 0
              ? formData.activites.slice(0, 3).join(", ") +
                (formData.activites.length > 3 ? "..." : "")
              : "Aucune activité sélectionnée"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Transports :{" "}
            {formData.transport.length > 0
              ? formData.transport.join(", ")
              : "Non spécifié"}
          </p>
        </SummaryCard>

        {/* Card 6 : Budget */}
        <SummaryCard
          title="Budget Indicatif"
          icon={<Coins className="w-4 h-4 text-primary" />}
          onEdit={() => onEditStep(4)}
        >
          <p className="font-extrabold text-primary text-base">
            {formData.budgetMin || formData.budgetMax
              ? `${formatCurrency(formData.budgetMin)} - ${formatCurrency(formData.budgetMax)} / personne`
              : "Non défini"}
          </p>
        </SummaryCard>
      </div>

      {/* Commentaire optionnel */}
      {formData.commentaire && (
        <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Remarques particulières :
          </span>
          <p className="text-xs text-foreground italic">
            &quot;{formData.commentaire}&quot;
          </p>
        </div>
      )}

      {/* Alerte si déconnecté */}
      {!user && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-sm space-y-2">
          <p className="font-bold flex items-center gap-2">
            <Lock className="w-4 h-4" /> Inscription ou connexion nécessaire
          </p>
          <p className="text-xs leading-relaxed opacity-90">
            Afin que nous puissions rattacher ce devis à votre espace client et
            vous notifier dès sa validation, veuillez vous connecter ou créer un
            compte. Vos réponses actuelles sont automatiquement conservées.
          </p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  icon,
  children,
  onEdit,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="p-4 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <Edit3 className="w-3 h-3" />
          Modifier
        </button>
      </div>

      <div className="text-sm">{children}</div>
    </div>
  );
}
