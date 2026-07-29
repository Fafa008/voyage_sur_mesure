import { cache } from "react";
import { prisma } from "./prisma";

export const getUnreadNotificationCount = cache(async (userId: string) => {
  return prisma.notification.count({
    where: { userId, lu: false },
  });
});
