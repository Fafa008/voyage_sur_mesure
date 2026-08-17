// components/devis/wizard/NavigationButtons.tsx
"use client";

import { ArrowLeft, ArrowRight, Send, Loader2 } from "lucide-react";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function NavigationButtons({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
}: NavigationButtonsProps) {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentStep === 0}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm bg-card hover:bg-accent transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-card"
      >
        <ArrowLeft className="w-4 h-4" />
        Précédent
      </button>

      {isLastStep ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-7 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:brightness-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Vérifier ma demande
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-7 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:brightness-95 transition-all duration-200"
        >
          Suivant
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
