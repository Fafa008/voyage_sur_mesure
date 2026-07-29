"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const deleteSchema = z.object({
  avisId: z.coerce.number().int().positive(),
});

export async function deleteAvis(formData: FormData) {
  await requireAdmin();

  const parsed = deleteSchema.safeParse({ avisId: formData.get("avisId") });
  if (!parsed.success) {
    throw new Error("Données invalides");
  }

  await prisma.avis.delete({
    where: { id: parsed.data.avisId },
  });

  revalidatePath("/admin/avis");
}
