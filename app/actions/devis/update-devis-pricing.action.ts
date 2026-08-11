"use server";

import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { RoleNom } from "@prisma/client";

const pricingSchema = z.object({
  devisId: z.coerce.number().int().positive(),
  montantTotal: z.coerce.number().positive("Le montant doit être supérieur à 0"),
  commentaireConseiller: z.string().min(1, "Un message au client est requis"),
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

export async function updateDevisPricing(formData: FormData) {
  await requireStaff();

  const parsed = pricingSchema.safeParse({
    devisId: formData.get("devisId"),
    montantTotal: formData.get("montantTotal"),
    commentaireConseiller: formData.get("commentaireConseiller"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { devisId, montantTotal, commentaireConseiller } = parsed.data;

  const devis = await prisma.devis.findUnique({ where: { id: devisId } });
  if (!devis) return { error: "Devis introuvable" };

  await prisma.devis.update({
    where: { id: devisId },
    data: { montantTotal, commentaireConseiller },
  });

  revalidatePath(`/conseiller/devis/${devisId}`);
  revalidatePath(`/devis/${devisId}`);

  return { success: true };
}

export async function validateDevisWithPricing(_prevState: unknown, formData: FormData) {
  await requireStaff();

  const parsed = pricingSchema.safeParse({
    devisId: formData.get("devisId"),
    montantTotal: formData.get("montantTotal"),
    commentaireConseiller: formData.get("commentaireConseiller"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { devisId, montantTotal, commentaireConseiller } = parsed.data;

  const devis = await prisma.devis.findUnique({
    where: { id: devisId },
    include: { user: { select: { id: true } } },
  });

  if (!devis) return { error: "Devis introuvable" };

  if (
    devis.statut !== "en_cours" &&
    devis.statut !== "en_modification"
  ) {
    return { error: "Ce devis ne peut plus être validé" };
  }

  await prisma.$transaction([
    prisma.devis.update({
      where: { id: devisId },
      data: {
        montantTotal,
        commentaireConseiller,
        statut: "valide",
      },
    }),
    prisma.notification.create({
      data: {
        userId: devis.userId,
        titre: "Devis prêt",
        message: `Votre devis #${devisId} a été chiffré à ${formatCurrency(montantTotal)}. Consultez-le pour accepter ou refuser.`,
      },
    }),
  ]);

  revalidatePath("/conseiller/dashboard");
  revalidatePath(`/conseiller/devis/${devisId}`);
  revalidatePath(`/devis/${devisId}`);
  revalidatePath("/dashboard");
  revalidatePath("/notifications");

  return { success: true };
}
