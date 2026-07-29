import { cache } from "react";
import { prisma } from "./prisma";

/**
 * Request-level cache to fetch user role information.
 * Ensures the database is queried at most once per request lifecycle
 * even if multiple server components require user/role details.
 */
export const getCachedUserWithRole = cache(async (userId: string) => {
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
});
