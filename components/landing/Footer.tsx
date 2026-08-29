"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const quickLinks = [
  { label: "Accueil", href: "/home" },
  { label: "Circuits", href: "/circuits" },
  { label: "Demander un devis", href: "/devis/nouveau" },
  { label: "Contact", href: "/contact" },
];

const services = [
  { label: "Voyages sur mesure", href: "/circuits" },
  { label: "Circuits guidés", href: "/circuits" },
  { label: "Séjours balnéaires", href: "/circuits" },
  { label: "Aventure & Trekking", href: "/circuits" },
];

export default function Footer() {
  return (
    <footer className="bg-card text-card-foreground border-t border-border/40 mt-auto">
      {/* Newsletter Strip */}
      <div className="border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-foreground">
                Inspiration Voyage
              </h3>
              <p className="text-sm text-muted-foreground">
                Recevez nos idées d&apos;itinéraires et conseils exclusifs.
              </p>
            </div>
            <form
              className="flex items-center gap-2 w-full sm:w-auto max-w-md"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1"
              />
              <Button type="submit" className="px-5 shrink-0">
                <Send className="w-4 h-4 mr-1.5" />
                S'inscrire
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Identity */}
          <div className="space-y-4">
            <Link href="/home" className="flex items-center group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Logo.svg"
                alt="Madaventure"
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Créateur de séjours et circuits sur mesure d'exception à
              Madagascar. Des voyages authentiques façonnés selon vos envies.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Liens Rapides
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Services */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Services
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {services.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact */}
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
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
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
