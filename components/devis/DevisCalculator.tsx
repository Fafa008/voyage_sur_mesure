"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { calculateDevisPricingAction, validateDevisWithPricing } from "@/app/actions/devis/update-devis-pricing.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatutDevis } from "@prisma/client";
import { PricingBreakdown, DevisDetailsCalcul } from "@/lib/services/devis-calculator.service";
import { formatCurrency } from "@/lib/format";
import {
  Calculator,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Info,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DevisCalculatorProps {
  devisId: number;
  statut: StatutDevis;
  initialTypeHebergement?: string | null;
  initialTransportType?: string | null;
  initialRemise?: number;
  initialCommentaire?: string | null;
  initialSnapshot?: DevisDetailsCalcul | null;
}

export function DevisCalculator({
  devisId,
  statut,
  initialTypeHebergement = "hotel",
  initialTransportType = "aucun",
  initialRemise = 0,
  initialCommentaire = "",
  initialSnapshot = null,
}: DevisCalculatorProps) {
  const router = useRouter();
  const [typeHebergement, setTypeHebergement] = useState(initialTypeHebergement || "hotel");
  const [transportType, setTransportType] = useState(initialTransportType || "aucun");
  const [includeGuide, setIncludeGuide] = useState(false);
  const [remise, setRemise] = useState(initialRemise);
  const [commentaire, setCommentaire] = useState(initialCommentaire || "");
  const [dateDebutConfirmee, setDateDebutConfirmee] = useState("");
  const [dateFinConfirmee, setDateFinConfirmee] = useState("");

  const [breakdown, setBreakdown] = useState<PricingBreakdown | null>(null);
  const [isCalculating, startCalculating] = useTransition();

  const [validationState, formAction, pendingConfirm] = useActionState(
    validateDevisWithPricing,
    null
  );

  // Snapshot scellé lors de la validation serveur (source de vérité en lecture seule)
  const snapshot = initialSnapshot;

  // Le devis est-il déjà finalisé ?
  const isFinalized =
    statut !== StatutDevis.en_cours && statut !== StatutDevis.en_modification;

  useEffect(() => {
    if (validationState?.success) {
      router.refresh();
    }
  }, [validationState, router]);

  const handleCalculate = (silent = false) => {
    startCalculating(async () => {
      const res = await calculateDevisPricingAction(devisId, {
        typeHebergement,
        transportType,
        includeGuide,
        remise,
      });

      if ("success" in res && res.success) {
        setBreakdown(res.breakdown);
      } else if (!silent && "error" in res) {
        alert(res.error);
      }
    });
  };

  // Devis finalisé sans snapshot (validé avant l'ajout de la fonctionnalité) :
  // on recalcule silencieusement pour afficher un rapport approximatif.
  useEffect(() => {
    if (isFinalized && !snapshot) {
      handleCalculate(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinalized, snapshot]);

  return (
    <div className="space-y-6">
      <Card className="border border-border/60">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Chiffrage et Validation du Devis
            </CardTitle>
            <CardDescription className="text-xs">
              {isFinalized
                ? "Ce devis a été validé et envoyé au client. Les calculs sont verrouillés."
                : "Calculez automatiquement le budget selon les options, comparez au budget client, puis validez."}
            </CardDescription>
          </div>
          {isFinalized && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              <Lock className="w-3 h-3 mr-1" />
              Chiffrage Finalisé
            </Badge>
          )}
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {!isFinalized ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Configuration Panel */}
              <div className="space-y-4">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  Configuration du Budget
                </h4>

                {/* Hebergement Select */}
                <div className="space-y-1.5">
                  <Label htmlFor="typeHebergement" className="text-xs">
                    Catégorie d&apos;hébergement
                  </Label>
                  <Select
                    items={[
                      { label: "Standard / Hôtel (Prix de base)", value: "hotel" },
                      { label: "Lodge (+80 000 MGA / j / pers)", value: "lodge" },
                      { label: "Luxe / Palace (+150 000 MGA / j / pers)", value: "luxe" },
                    ]}
                    value={typeHebergement}
                    onValueChange={(val) => {
                      setTypeHebergement(val || "hotel");
                      setBreakdown(null); // Force recalculation
                    }}
                  >
                    <SelectTrigger id="typeHebergement" className="h-10">
                      <SelectValue placeholder="Sélectionnez" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hotel">Standard / Hôtel (Prix de base)</SelectItem>
                      <SelectItem value="lodge">Lodge (+80 000 MGA / j / pers)</SelectItem>
                      <SelectItem value="luxe">Luxe / Palace (+150 000 MGA / j / pers)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Transport Select */}
                <div className="space-y-1.5">
                  <Label htmlFor="transportType" className="text-xs">
                    Mode de transport
                  </Label>
                  <Select
                    items={[
                      { label: "Aucun / De base", value: "aucun" },
                      { label: "Véhicule 4x4 (+120 000 MGA / jour)", value: "4x4" },
                      { label: "Vols intérieurs (+350 000 MGA / pers)", value: "avion" },
                      { label: "Transfert bateau (+90 000 MGA / pers)", value: "bateau" },
                    ]}
                    value={transportType}
                    onValueChange={(val) => {
                      setTransportType(val || "aucun");
                      setBreakdown(null);
                    }}
                  >
                    <SelectTrigger id="transportType" className="h-10">
                      <SelectValue placeholder="Sélectionnez" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aucun">Aucun / De base</SelectItem>
                      <SelectItem value="4x4">Véhicule 4x4 (+120 000 MGA / jour)</SelectItem>
                      <SelectItem value="avion">Vols intérieurs (+350 000 MGA / pers)</SelectItem>
                      <SelectItem value="bateau">Transfert bateau (+90 000 MGA / pers)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Guide Checkbox */}
                <div className="flex items-center gap-3 py-2 border rounded-xl px-3 border-border/50 bg-muted/20">
                  <input
                    type="checkbox"
                    id="includeGuide"
                    checked={includeGuide}
                    onChange={(e) => {
                      setIncludeGuide(e.target.checked);
                      setBreakdown(null);
                    }}
                    className="h-4.5 w-4.5 rounded border-input text-primary focus:ring-primary/20"
                  />
                  <div className="flex flex-col">
                    <Label htmlFor="includeGuide" className="text-xs font-semibold cursor-pointer">
                      Inclure un guide accompagnateur local
                    </Label>
                    <span className="text-[10px] text-muted-foreground">
                      Tarif journalier fixe de +50 000 MGA / jour
                    </span>
                  </div>
                </div>

                {/* Remise Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="remise" className="text-xs">
                    Remise commerciale (MGA)
                  </Label>
                  <Input
                    type="number"
                    id="remise"
                    min="0"
                    step="10000"
                    value={remise}
                    onChange={(e) => {
                      setRemise(Math.max(0, parseInt(e.target.value) || 0));
                      setBreakdown(null);
                    }}
                    className="h-10"
                    placeholder="Ex: 50000"
                  />
                </div>

                <Button
                  type="button"
                  onClick={() => handleCalculate()}
                  disabled={isCalculating}
                  className="w-full h-10 border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary transition-all font-semibold"
                >
                  {isCalculating ? "Calcul en cours..." : "Calculer le budget"}
                  <Calculator className="w-4 h-4 ml-1.5" />
                </Button>
              </div>

              {/* Server-Side Calculated Breakdown Display */}
              <div className="border border-border/60 rounded-2xl p-4 bg-muted/20 space-y-4">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Détail du Chiffrage</span>
                  {breakdown && (
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full lowercase">
                      calcul validé serveur
                    </span>
                  )}
                </h4>

                {breakdown ? (
                  <div className="space-y-3 text-xs">
                    {/* Avertissements données sources */}
                    {breakdown.avertissements.length > 0 && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                        <p className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Données incomplètes
                        </p>
                        <ul className="list-disc list-inside text-[11px] text-amber-700/90 dark:text-amber-400/90 space-y-0.5">
                          {breakdown.avertissements.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                        {!breakdown.estValide && (
                          <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                            La confirmation est bloquée tant que ces données ne sont pas corrigées.
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between py-1 border-b border-border/30">
                      <span className="text-muted-foreground">Circuit de base ({breakdown.nombreVoyageurs} pers)</span>
                      <span className="font-medium">{formatCurrency(breakdown.prixBaseCircuit)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/30">
                      <span className="text-muted-foreground">Supplément Hébergement ({typeHebergement})</span>
                      <span className="font-medium">{formatCurrency(breakdown.hebergementSuppl)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/30">
                      <span className="text-muted-foreground">Supplément Transport ({transportType})</span>
                      <span className="font-medium">{formatCurrency(breakdown.transportSuppl)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/30">
                      <span className="text-muted-foreground">Activités incluses</span>
                      <span className="font-medium">{formatCurrency(breakdown.activitesSuppl)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/30">
                      <span className="text-muted-foreground">Taxes & Prestations Extra</span>
                      <span className="font-medium">{formatCurrency(breakdown.prestationsExtra)}</span>
                    </div>
                    {breakdown.remise > 0 && (
                      <div className="flex justify-between py-1 border-b border-border/30 text-rose-500 font-medium">
                        <span>Remise commerciale</span>
                        <span>-{formatCurrency(breakdown.remise)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 text-sm font-bold text-primary">
                      <span>Total Calculé :</span>
                      <span>{formatCurrency(breakdown.montantTotal)}</span>
                    </div>

                    {/* Client Budget Comparison Box */}
                    <div className={cn(
                      "mt-4 p-3 rounded-xl border space-y-2",
                      breakdown.budgetStatut === "depasse"
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                    )}>
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          {breakdown.budgetStatut === "depasse" ? (
                            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 animate-bounce" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          )}
                          Budget client : {breakdown.budgetMax ? formatCurrency(breakdown.budgetMax) : "Non défini"}
                        </span>
                        <Badge className={cn(
                          "text-[10px] uppercase font-bold",
                          breakdown.budgetStatut === "depasse"
                            ? "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                            : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                        )}>
                          {breakdown.budgetStatut === "depasse" ? "Budget Dépassé" : "Budget Respecté"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-normal">
                        {breakdown.budgetStatut === "depasse"
                          ? `Le montant proposé dépasse le budget maximum du client de ${formatCurrency(breakdown.budgetDifference)}. Veuillez revoir le chiffrage ou la remise.`
                          : `Le montant proposé respecte le budget du client (Différence positive de ${formatCurrency(breakdown.budgetDifference)}).`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-2">
                    <HelpCircle className="w-10 h-10 text-muted-foreground/30" />
                    <p className="text-xs font-medium">Aucun calcul effectué</p>
                    <p className="text-[10px] text-center text-muted-foreground/80 px-4">
                      Veuillez configurer les paramètres de voyage à gauche puis cliquer sur &quot;Calculer le budget&quot;.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : snapshot ? (
            // ── Vue lecture seule fidèle au chiffrage scellé en base ──
            <ReadOnlyReport snapshot={snapshot} />
          ) : (
            // Devis finalisé sans snapshot (legacy) : rapport recalculé à titre indicatif
            breakdown ? (
              <ReadOnlyReport
                snapshot={{
                  calculeLe: "",
                  prixBaseCircuit: breakdown.prixBaseCircuit,
                  dureeJours: breakdown.dureeJours,
                  nombreVoyageurs: breakdown.nombreVoyageurs,
                  hebergementSuppl: breakdown.hebergementSuppl,
                  transportSuppl: breakdown.transportSuppl,
                  activitesSuppl: breakdown.activitesSuppl,
                  prestationsExtra: breakdown.prestationsExtra,
                  remise: breakdown.remise,
                  montantTotal: breakdown.montantTotal,
                  budgetMin: breakdown.budgetMin,
                  budgetMax: breakdown.budgetMax,
                  budgetStatut: breakdown.budgetStatut,
                  budgetDifference: breakdown.budgetDifference,
                  options: breakdown.options,
                }}
                legacy
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-2">
                <HelpCircle className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-xs">Aucun détail de calcul enregistré pour ce devis.</p>
              </div>
            )
          )}

          {/* Submission and Confirmation Form */}
          {!isFinalized && (
            <form action={formAction} className="space-y-4 border-t border-border/40 pt-4">
              <input type="hidden" name="devisId" value={devisId} />
              <input type="hidden" name="typeHebergement" value={typeHebergement} />
              <input type="hidden" name="transportType" value={transportType} />
              <input type="hidden" name="includeGuide" value={includeGuide ? "true" : "false"} />
              <input type="hidden" name="remise" value={remise} />
              <input type="hidden" name="dateDebutConfirmee" value={dateDebutConfirmee} />
              <input type="hidden" name="dateFinConfirmee" value={dateFinConfirmee} />

              {/* Dates confirmées (scellées lors de la validation) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dateDebutConfirmee" className="text-xs">
                    Date de début confirmée
                  </Label>
                  <Input
                    type="date"
                    id="dateDebutConfirmee"
                    value={dateDebutConfirmee}
                    onChange={(e) => setDateDebutConfirmee(e.target.value)}
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dateFinConfirmee" className="text-xs">
                    Date de fin confirmée
                  </Label>
                  <Input
                    type="date"
                    id="dateFinConfirmee"
                    value={dateFinConfirmee}
                    onChange={(e) => setDateFinConfirmee(e.target.value)}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              {/* Message to Traveler Client */}
              <div className="space-y-1.5">
                <Label htmlFor="commentaireConseiller" className="text-xs font-semibold">
                  Message personnalisé au voyageur (obligatoire)
                </Label>
                <Textarea
                  id="commentaireConseiller"
                  name="commentaireConseiller"
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Détaillez votre proposition, l'itinéraire, les conditions, ou expliquez une remise..."
                  rows={4}
                  required
                  className="min-h-[100px] text-xs resize-y"
                />
              </div>

              {validationState?.error && (
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{validationState.error}</p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={pendingConfirm || !breakdown || !breakdown.estValide}
                  className="w-full sm:w-auto font-bold bg-primary hover:bg-primary-hover shadow-md transition-all h-10 px-6 shrink-0"
                >
                  {pendingConfirm ? "Validation en cours..." : "Confirmer le devis et envoyer"}
                </Button>
                {!breakdown && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    Le calcul de budget doit être exécuté avant de confirmer le devis.
                  </span>
                )}
                {breakdown && !breakdown.estValide && (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Données du circuit incomplètes : confirmation impossible.
                  </span>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Rapport de chiffrage lecture seule construit depuis le snapshot persisté côté serveur.
 */
function ReadOnlyReport({
  snapshot,
  legacy = false,
}: {
  snapshot: DevisDetailsCalcul;
  legacy?: boolean;
}) {
  const sousTotal =
    snapshot.prixBaseCircuit +
    snapshot.hebergementSuppl +
    snapshot.transportSuppl +
    snapshot.activitesSuppl +
    snapshot.prestationsExtra;

  return (
    <div className="space-y-4">
      {legacy && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          Ce devis a été validé avant l&apos;archivage automatique du détail de calcul :
          le rapport ci-dessous est une estimation recalculée.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/40 p-4 border border-border/50 rounded-xl">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Hébergement</span>
          <span className="font-semibold text-xs capitalize">{snapshot.options.typeHebergement}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Transport</span>
          <span className="font-semibold text-xs capitalize">{snapshot.options.transportType}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Remise appliquée</span>
          <span className="font-semibold text-xs text-rose-500">
            -{formatCurrency(snapshot.remise)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Montant final</span>
          <span className="font-bold text-xs text-primary">{formatCurrency(snapshot.montantTotal)}</span>
        </div>
      </div>

      <div className="border border-border/60 rounded-xl p-4 bg-muted/20 space-y-2 max-w-md">
        <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground border-b pb-1.5 flex items-center justify-between">
          <span>Rapport de validation du budget</span>
          {snapshot.calculeLe && (
            <span className="text-[9px] normal-case font-normal text-muted-foreground/70">
              {new Date(snapshot.calculeLe).toLocaleString("fr-FR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </h4>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Circuit de base ({snapshot.nombreVoyageurs} pers)</span>
            <span>{formatCurrency(snapshot.prixBaseCircuit)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Supplément hébergement</span>
            <span>{formatCurrency(snapshot.hebergementSuppl)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Supplément transport</span>
            <span>{formatCurrency(snapshot.transportSuppl)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Activités incluses</span>
            <span>{formatCurrency(snapshot.activitesSuppl)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taxes & prestations extra</span>
            <span>{formatCurrency(snapshot.prestationsExtra)}</span>
          </div>
          <div className="flex justify-between border-t border-border/40 pt-1.5">
            <span className="text-muted-foreground">Sous-total prestations</span>
            <span>{formatCurrency(sousTotal)}</span>
          </div>
          <div className="flex justify-between text-rose-500">
            <span>Remise accordée</span>
            <span>-{formatCurrency(snapshot.remise)}</span>
          </div>
          <div className="flex justify-between font-bold text-primary border-t pt-1.5 mt-1.5">
            <span>Montant facturé</span>
            <span>{formatCurrency(snapshot.montantTotal)}</span>
          </div>
        </div>
      </div>

      {/* Comparaison budget client figée au moment de la validation */}
      {snapshot.budgetMax !== null && (
        <div className={cn(
          "max-w-md p-3 rounded-xl border space-y-1.5",
          snapshot.budgetStatut === "depasse"
            ? "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400"
            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
        )}>
          <div className="flex items-center justify-between font-bold text-xs">
            <span>Budget client : {formatCurrency(snapshot.budgetMax)}</span>
            <Badge className={cn(
              "text-[10px] uppercase font-bold",
              snapshot.budgetStatut === "depasse"
                ? "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            )}>
              {snapshot.budgetStatut === "depasse" ? "Budget Dépassé" : "Budget Respecté"}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {snapshot.budgetStatut === "depasse"
              ? `Au moment de la validation, le montant dépassait le budget maximal de ${formatCurrency(snapshot.budgetDifference)}.`
              : `Marge restante par rapport au budget maximal : ${formatCurrency(snapshot.budgetDifference)}.`}
          </p>
        </div>
      )}
    </div>
  );
}

// Simple Card components to prevent external import issues if cards are locally packaged
function Card({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("bg-card text-card-foreground rounded-2xl border border-border/60 shadow-xs", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props}>{children}</div>;
}

function CardTitle({ className, children, ...props }: React.ComponentProps<"h3">) {
  return <h3 className={cn("font-heading text-sm font-semibold text-foreground leading-none", className)} {...props}>{children}</h3>;
}

function CardDescription({ className, children, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-xs text-muted-foreground", className)} {...props}>{children}</p>;
}

function CardContent({ className, children, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-6 pt-0", className)} {...props}>{children}</div>;
}

function Badge({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
