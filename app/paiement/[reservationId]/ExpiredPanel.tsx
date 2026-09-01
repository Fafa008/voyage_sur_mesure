import Link from "next/link";
import { Clock, CalendarDays, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "@/components/currency/PriceDisplay";

interface ExpiredPanelProps {
  reservation: {
    id: number;
    nbVoyageurs: number;
    montantFinal: number | null;
    dateDebut: Date | null;
    dateFin: Date | null;
    devis: { id: number } | null;
  };
  circuitTitle: string;
}

export function ExpiredPanel({ reservation, circuitTitle }: ExpiredPanelProps) {
  return (
    <main className="max-w-2xl mx-auto py-16 px-4">
      <Card className="border-border/40 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
        <CardHeader className="text-center pt-10 pb-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-7 w-7 text-primary" />
          </div>
          <Badge
            variant="outline"
            className="w-fit mx-auto mb-3 text-xs font-bold text-muted-foreground border-border/40"
          >
            Réservation #{reservation.id}
          </Badge>
          <CardTitle className="text-2xl font-bold text-center">
            Délai de paiement expiré
          </CardTitle>
          <CardDescription className="mx-auto max-w-md text-foreground/70">
            La fenêtre de paiement de 15 minutes a expiré pour votre voyage
            «&nbsp;{circuitTitle}&nbsp;». Vos places ont été libérées et peuvent
            maintenant être réservées par d&apos;autres voyageurs.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6 sm:px-10 pb-10">
          <div className="rounded-xl border border-border/40 bg-muted/30 p-4 text-sm">
            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground">Voyage</span>
              <span className="font-semibold text-foreground">{circuitTitle}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground">Voyageurs</span>
              <span className="font-semibold text-foreground">
                {reservation.nbVoyageurs} voyageur(s)
              </span>
            </div>
            {reservation.dateDebut && (
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Départ
                </span>
                <span className="font-semibold text-foreground">
                  {new Date(reservation.dateDebut).toLocaleDateString("fr-FR")}
                  {reservation.dateFin
                    ? ` → ${new Date(reservation.dateFin).toLocaleDateString("fr-FR")}`
                    : ""}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between py-1.5 border-t border-border/40 mt-1.5 pt-3">
              <span className="text-muted-foreground">Montant réservé</span>
              <PriceDisplay
                amount={reservation.montantFinal?.toString() || "0"}
                size="md"
                priceClassName="font-bold text-foreground"
              />
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-sm text-destructive">
            <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              Cette réservation a été automatiquement annulée. Aucun paiement
              ne peut plus être effectué sur celle-ci.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={reservation.devis ? `/devis/${reservation.devis.id}` : "/reservations"}
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "flex-1 font-semibold"
              )}
            >
              {reservation.devis ? "Retour à mon devis" : "Voir mes réservations"}
            </Link>
            <Link
              href="/devis/nouveau"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "flex-1 font-semibold"
              )}
            >
              Demander un nouveau devis
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}