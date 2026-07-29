// components/devis/wizard/ProgressBar.tsx
"use client";

import {
  User,
  Compass,
  Building,
  Activity,
  Coins,
  FileText,
  Check,
} from "lucide-react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (stepIndex: number) => void;
}

const steps = [
  { id: 0, label: "Infos", icon: User },
  { id: 1, label: "Voyage", icon: Compass },
  { id: 2, label: "Hébergement", icon: Building },
  { id: 3, label: "Activités", icon: Activity },
  { id: 4, label: "Budget", icon: Coins },
  { id: 5, label: "Compléments", icon: FileText },
];

export function ProgressBar({ currentStep, totalSteps, onStepClick }: ProgressBarProps) {
  const percentage = Math.min(100, Math.round(((currentStep + 1) / totalSteps) * 100));

  return (
    <div className="w-full space-y-4 my-6">
      {/* Barre de pourcentage haut */}
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>Étape {currentStep + 1} sur {totalSteps}</span>
        <span className="text-primary font-bold">{percentage}% complété</span>
      </div>

      {/* Barre de progression fluide */}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary h-full rounded-full transition-all duration-500 ease-out shadow-xs"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stepper avec icônes (Desktop & Tablet) */}
      <div className="hidden sm:grid grid-cols-6 gap-2 pt-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isClickable = idx < currentStep && onStepClick;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(idx)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl text-center transition-all ${
                isClickable ? "cursor-pointer hover:bg-accent/50" : "cursor-default"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-xs ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-primary/15 text-primary border-2 border-primary ring-4 ring-primary/15"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={`text-[11px] font-medium transition-colors ${
                  isCurrent
                    ? "text-primary font-bold"
                    : isCompleted
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
