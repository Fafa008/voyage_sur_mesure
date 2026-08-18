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

  const existingDevis = await prisma.devis.findUnique({
    where: { id: devisId },
    include: { reservation: true },
  });

  if (!existingDevis) {
    throw new Error("Devis introuvable");
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