"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { searchFiltersSchema } from "@/schemas/search.schema";
import type {
  SearchFilters,
  SearchResult,
  SearchOptionsData,
  CircuitSearchResultItem,
} from "@/types/search";

export async function searchCircuitsAction(
  rawFilters: SearchFilters
): Promise<{ success: boolean; data?: SearchResult; error?: string }> {
  try {
    const validatedFilters = searchFiltersSchema.parse(rawFilters);

    const {
      destination,
      themeId,
      regionId,
      duration,
      maxBudget,
      travelers,
      sortBy,
      page = 1,
      limit = 12,
    } = validatedFilters;

    const where: Prisma.CircuitWhereInput = {
      deletedAt: null,
    };

    // 1. Text Search (Destination / Keywords)
    if (destination && destination.trim() !== "") {
      const term = destination.trim();
      where.OR = [
        { titre: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { region: { nom: { contains: term, mode: "insensitive" } } },
        {
          etapes: {
            some: {
              ville: { contains: term, mode: "insensitive" },
            },
          },
        },
      ];
    }

    // 2. Filter Theme
    if (themeId) {
      where.themeId = themeId;
    }

    // 3. Filter Region
    if (regionId) {
      where.regionId = regionId;
    }

    // 4. Filter Budget (max budget)
    if (maxBudget && maxBudget > 0) {
      where.prixEstime = {
        lte: new Prisma.Decimal(maxBudget),
      };
    }

    // 5. Filter Duration Range
    if (duration) {
      switch (duration) {
        case "3-5":
          where.dureeJours = { gte: 3, lte: 5 };
          break;
        case "5-8":
          where.dureeJours = { gte: 5, lte: 8 };
          break;
        case "8-15":
          where.dureeJours = { gte: 8, lte: 15 };
          break;
        case "15+":
          where.dureeJours = { gte: 15 };
          break;
        default:
          break;
      }
    }

    // 6. Filter Travelers (Places Disponibles)
    if (travelers && travelers > 0) {
      where.nbPlacesDisponibles = {
        gte: travelers,
      };
    }

    // 7. Order By
    let orderBy: Prisma.CircuitOrderByWithRelationInput = { id: "asc" };
    if (sortBy === "prix_asc") {
      orderBy = { prixEstime: "asc" };
    } else if (sortBy === "prix_desc") {
      orderBy = { prixEstime: "desc" };
    } else if (sortBy === "duree_asc") {
      orderBy = { dureeJours: "asc" };
    } else if (sortBy === "duree_desc") {
      orderBy = { dureeJours: "desc" };
    } else {
      orderBy = { id: "asc" };
    }

    // 8. Execute count & query
    const total = await prisma.circuit.count({ where });

    const skip = (page - 1) * limit;
    const rawCircuits = await prisma.circuit.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        region: { select: { id: true, nom: true } },
        theme: { select: { id: true, nom: true } },
        images: {
          select: { id: true, url: true, legende: true },
          take: 1,
          orderBy: { ordre: "asc" },
        },
      },
    });

    // 9. Serialize Decimal to string / number for React Client Components
    const circuits: CircuitSearchResultItem[] = rawCircuits.map((c) => ({
      id: c.id,
      titre: c.titre,
      slug: c.slug,
      description: c.description,
      dureeJours: c.dureeJours,
      prixEstime: c.prixEstime ? c.prixEstime.toString() : null,
      nbPlacesDisponibles: c.nbPlacesDisponibles,
      estGroupe: c.estGroupe,
      region: c.region,
      theme: c.theme,
      images: c.images,
    }));

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      success: true,
      data: {
        circuits,
        total,
        page,
        totalPages,
        limit,
      },
    };
  } catch {
    return {
      success: false,
      error: "Une erreur est survenue lors de la recherche des circuits.",
    };
  }
}

export async function getSearchOptionsAction(): Promise<{
  success: boolean;
  data?: SearchOptionsData;
  error?: string;
}> {
  try {
    const [themes, regions] = await Promise.all([
      prisma.theme.findMany({
        select: { id: true, nom: true },
        orderBy: { nom: "asc" },
      }),
      prisma.region.findMany({
        select: { id: true, nom: true },
        orderBy: { nom: "asc" },
      }),
    ]);

    const destinations = regions.map((r) => r.nom);

    return {
      success: true,
      data: {
        destinations,
        themes,
        regions,
      },
    };
  } catch {
    return {
      success: false,
      error: "Impossible de charger les options de filtre.",
    };
  }
}
