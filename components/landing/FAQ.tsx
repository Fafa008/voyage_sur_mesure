"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Comment fonctionne la création d'un voyage sur mesure ?",
    answer:
      "C'est simple ! Remplissez notre formulaire de devis en indiquant vos envies (destinations, durée, budget, centres d'intérêt). Un conseiller spécialiste vous contacte sous 24h pour co-construire votre itinéraire personnalisé, étape par étape.",
  },
  {
    question: "Quel est le délai de réponse pour un devis ?",
    answer:
      "Nous vous envoyons une première proposition sous 24 à 48 heures ouvrées. Le devis détaillé, avec hébergements, activités et transport, est finalisé en 3 à 5 jours après vos retours.",
  },
  {
    question: "Quels types de circuits proposez-vous ?",
    answer:
      "Nous proposons des circuits nature, aventure, culturels, balnéaires et en famille. Chaque itinéraire est 100% personnalisable : durée, rythme, hébergements et activités s'adaptent à vos souhaits.",
  },
  {
    question: "Quelle est la meilleure période pour visiter Madagascar ?",
    answer:
      "La saison sèche (avril à novembre) est idéale. De juin à septembre, le climat est parfait pour les Tsingy et les treks. Les baleines se montrent de juillet à septembre sur la côte est. Nous vous conseillerons selon votre itinéraire.",
  },
  {
    question: "Quelles garanties offrez-vous sur les réservations ?",
    answer:
      "Toutes nos réservations sont sécurisées avec un paiement protégé. Vous bénéficiez d'une assurance annulation flexible, d'une assistance 24/7 sur place, et de notre garantie satisfaction. Nos guides et partenaires sont tous certifiés.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20 border-b border-border/40">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest font-semibold text-primary">
                Aide & Support
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Questions Fréquentes
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-md leading-relaxed">
                Retrouvez les réponses aux questions les plus posées par nos
                voyageurs. Vous ne trouvez pas votre réponse ? Contactez-nous !
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Besoin d'aide ?
                </p>
                <p className="text-xs text-muted-foreground">
                  Notre équipe répond sous 24h à toutes vos questions.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Accordion */}
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`border rounded-xl transition-all duration-300 ${
                    isOpen
                      ? "border-primary/30 bg-card shadow-sm"
                      : "border-border/60 bg-background hover:border-border"
                  }`}
                >
                  <button
                    onClick={() =>
                      setOpenIndex(isOpen ? null : index)
                    }
                    className="w-full flex items-center justify-between gap-4 p-4 text-left"
                  >
                    <span
                      className={`text-sm font-semibold transition-colors ${
                        isOpen ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
