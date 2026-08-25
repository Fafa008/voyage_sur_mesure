"use server";

import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { RoleNom, StatutDevis } from "@prisma/client";
import { calculateDevisBudget, PricingBreakdown } from "@/lib/services/devis-calculator.service";

const pricingSchema = z.object({
  devisId: z.coerce.number().int().positive(),
  commentaireConseiller: z.string().min(1, "Un message au client est requis"),
  typeHebergement: z.string().optional().nullable(),
  transportType: z.string().optional().nullable(),
  includeGuide: z.preprocess((val) => val === "true" || val === true || val === "on", z.boolean()),
  remise: z.coerce.number().nonnegative("La remise ne peut pas être négative").default(0),
  dateDebutConfirmee: z.string().optional().nullable(),
  dateFinConfirmee: z.string().optional().nullable(),
});

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  const role = user?.role?.nom;
  if (role !== RoleNom.admin && role !== RoleNom.conseiller) {
    throw new Error("Accès refusé");
  }

  return session;
}

/**
 * Calcule le budget d'un devis côté serveur en fonction des paramètres sélectionnés
 */
export async function calculateDevisPricingAction(
  devisId: number,
  params: {
    typeHebergement?: string | null;
    transportType?: string | null;
    includeGuide?: boolean;
    remise?: number;
  }
): Promise<{ success: true; breakdown: PricingBreakdown } | { error: string }> {
  try {
    await requireStaff();
    const breakdown = await calculateDevisBudget(devisId, params);
    return { success: true, breakdown };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Erreur lors du calcul" };
  }
}

/**
 * Valide le devis en recalculant obligatoirement le chiffrage côté serveur et en scellant les dates confirmées
 */
export async function validateDevisWithPricing(_prevState: unknown, formData: FormData) {
  try {
    await requireStaff();

    const parsed = pricingSchema.safeParse({
      devisId: formData.get("devisId"),
      commentaireConseiller: formData.get("commentaireConseiller"),
      typeHebergement: formData.get("typeHebergement"),
      transportType: formData.get("transportType"),
      includeGuide: formData.get("includeGuide"),
      remise: formData.get("remise"),
      dateDebutConfirmee: formData.get("dateDebutConfirmee"),
      dateFinConfirmee: formData.get("dateFinConfirmee"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
    }

    const {
      devisId,
      commentaireConseiller,
      typeHebergement,
      transportType,
      includeGuide,
      remise,
      dateDebutConfirmee,
      dateFinConfirmee,
    } = parsed.data;

    const devis = await prisma.devis.findUnique({
      where: { id: devisId },
      include: { user: { select: { id: true } } },
    });

    if (!devis) return { error: "Devis introuvable" };

    // Seul un devis en_cours peut être chiffré/validé.
    // Un devis en_modification est en attente des corrections du client :
    // le conseiller ne peut pas le valider tant que le client ne l'a pas renvoyé.
    if (devis.statut !== StatutDevis.en_cours) {
      if (devis.statut === StatutDevis.en_modification) {
        return {
          error:
            "Ce devis est en attente de modification par le client. Vous pourrez le valider une fois qu'il l'aura renvoyé.",
        };
      }
      return { error: "Ce devis est déjà validé, accepté ou clôturé." };
    }

    // Recalculer le montant exact côté serveur pour la sécurité
    const breakdown = await calculateDevisBudget(devisId, {
      typeHebergement,
      transportType,
      includeGuide,
      remise,
    });

    // Données sources insuffisantes : la confirmation est interdite
    if (!breakdown.estValide) {
      return {
        error: `Chiffrage impossible : ${breakdown.avertissements.join(" ")}`,
      };
    }

    const parsedDateDebut = dateDebutConfirmee ? new Date(dateDebutConfirmee) : null;
    const parsedDateFin = dateFinConfirmee ? new Date(dateFinConfirmee) : null;

    // Snapshot du chiffrage scellé avec le devis (audit + affichage finalisé fidèle)
    const detailsCalcul = {
      calculeLe: new Date().toISOString(),
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
    };

    // Sauvegarde en BDD et notification client.
    // RÈGLE MÉTIER : le conseiller ne modifie AUCUNE donnée saisie par le client.
    // typeHebergement/transport choisis ici sont des options de chiffrage :
    // elles sont scellées uniquement dans le snapshot detailsCalcul, jamais
    // écrites dans les champs du devis appartenant au client.
    await prisma.$transaction([
      prisma.devis.update({
        where: { id: devisId },
        data: {
          montantTotal: breakdown.montantTotal,
          commentaireConseiller,
          statut: StatutDevis.valide,
          dateDebutConfirmee: parsedDateDebut ?? undefined,
          dateFinConfirmee: parsedDateFin ?? undefined,
          detailsCalcul,
        },
      }),
      prisma.notification.create({
        data: {
          userId: devis.userId,
          titre: "Devis prêt",
          message: `Votre devis #${devisId} a été chiffré à ${formatCurrency(breakdown.montantTotal)}. Consultez-le pour l'accepter ou le refuser.`,
        },
      }),
    ]);

    console.log(
      `[DEVIS-WORKFLOW] Conseiller valide devis #${devisId} → valide. Montant: ${formatCurrency(breakdown.montantTotal)}`
    );

    revalidatePath("/conseiller/dashboard");
    revalidatePath(`/conseiller/devis/${devisId}`);
    revalidatePath(`/devis/${devisId}`);
    revalidatePath("/dashboard");
    revalidatePath("/notifications");

    return { success: true };
  } catch (error: unknown) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la validation",
    };
  }
}
