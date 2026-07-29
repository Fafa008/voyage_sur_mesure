"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const deleteThemeSchema = z.object({
  themeId: z.coerce.number().int().positive(),
});

export async function deleteTheme(formData: FormData) {
  await requireAdmin();

  const parsed = deleteThemeSchema.safeParse({ themeId: formData.get("themeId") });
  if (!parsed.success) {
    throw new Error("Données invalides");
  }

  const circuitCount = await prisma.circuit.count({
    where: { themeId: parsed.data.themeId },
  });

  if (circuitCount > 0) {
    throw new Error(
      `Impossible de supprimer : ${circuitCount} circuit(s) utilisent ce thème.`
    );
  }

  await prisma.theme.delete({
    where: { id: parsed.data.themeId },
  });

  revalidatePath("/admin/themes");
}
