"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Contactez-nous
        </h1>
        <p className="text-muted-foreground mt-2">
          Notre équipe d&apos;experts est à votre disposition pour concrétiser
          vos projets de voyage sur-mesure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Informations de contact */}
        <Card className="h-full flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Nos Coordonnées</CardTitle>
            <CardDescription>
              Venez nous rencontrer ou contactez un conseiller
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="font-semibold block text-foreground">
                Adresse :
              </span>
              <p className="text-muted-foreground">
                123 Avenue du Voyage, Antananarivo, Madagascar
              </p>
            </div>
            <div>
              <span className="font-semibold block text-foreground">
                Téléphone :
              </span>
              <p className="text-muted-foreground">+261 34 00 000 00</p>
            </div>
            <div>
              <span className="font-semibold block text-foreground">
                Email :
              </span>
              <p className="text-muted-foreground">contact@monvoyage.com</p>
            </div>
            <div>
              <span className="font-semibold block text-foreground">
                Horaires d&apos;ouverture :
              </span>
              <p className="text-muted-foreground">
                Lundi - Vendredi : 8h00 - 18h00
              </p>
              <p className="text-muted-foreground">Samedi : 9h00 - 13h00</p>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire de message */}
        <Card>
          <CardHeader>
            <CardTitle>Envoyez-nous un message</CardTitle>
            <CardDescription>
              Une question ? Une demande spécifique ?
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-lg font-semibold text-foreground">
                  Message envoyé !
                </p>
                <p className="text-muted-foreground text-sm">
                  Nous vous répondrons dans les plus brefs délais.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nom">Nom complet</Label>
                  <Input
                    id="nom"
                    type="text"
                    placeholder="Votre nom"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@example.com"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={4}
                    placeholder="Expliquez-nous votre demande..."
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Envoyer le message
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
