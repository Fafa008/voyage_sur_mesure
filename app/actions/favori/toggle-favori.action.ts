"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const circuitIdSchema = z.coerce.number().int().positive();

export async function toggleFavori(circuitId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Connectez-vous pour sauvegarder un circuit.", requiresAuth: true };
  }

  const parsed = circuitIdSchema.safeParse(circuitId);
  if (!parsed.success) {
    return { error: "Circuit invalide" };
  }

  const circuit = await prisma.circuit.findUnique({
    where: { id: parsed.data },
    select: { id: true, slug: true },
  });
  if (!circuit) {
    return { error: "Circuit introuvable" };
  }

  const existing = await prisma.favori.findUnique({
    where: {
      userId_circuitId: {
        userId: session.user.id,
        circuitId: parsed.data,
      },
    },
  });

  if (existing) {
    await prisma.favori.delete({ where: { id: existing.id } });
  } else {
    await prisma.favori.create({
      data: {
        userId: session.user.id,
        circuitId: parsed.data,
      },
    });
  }

  revalidatePath("/favoris");
  revalidatePath("/dashboard");
  revalidatePath("/circuits");
  revalidatePath(`/circuits/${circuit.slug}`);
  revalidatePath("/home");

  return { success: true, isFavori: !existing };
}
