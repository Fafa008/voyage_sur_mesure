"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const notificationIdSchema = z.object({
  notificationId: z.coerce.number().int().positive(),
});

async function requireOwnerNotification(notificationId: number, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new Error("Notification introuvable");
  }
  if (notification.userId !== userId) {
    throw new Error("Accès refusé");
  }

  return notification;
}

export async function markNotificationRead(
  _prevState: unknown,
  formData: FormData
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Non authentifié" };
  }

  const parsed = notificationIdSchema.safeParse({
    notificationId: formData.get("notificationId"),
  });

  if (!parsed.success) {
    return { error: "Données invalides" };
  }

  try {
    await requireOwnerNotification(parsed.data.notificationId, session.user.id);

    await prisma.notification.update({
      where: { id: parsed.data.notificationId },
      data: { lu: true },
    });

    revalidatePath("/notifications");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Erreur inattendue",
    };
  }
}

export async function markAllNotificationsRead() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Non authentifié" };
  }

  await prisma.notification.updateMany({
    where: { userId: session.user.id, lu: false },
    data: { lu: true },
  });

  revalidatePath("/notifications");
  revalidatePath("/dashboard");

  return { success: true };
}
