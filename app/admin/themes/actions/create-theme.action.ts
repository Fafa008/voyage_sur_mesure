"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createThemeSchema = z.object({
  nom: z.string().trim().min(1, "Nom requis").max(100),
});

export async function createTheme(formData: FormData) {
  await requireAdmin();

  const parsed = createThemeSchema.safeParse({ nom: formData.get("nom") });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  await prisma.theme.create({
    data: { nom: parsed.data.nom },
  });

  revalidatePath("/admin/themes");
}
