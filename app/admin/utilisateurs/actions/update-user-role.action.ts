"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateRoleSchema = z.object({
  userId: z.string().min(1),
  roleId: z.coerce.number().int().positive(),
});

export async function updateUserRole(formData: FormData) {
  const { user: admin } = await requireAdmin();

  const parsed = updateRoleSchema.safeParse({
    userId: formData.get("userId"),
    roleId: formData.get("roleId"),
  });

  if (!parsed.success) {
    throw new Error("Données invalides");
  }

  const { userId, roleId } = parsed.data;

  if (userId === admin.id) {
    throw new Error("Vous ne pouvez pas modifier votre propre rôle.");
  }

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    throw new Error("Rôle introuvable");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { roleId },
  });

  revalidatePath("/admin/utilisateurs");
}
