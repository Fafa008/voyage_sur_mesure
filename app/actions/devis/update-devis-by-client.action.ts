"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { StatutDevis, Prisma } from "@prisma/client";

/**
 * Modification du devis PAR LE CLIENT.
 *
 * RÈGLE MÉTIER : lorsque le conseiller demande une modification
 * (statut `en_modification`), seul le client propriétaire peut corriger
 * les informations de son devis, puis le renvoyer pour nouvelle analyse.
 * Le devis repasse alors en `en_cours`.
 */

const updateDevisByClientSchema = z.object({
  prenom: z.string().min(1, "Prénom requis"),
  nom: z.string().min(1, "Nom requis"),
  telephone: z.string().min(1, "Téléphone requis"),
  circuitId: z.string().min(1, "Le circuit est requis"),
  typeVoyage: z.array(z.string()).optional(),
  themeIds: z.array(z.string()).optional(),
  regionIds: z.array(z.string()).optional(),
  dateDebut: z.string().min(1, "Date de début requise"),
  dateFin: z.string().min(1, "Date de fin requise"),
  dureeFlexible: z.string().optional(),
  adultes: z.coerce.number().int().min(1, "Au moins 1 adulte"),
  enfants: z.coerce.number().int().min(0).default(0),
  ados: z.coerce.number().int().min(0).default(0),
  enfantsAge: z.string().optional(),
  typeHebergement: z.string().optional(),
  regime: z.string().optional(),
  regimePrecision: z.string().optional(),
  activites: z.array(z.string()).optional(),
  transport: z.array(z.string()).optional(),
  budgetMin: z.coerce.number().min(0).optional(),
  budgetMax: z.coerce.number().min(0).optional(),
  commentaire: z.string().optional(),
  source: z.string().optional(),
  newsletter: z.string().optional(),
});

function toDateOrNull(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function updateDevisByClient(
  _prevState: unknown,
  formData: FormData
) {
  try {
    // 1. Session + ownership (vérification côté serveur)
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { error: "Vous devez être connecté." };

    const parsedDevisId = z.coerce
      .number()
      .int()
      .positive()
      .safeParse(formData.get("devisId"));
    if (!parsedDevisId.success) return { error: "Devis invalide" };
    const devisId = parsedDevisId.data;

    const devis = await prisma.devis.findUnique({ where: { id: devisId } });
    if (!devis) return { error: "Devis introuvable" };

    if (devis.userId !== session.user.id) {
      return { error: "Accès refusé : ce devis ne vous appartient pas." };
    }

    // 2. La modification n'est possible QUE sur une demande du conseiller.
    if (devis.statut !== StatutDevis.en_modification) {
      return {
        error:
          "Ce devis ne peut pas être modifié : aucune modification n'a été demandée par votre conseiller.",
      };
    }

    // 3. Validation des nouvelles données
    const rawData = {
      prenom: formData.get("prenom")?.toString() ?? "",
      nom: formData.get("nom")?.toString() ?? "",
      telephone: formData.get("telephone")?.toString() ?? "",
      circuitId: formData.get("circuitId")?.toString() ?? "",
      typeVoyage: formData.getAll("typeVoyage") as string[],
      themeIds: formData.getAll("themeIds") as string[],
      regionIds: formData.getAll("regionIds") as string[],
      dateDebut: formData.get("dateDebut")?.toString() ?? "",
      dateFin: formData.get("dateFin")?.toString() ?? "",
      dureeFlexible: formData.get("dureeFlexible")?.toString(),
      adultes: formData.get("adultes")?.toString() ?? "1",
      enfants: formData.get("enfants")?.toString() ?? "0",
      ados: formData.get("ados")?.toString() ?? "0",
      enfantsAge: formData.get("enfantsAge")?.toString(),
      typeHebergement: formData.get("typeHebergement")?.toString(),
      regime: formData.get("regime")?.toString(),
      regimePrecision: formData.get("regimePrecision")?.toString(),
      activites: formData.getAll("activites") as string[],
      transport: formData.getAll("transport") as string[],
      budgetMin: formData.get("budgetMin")?.toString() || undefined,
      budgetMax: formData.get("budgetMax")?.toString() || undefined,
      commentaire: formData.get("commentaire")?.toString(),
      source: formData.get("source")?.toString(),
      newsletter: formData.get("newsletter")?.toString(),
    };

    const parsed = updateDevisByClientSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message || "Erreur de validation",
      };
    }
    const data = parsed.data;

    const dateDebut = toDateOrNull(data.dateDebut);
    const dateFin = toDateOrNull(data.dateFin);
    if (!dateDebut || !dateFin) {
      return { error: "Dates invalides" };
    }
    if (dateFin < dateDebut) {
      return {
        error:
          "La date de retour doit être postérieure à la date de départ.",
      };
    }

    const circuitId = parseInt(data.circuitId, 10);
    const circuit = await prisma.circuit.findUnique({
      where: { id: circuitId },
      select: { id: true, titre: true, regionId: true },
    });
    if (!circuit) return { error: "Circuit invalide ou introuvable." };

    let regionIds = data.regionIds?.map((id) => parseInt(id)) || [];
    if (circuit.regionId && !regionIds.includes(circuit.regionId)) {
      regionIds = [circuit.regionId, ...regionIds];
    }

    // 4. Mise à jour par le client + retour en analyse (en_cours).
    // Les dates confirmées, le chiffrage et le commentaire conseiller sont
    // invalidés : le conseiller devra tout revalider avec les nouvelles données.
    console.log(
      `[DEVIS-WORKFLOW] Client modifie devis #${devisId} → en_cours (ancien statut: ${devis.statut})`
    );

    await prisma.$transaction([
      prisma.devis.update({
        where: { id: devisId },
        data: {
          prenom: data.prenom,
          nom: data.nom,
          telephone: data.telephone,
          circuitId,
          dateDebutSouhaitee: dateDebut,
          dateFinSouhaitee: dateFin,
          dureeFlexible: data.dureeFlexible === "true",
          adultes: data.adultes,
          enfants: data.enfants,
          ados: data.ados,
          enfantsAge: data.enfantsAge || null,
          typeHebergement: data.typeHebergement || null,
          regime: data.regime || null,
          regimePrecision: data.regimePrecision || null,
          budgetMin: data.budgetMin ? data.budgetMin : null,
          budgetMax: data.budgetMax ? data.budgetMax : null,
          source: data.source || devis.source,
          newsletter: data.newsletter
            ? data.newsletter === "true"
            : devis.newsletter,
          themeIds: data.themeIds?.map((id) => parseInt(id)) || [],
          regionIds,
          typeVoyage: data.typeVoyage || [],
          activites: data.activites || [],
          transport: data.transport || [],
          commentaireClient: data.commentaire || null,
          nombrePersonnes: data.adultes + data.enfants + data.ados,
          statut: StatutDevis.en_cours,
          // Invalider le chiffrage précédent : le conseiller devra recalculer
          montantTotal: null,
          detailsCalcul: Prisma.JsonNull,
          dateDebutConfirmee: null,
          dateFinConfirmee: null,
          // Effacer le commentaire du conseiller (demande de modification)
          commentaireConseiller: null,
        },
      }),
      ...(devis.conseillerId
        ? [
            prisma.notification.create({
              data: {
                userId: devis.conseillerId,
                titre: "Devis modifié par le client",
                message: `Le devis #${devisId} a été modifié par ${data.prenom} ${data.nom} et renvoyé pour nouvelle analyse.`,
              },
            }),
          ]
        : []),
      prisma.notification.create({
        data: {
          userId: devis.userId,
          titre: "Devis renvoyé à votre conseiller",
          message: `Votre devis #${devisId} a été mis à jour et renvoyé pour nouvelle analyse.`,
        },
      }),
    ]);

    console.log(
      `[DEVIS-WORKFLOW] Devis #${devisId} modifié par le client → statut en_cours, chiffrage invalidé, conseiller ${devis.conseillerId ?? "(non assigné)"} notifié`
    );

    revalidatePath(`/devis/${devisId}`);
    revalidatePath("/dashboard");
    revalidatePath("/notifications");
    revalidatePath("/conseiller/dashboard");
    if (devis.conseillerId) revalidatePath(`/conseiller/devis/${devisId}`);

    return { success: true as const };
  } catch (error: unknown) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la modification du devis",
    };
  }
}
