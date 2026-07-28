"use client";

import Link from "next/link";
import { Compass, Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-card text-card-foreground border-t border-border/40 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Identité */}
          <div className="space-y-4">
            <Link href="/home" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-foreground">
                Mon Voyage
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Créateur de séjours et circuits sur mesure d'exception à Madagascar. Des voyages authentiques façonnés selon vos envies.
            </p>
          </div>

          {/* Col 2: Navigation rapide */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/home" className="hover:text-primary transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/circuits" className="hover:text-primary transition-colors">
                  Nos circuits sur-mesure
                </Link>
              </li>
              <li>
                <Link href="/devis/nouveau" className="hover:text-primary transition-colors">
                  Demander un devis
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Contact & Agence
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>Antananarivo, Madagascar</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+261 34 00 000 00</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>contact@monvoyage.com</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Inspiration Voyage
            </h4>
            <p className="text-sm text-muted-foreground">
              Inscrivez-vous pour recevoir nos idées d'itinéraires et conseils de voyage.
            </p>
            <form className="flex items-center gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Votre adresse email"
                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button size="sm" type="submit">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>

        </div>

        {/* Bas de page */}
        <div className="pt-12 mt-12 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Mon Voyage. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-primary transition-colors">
              Mentions Légales
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Confidentialité
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              CGV
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
