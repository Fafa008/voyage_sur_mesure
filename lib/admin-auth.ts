import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { RoleNom } from "@prisma/client";

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Non authentifié");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  if (!user?.role || user.role.nom !== RoleNom.admin) {
    throw new Error("Accès refusé");
  }

  return { session, user };
}
