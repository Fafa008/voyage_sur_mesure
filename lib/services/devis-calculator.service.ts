import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export interface PricingOptions {
  typeHebergement?: string | null;
  transportType?: string | null;
  includeGuide?: boolean;
  remise?: number;
}

/** Snapshot du chiffrage scellé dans Devis.detailsCalcul lors de la validation */
export interface DevisDetailsCalcul {
  calculeLe: string;
  prixBaseCircuit: number;
  dureeJours: number;
  nombreVoyageurs: number;
  hebergementSuppl: number;
  transportSuppl: number;
  activitesSuppl: number;
  prestationsExtra: number;
  remise: number;
  montantTotal: number;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetStatut: "respecte" | "depasse";
  budgetDifference: number;
  options: Required<Pick<PricingOptions, "typeHebergement" | "transportType" | "includeGuide" | "remise">>;
}

/**
 * Convertit le champ Json Prisma en snapshot typé, ou null si absent/invalide.
 */
export function parseDetailsCalcul(value: Prisma.JsonValue | null): DevisDetailsCalcul | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const num = (v: unknown): number | null =>
    typeof v === "number" && Number.isFinite(v) ? v : null;

  const montantTotal = num(raw.montantTotal);
  if (montantTotal === null) return null;

  const opts = (raw.options ?? {}) as Record<string, unknown>;
  return {
    calculeLe: typeof raw.calculeLe === "string" ? raw.calculeLe : "",
    prixBaseCircuit: num(raw.prixBaseCircuit) ?? 0,
    dureeJours: num(raw.dureeJours) ?? 0,
    nombreVoyageurs: num(raw.nombreVoyageurs) ?? 1,
    hebergementSuppl: num(raw.hebergementSuppl) ?? 0,
    transportSuppl: num(raw.transportSuppl) ?? 0,
    activitesSuppl: num(raw.activitesSuppl) ?? 0,
    prestationsExtra: num(raw.prestationsExtra) ?? 0,
    remise: num(raw.remise) ?? 0,
    montantTotal,
    budgetMin: num(raw.budgetMin),
    budgetMax: num(raw.budgetMax),
    budgetStatut: raw.budgetStatut === "depasse" ? "depasse" : "respecte",
    budgetDifference: num(raw.budgetDifference) ?? 0,
    options: {
      typeHebergement: typeof opts.typeHebergement === "string" ? opts.typeHebergement : "hotel",
      transportType: typeof opts.transportType === "string" ? opts.transportType : "aucun",
      includeGuide: opts.includeGuide === true,
      remise: num(opts.remise) ?? 0,
    },
  };
}

export interface PricingBreakdown {
  prixBaseCircuit: number;
  dureeJours: number;
  nombreVoyageurs: number;
  hebergementSuppl: number;
  transportSuppl: number;
  activitesSuppl: number;
  prestationsExtra: number;
  remise: number;
  montantTotal: number;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetStatut: "respecte" | "depasse";
  budgetDifference: number;
  warning: boolean;
  // Données sources insuffisantes => confirmation interdite
  estValide: boolean;
  avertissements: string[];
  // Options utilisées pour ce calcul (nécessaires au snapshot persisté)
  options: Required<Pick<PricingOptions, "typeHebergement" | "transportType" | "includeGuide" | "remise">>;
}

/**
 * Calcule le budget d'un devis côté serveur à partir des données réelles
 * du circuit et du devis. Ne fait jamais confiance au frontend.
 */
export async function calculateDevisBudget(
  devisId: number,
  options?: PricingOptions
): Promise<PricingBreakdown> {
  const devis = await prisma.devis.findUnique({
    where: { id: devisId },
    include: {
      circuit: {
        include: {
          etapes: {
            include: {
              hebergement: true,
              activites: true,
            },
          },
        },
      },
    },
  });

  if (!devis) {
    throw new Error("Devis introuvable");
  }

  const circuit = devis.circuit;
  const travelers = devis.nombrePersonnes || 1;
  const duration = circuit.dureeJours || 7;

  // ── Validation des données sources ──
  const avertissements: string[] = [];
  let estValide = true;

  if (!circuit.prixEstime) {
    estValide = false;
    avertissements.push(
      "Le prix de base du circuit n'est pas renseigné : le chiffrage serait arbitraire."
    );
  }
  if (!circuit.dureeJours) {
    estValide = false;
    avertissements.push(
      "La durée du circuit n'est pas renseignée : les suppléments journaliers ne peuvent pas être calculés."
    );
  }
  if (travelers <= 0) {
    estValide = false;
    avertissements.push("Le nombre de voyageurs doit être au moins égal à 1.");
  }
  const remiseDemandee = Math.max(0, options?.remise ?? 0);

  // 1. Prix Base Circuit
  const prixBasePerPerson = circuit.prixEstime ? Number(circuit.prixEstime) : 500000;
  const prixBaseCircuit = prixBasePerPerson * travelers;

  // 2. Suppléments Hébergement
  const selectedHebergement = options?.typeHebergement ?? devis.typeHebergement ?? "hotel";
  let supplHebergementPerPersonPerDay = 0;
  if (selectedHebergement === "luxe") {
    supplHebergementPerPersonPerDay = 150000;
  } else if (selectedHebergement === "lodge") {
    supplHebergementPerPersonPerDay = 80000;
  }
  const hebergementSuppl = supplHebergementPerPersonPerDay * duration * travelers;

  // 3. Suppléments Transport
  const selectedTransport = options?.transportType ?? (devis.transport?.[0] || "aucun");
  let transportSuppl = 0;
  if (selectedTransport === "4x4") {
    transportSuppl = 120000 * duration;
  } else if (selectedTransport === "avion") {
    transportSuppl = 350000 * travelers;
  } else if (selectedTransport === "bateau") {
    transportSuppl = 90000 * travelers;
  }

  // 4. Suppléments Activités (depuis les activités réelles du circuit)
  let activitesSuppl = 0;
  circuit.etapes.forEach((etape) => {
    etape.activites.forEach((act) => {
      if (act.prix) {
        activitesSuppl += Number(act.prix);
      }
    });
  });
  activitesSuppl = activitesSuppl * travelers;

  // 5. Prestations Extra (Guide + Taxes de séjour)
  let prestationsExtra = 0;
  if (options?.includeGuide) {
    prestationsExtra += 50000 * duration; // Guide local journalier
  }
  prestationsExtra += 25000 * travelers; // Taxes de séjour locales

  // 6. Remise (plafonnée au sous-total pour ne jamais produire un montant négatif)
  const sousTotal =
    prixBaseCircuit + hebergementSuppl + transportSuppl + activitesSuppl + prestationsExtra;
  const remise = Math.min(remiseDemandee, sousTotal);
  if (remiseDemandee > sousTotal) {
    avertissements.push(
      "La remise demandée excède le sous-total des prestations ; elle a été plafonnée."
    );
  }

  // 7. Montant Total
  const montantTotal = Math.max(0, sousTotal - remise);

  // 8. Comparaison avec le budget client
  const budgetMin = devis.budgetMin ? Number(devis.budgetMin) : null;
  const budgetMax = devis.budgetMax ? Number(devis.budgetMax) : null;

  let budgetStatut: "respecte" | "depasse" = "respecte";
  let budgetDifference = 0;
  let warning = false;

  if (budgetMax !== null) {
    if (montantTotal > budgetMax) {
      budgetStatut = "depasse";
      budgetDifference = montantTotal - budgetMax;
      warning = true;
    } else {
      budgetDifference = budgetMax - montantTotal;
    }
  }

  return {
    prixBaseCircuit,
    dureeJours: duration,
    nombreVoyageurs: travelers,
    hebergementSuppl,
    transportSuppl,
    activitesSuppl,
    prestationsExtra,
    remise,
    montantTotal,
    budgetMin,
    budgetMax,
    budgetStatut,
    budgetDifference,
    warning,
    estValide,
    avertissements,
    options: {
      typeHebergement: selectedHebergement,
      transportType: selectedTransport,
      includeGuide: Boolean(options?.includeGuide),
      remise,
    },
  };
}
