"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const removeSchema = z.object({
  circuitId: z.coerce.number().int().positive(),
});

export async function removeFavori(_prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Non authentifié" };
  }

  const parsed = removeSchema.safeParse({
    circuitId: formData.get("circuitId"),
  });

  if (!parsed.success) {
    return { error: "Données invalides" };
  }

  const { circuitId } = parsed.data;

  const favori = await prisma.favori.findUnique({
    where: {
      userId_circuitId: {
        userId: session.user.id,
        circuitId,
      },
    },
    include: { circuit: { select: { slug: true } } },
  });

  if (!favori) {
    return { error: "Favori introuvable" };
  }

  await prisma.favori.delete({ where: { id: favori.id } });

  revalidatePath("/favoris");
  revalidatePath("/dashboard");
  revalidatePath("/circuits");
  revalidatePath(`/circuits/${favori.circuit.slug}`);
  revalidatePath("/home");

  return { success: true };
}
