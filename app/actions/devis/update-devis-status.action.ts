"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { RoleNom, StatutDevis } from "@prisma/client";

export async function updateDevisStatus(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Non authentifié");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  if (!user?.role || (user.role.nom !== RoleNom.admin && user.role.nom !== RoleNom.conseiller)) {
    throw new Error("Accès refusé : seuls les conseillers et administrateurs peuvent modifier le statut d'un devis");
  }

  const devisId = parseInt(formData.get("devisId") as string, 10);
  const statut = formData.get("statut") as StatutDevis;

  if (!Object.values(StatutDevis).includes(statut)) {
    throw new Error("Statut invalide");
  }

  const existingDevis = await prisma.devis.findUnique({
    where: { id: devisId },
    include: { reservation: true },
  });

  if (!existingDevis) {
    throw new Error("Devis introuvable");
  }

  // Le passage à « validé » est réservé au flux de chiffrage
  // (validateDevisWithPricing) qui recalcule le montant côté serveur.
  if (statut === StatutDevis.valide) {
    throw new Error(
      "Un devis ne peut pas être marqué validé manuellement : utilisez le calculateur de budget pour chiffrer puis confirmer le devis."
    );
  }

  // Devis déjà accepté ou réservé par le client : plus aucune modification possible.
  if (
    existingDevis.statut === StatutDevis.accepte ||
    existingDevis.statut === StatutDevis.reserve
  ) {
    throw new Error(
      "Ce devis a été accepté par le client et ne peut plus être modifié."
    );
  }

  if (existingDevis.reservation && statut !== StatutDevis.reserve) {
    throw new Error("Ce devis a déjà été transformé en réservation. Le statut ne peut pas être réinitialisé sans annuler la réservation.");
  }

  await prisma.devis.update({
    where: { id: devisId },
    data: { statut },
  });

  revalidatePath("/conseiller/dashboard");
  revalidatePath(`/conseiller/devis/${devisId}`);
  revalidatePath(`/devis/${devisId}`);

  redirect("/conseiller/dashboard");
}
