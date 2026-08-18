import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
}

export async function calculateDevisBudget(
  devisId: number,
  options?: {
    typeHebergement?: string | null;
    transportType?: string | null;
    includeGuide?: boolean;
    remise?: number;
  }
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

  // 6. Remise
  const remise = Math.max(0, options?.remise ?? 0);

  // 7. Montant Total
  const montantTotal = Math.max(
    0,
    prixBaseCircuit + hebergementSuppl + transportSuppl + activitesSuppl + prestationsExtra - remise
  );

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
  };
}
