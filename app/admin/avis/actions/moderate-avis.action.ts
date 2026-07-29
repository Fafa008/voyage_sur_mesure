"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const moderateSchema = z.object({
  avisId: z.coerce.number().int().positive(),
});

export async function approveAvis(formData: FormData) {
  await requireAdmin();

  const parsed = moderateSchema.safeParse({ avisId: formData.get("avisId") });
  if (!parsed.success) {
    throw new Error("Données invalides");
  }

  await prisma.avis.update({
    where: { id: parsed.data.avisId },
    data: { estModere: true },
  });

  revalidatePath("/admin/avis");
}
