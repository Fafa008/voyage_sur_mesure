"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const deleteRegionSchema = z.object({
  regionId: z.coerce.number().int().positive(),
});

export async function deleteRegion(formData: FormData) {
  await requireAdmin();

  const parsed = deleteRegionSchema.safeParse({ regionId: formData.get("regionId") });
  if (!parsed.success) {
    throw new Error("Données invalides");
  }

  const circuitCount = await prisma.circuit.count({
    where: { deletedAt: null, regionId: parsed.data.regionId },
  });

  if (circuitCount > 0) {
    throw new Error(
      `Impossible de supprimer : ${circuitCount} circuit(s) utilisent cette région.`
    );
  }

  await prisma.region.delete({
    where: { id: parsed.data.regionId },
  });

  revalidatePath("/admin/themes");
}
