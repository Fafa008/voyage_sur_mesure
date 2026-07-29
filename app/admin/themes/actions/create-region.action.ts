"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createRegionSchema = z.object({
  nom: z.string().trim().min(1, "Nom requis").max(100),
});

export async function createRegion(formData: FormData) {
  await requireAdmin();

  const parsed = createRegionSchema.safeParse({ nom: formData.get("nom") });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  await prisma.region.create({
    data: { nom: parsed.data.nom },
  });

  revalidatePath("/admin/themes");
}
