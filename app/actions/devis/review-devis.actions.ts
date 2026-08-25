"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { RoleNom, StatutDevis } from "@prisma/client";

/**
 * Actions de DÉCISION du conseiller sur un devis.
 *
 * RÈGLE MÉTIER : le conseiller est un validateur, pas un éditeur.
 * Il ne peut jamais modifier les données du devis (dates, voyageurs,
 * hébergement, budget, etc.). Il dispose uniquement de trois décisions :
 *   1. Confirmer le devis        → update-devis-pricing.action.ts
 *   2. Demander une modification → requestDevisModificationAction (ici)
 *   3. Refuser le devis          → refuseDevisByStaffAction (ici)
 *
 * Toute correction du contenu doit être effectuée par le CLIENT.
 */

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

/** Statuts depuis lesquels le conseiller peut prendre une décision. */
function canDecide(statut: StatutDevis): boolean {
  return (
    statut === StatutDevis.en_cours ||
    statut === StatutDevis.en_modification ||
    statut === StatutDevis.valide
  );
}

const decisionSchema = z.object({
  devisId: z.coerce.number().int().positive(),
  commentaireConseiller: z.string(),
});

/**
 * Le conseiller demande au CLIENT de corriger lui-même son devis.
 * Le commentaire expliquant ce qui doit être modifié est OBLIGATOIRE.
 */
export async function requestDevisModificationAction(
  _prevState: unknown,
  formData: FormData
) {
  try {
    await requireStaff();

    const parsed = decisionSchema.safeParse({
      devisId: formData.get("devisId"),
      commentaireConseiller: formData.get("commentaireConseiller"),
    });

    if (!parsed.success) {
      return { error: "Données invalides" };
    }

    const commentaire = parsed.data.commentaireConseiller.trim();
    if (commentaire.length < 10) {
      return {
        error:
          "Merci d'indiquer clairement (10 caractères minimum) ce que le client doit modifier.",
      };
    }

    const devis = await prisma.devis.findUnique({
      where: { id: parsed.data.devisId },
    });
    if (!devis) return { error: "Devis introuvable" };

    if (!canDecide(devis.statut)) {
      return {
        error:
          "Ce dossier est déjà accepté, réservé ou refusé : aucune demande de modification n'est possible.",
      };
    }

    await prisma.$transaction([
      prisma.devis.update({
        where: { id: devis.id },
        data: {
          statut: StatutDevis.en_modification,
          commentaireConseiller: commentaire,
        },
      }),
      prisma.notification.create({
        data: {
          userId: devis.userId,
          titre: "Modification demandée sur votre devis",
          message: `Votre conseiller vous demande de modifier votre devis #${devis.id} : ${commentaire}`,
        },
      }),
    ]);

    console.log(
      `[DEVIS-WORKFLOW] Conseiller demande modification devis #${devis.id} → en_modification. Commentaire: "${commentaire.substring(0, 80)}..."`
    );

    revalidatePath("/conseiller/dashboard");
    revalidatePath(`/conseiller/devis/${devis.id}`);
    revalidatePath(`/devis/${devis.id}`);
    revalidatePath("/dashboard");
    revalidatePath("/notifications");

    return { success: true as const };
  } catch (error: unknown) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la demande de modification",
    };
  }
}

/**
 * Le conseiller refuse le devis. Un motif peut être fourni (optionnel).
 * Le devis refusé ne peut plus être transformé en réservation.
 */
export async function refuseDevisByStaffAction(
  _prevState: unknown,
  formData: FormData
) {
  try {
    await requireStaff();

    const parsed = decisionSchema.safeParse({
      devisId: formData.get("devisId"),
      commentaireConseiller: formData.get("commentaireConseiller"),
    });

    if (!parsed.success) {
      return { error: "Données invalides" };
    }

    const motif = parsed.data.commentaireConseiller.trim();

    const devis = await prisma.devis.findUnique({
      where: { id: parsed.data.devisId },
    });
    if (!devis) return { error: "Devis introuvable" };

    if (!canDecide(devis.statut)) {
      return {
        error:
          "Ce dossier est déjà accepté, réservé ou refusé : il ne peut plus être refusé.",
      };
    }

    await prisma.$transaction([
      prisma.devis.update({
        where: { id: devis.id },
        data: {
          statut: StatutDevis.refuse,
          ...(motif ? { commentaireConseiller: motif } : {}),
        },
      }),
      prisma.notification.create({
        data: {
          userId: devis.userId,
          titre: "Votre demande de devis a été déclinée",
          message: motif
            ? `Votre devis #${devis.id} a été refusé par l'agence. Motif : ${motif}`
            : `Votre devis #${devis.id} a été refusé par l'agence.`,
        },
      }),
    ]);

    console.log(
      `[DEVIS-WORKFLOW] Conseiller refuse devis #${devis.id} → refuse${motif ? `. Motif: "${motif.substring(0, 80)}"` : ""}`
    );

    revalidatePath("/conseiller/dashboard");
    revalidatePath(`/conseiller/devis/${devis.id}`);
    revalidatePath(`/devis/${devis.id}`);
    revalidatePath("/dashboard");
    revalidatePath("/notifications");

    return { success: true as const };
  } catch (error: unknown) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors du refus du devis",
    };
  }
}
