import { Card, CardContent } from "@/components/ui/card";
import { Compass, ShieldCheck, HeartHandshake, Sparkles, MapPin, CreditCard } from "lucide-react";

const features = [
  {
    icon: Compass,
    title: "Voyages 100% sur mesure",
    desc: "Ajustez chaque étape, activité et hébergement selon vos envies et votre rythme de voyage.",
  },
  {
    icon: HeartHandshake,
    title: "Conseillers locaux dédiés",
    desc: "Bénéficiez de conseils précieux d'experts vivant à Madagascar et connaissant chaque région.",
  },
  {
    icon: ShieldCheck,
    title: "Paiement & Garantie",
    desc: "Système de réservation sécurisé avec accompagnement et assistance continue tout au long du séjour.",
  },
  {
    icon: Sparkles,
    title: "Expériences authentiques",
    desc: "Rencontrez les communautés locales, explorez des parcs nationaux uniques et des paysages préservés.",
  },
];

export default function WhyUs() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 border-b border-border/40">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest font-semibold text-primary">
            L'Esprit Mon Voyage
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Pourquoi réaliser votre voyage avec nous ?
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Nous combinons connaissance du terrain et personnalisation absolue pour faire de votre séjour une aventure mémorable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                className="group border border-border/60 bg-background hover:border-primary/40 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
}