import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/Button";
import {
  Compass,
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  Search,
  Users,
  HandCoins,
  Lock,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Recherche Intelligente",
    desc: "Trouvez le circuit parfait grâce à notre moteur de recherche adapté à vos envies et votre budget.",
  },
  {
    icon: HeartHandshake,
    title: "Accompagnement Expert",
    desc: "Bénéficiez de conseils précieux de nos conseillers locaux connaissant chaque recoin de Madagascar.",
  },
  {
    icon: HandCoins,
    title: "Meilleurs Tarifs",
    desc: "Prix négociés directement avec nos partenaires locaux, sans intermédiaire, pour le meilleur rapport qualité-prix.",
  },
  {
    icon: Lock,
    title: "Processus Sécurisé",
    desc: "Réservation sécurisée avec garantie satisfait ou remboursé et assistance 24/7 sur place.",
  },
];

const stats = [
  { value: "+145", label: "Circuits Réalisés" },
  { value: "+2.8K", label: "Voyageurs Heureux" },
  { value: "+35", label: "Guides Locaux" },
  { value: "+10", label: "Ans d'Expérience" },
];

export default function WhyUs() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 border-b border-border/40">
      <div className="max-w-7xl mx-auto">
        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column - Text & CTA */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-widest font-semibold text-primary">
                L'Esprit Mon Voyage
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Voyager, Simplifié
                <br />
                et Fiable
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-md leading-relaxed">
                Nous combinons connaissance du terrain et personnalisation
                absolue pour faire de votre séjour à Madagascar une aventure
                inoubliable. De la première idée au retour chez vous, nous
                sommes là.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/circuits"
                className={
                  buttonVariants({ variant: "default" }) +
                  " px-6 py-3 font-semibold shadow-md"
                }
              >
                Explorer les Circuits
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border/40">
              {stats.map((stat, i) => (
                <div key={i} className="text-center sm:text-left space-y-0.5">
                  <div className="text-2xl sm:text-3xl font-extrabold text-primary leading-none">
                    {stat.value}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={index}
                  className="group border border-border/60 bg-background hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
