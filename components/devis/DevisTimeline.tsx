import { StatutDevis } from "@prisma/client";
import { Check, Clock, FileText, CreditCard, Sparkles, AlertCircle, FilePenLine } from "lucide-react";
import { cn } from "@/lib/utils";

interface DevisTimelineProps {
  statut: StatutDevis;
  hasReservation?: boolean;
  isReservationPaid?: boolean;
  commentaireConseiller?: string | null;
}

interface StepItem {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function DevisTimeline({
  statut,
  hasReservation = false,
  isReservationPaid = false,
  commentaireConseiller = null,
}: DevisTimelineProps) {
  // Define full lifecycle steps
  const steps: StepItem[] = [
    {
      id: "demande",
      label: "Demande soumise",
      description: "Votre projet a été transmis à l'équipe Madaventure.",
      icon: Clock,
    },
    {
      id: "etude",
      label: "Étude par un conseiller",
      description: "Un spécialiste étudie vos dates, budget et itinéraire.",
      icon: Sparkles,
    },
    {
      id: "proposition",
      label: "Offre proposée",
      description: "Un devis détaillé vous est soumis pour validation.",
      icon: FileText,
    },
    {
      id: "acceptation",
      label: "Offre acceptée",
      description: "Vous avez validé la proposition de voyage.",
      icon: Check,
    },
    {
      id: "paiement",
      label: "Réservation & Paiement",
      description: "Acompte ou solde réglé pour bloquer les réservations.",
      icon: CreditCard,
    },
  ];

  // Determine current step index (0 to 4, or special cases like refused)
  const getActiveStepIndex = (): number => {
    if (statut === StatutDevis.refuse) return -1;
    if (isReservationPaid || statut === StatutDevis.reserve) return 4;
    if (hasReservation || statut === StatutDevis.accepte) return 3;
    if (statut === StatutDevis.valide) return 2;
    if (statut === StatutDevis.en_modification) return 1;
    return 0; // en_cours
  };

  const activeIndex = getActiveStepIndex();

  if (statut === StatutDevis.refuse) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <div>
          <p className="font-semibold text-sm">Devis décliné</p>
          <p className="text-xs text-muted-foreground">
            Ce dossier a été annulé ou décliné. Vous pouvez créer une nouvelle demande à tout moment.
          </p>
        </div>
      </div>
    );
  }

  if (statut === StatutDevis.en_modification) {
    return (
      <div
        className={cn(
          "flex items-start gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/25",
          "text-orange-700 dark:text-orange-300"
        )}
      >
        <FilePenLine className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-sm">Modification demandée par votre conseiller</p>
          {commentaireConseiller && (
            <p className="text-xs leading-relaxed italic">
              &ldquo;{commentaireConseiller}&rdquo;
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Merci de modifier les informations concernées depuis le détail de votre devis, puis de renvoyer votre dossier pour nouvelle analyse.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 p-4 sm:p-6 rounded-2xl bg-card border border-border/60 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border/40 pb-4">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Progression de votre dossier
        </h3>
        <span className="text-xs text-muted-foreground">
          Étape {activeIndex + 1} sur {steps.length}
        </span>
      </div>

      {/* Timeline steps grid / flex */}
      <div className="relative grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
        {/* Connecting line on desktop */}
        <div className="hidden md:block absolute top-7 left-8 right-8 h-0.5 bg-border/60 -z-0" />

        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isPending = idx > activeIndex;

          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-row md:flex-col items-start md:items-center gap-3 md:text-center"
            >
              {/* Step Icon / Circle */}
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 transition-all shadow-xs",
                  isCompleted &&
                    "bg-emerald-500 text-white dark:bg-emerald-600",
                  isCurrent &&
                    "bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse",
                  isPending &&
                    "bg-muted text-muted-foreground border border-border/60"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Step Text Info */}
              <div className="space-y-0.5 min-w-0">
                <p
                  className={cn(
                    "text-xs font-bold leading-tight",
                    isCompleted && "text-foreground",
                    isCurrent && "text-primary font-extrabold",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
