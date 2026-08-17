import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

const teamMembers = [
  { nom: "Rako Andriana", role: "Guide Expert", initiales: "RA" },
  { nom: "Sarah Martinez", role: "Conseillère", initiales: "SM" },
  { nom: "James Wilson", role: "Organisateur", initiales: "JW" },
  { nom: "Olivia Chen", role: "Coordinatrice", initiales: "OC" },
];

const avis = [
  {
    nom: "Sophie & Thomas L.",
    voyage: "Circuit Tsingy & Baobabs • 12 jours",
    texte:
      "Un voyage exceptionnel organisé dans les moindres détails. L'équipe sur place s'est montrée d'une réactivité irréprochable. Une vraie déconnexion !",
    note: 5,
    initiales: "ST",
  },
  {
    nom: "Marc D.",
    texte:
      "Un itinéraire parfaitement équilibré entre aventure, rencontres locales et moments de détente sur l'île Sainte-Marie. Je repasserai sans hésiter par eux.",
    voyage: "Grande Traversée & Lémuriens • 15 jours",
    note: 5,
    initiales: "MD",
  },
  {
    nom: "Élodie & François",
    texte:
      "Du devis sur-mesure jusqu'à la fin de notre séjour, tout était fluide et conforme à nos exigences. Merci à Marie notre conseillère dédiée !",
    voyage: "Circuit Sud & Lagon • 10 jours",
    note: 5,
    initiales: "EF",
  },
];

export default function Temoignages() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background border-b border-border/40">
      <div className="max-w-7xl mx-auto space-y-14">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest font-semibold text-primary">
            Avis & Témoignages
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Approuvé par des Milliers de Voyageurs
          </h2>
        </div>

        {/* Team Avatars */}
        <div className="flex flex-wrap items-center justify-center gap-8">
          {teamMembers.map((member, i) => (
            <div key={i} className="flex flex-col items-center gap-2 group">
              <Avatar className="h-16 w-16 border-2 border-primary/20 group-hover:border-primary/50 transition-colors shadow-md">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {member.initiales}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">
                  {member.nom}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {avis.map((a, i) => (
            <Card
              key={i}
              className="group bg-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between p-6 space-y-6"
            >
              <CardContent className="p-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: a.note }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-primary/20 group-hover:text-primary/40 transition-colors" />
                </div>

                <p className="text-sm text-foreground/90 leading-relaxed italic">
                  &quot;{a.texte}&quot;
                </p>
              </CardContent>

              <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                <Avatar className="h-10 w-10 border border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {a.initiales}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{a.nom}</h4>
                  <p className="text-xs text-muted-foreground">{a.voyage}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
