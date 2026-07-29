import { cache } from "react";
import { prisma } from "./prisma";

export const getUserFavoriteCircuitIds = cache(
  async (userId: string | null | undefined) => {
    if (!userId) return new Set<number>();

    const favoris = await prisma.favori.findMany({
      where: { userId },
      select: { circuitId: true },
    });

    return new Set(favoris.map((f) => f.circuitId));
  }
);
