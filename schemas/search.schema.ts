import { z } from "zod";

export const searchFiltersSchema = z.object({
  destination: z.string().optional().default(""),
  themeId: z
    .union([z.number(), z.string().transform((val) => (val ? Number(val) : null))])
    .nullable()
    .optional(),
  regionId: z
    .union([z.number(), z.string().transform((val) => (val ? Number(val) : null))])
    .nullable()
    .optional(),
  duration: z.string().nullable().optional(),
  maxBudget: z
    .union([z.number(), z.string().transform((val) => (val ? Number(val) : null))])
    .nullable()
    .optional(),
  travelers: z
    .union([z.number(), z.string().transform((val) => (val ? Number(val) : null))])
    .nullable()
    .optional(),
  sortBy: z
    .enum(["prix_asc", "prix_desc", "duree_asc", "duree_desc", "populaire"])
    .optional()
    .default("populaire"),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(12),
});

export type SearchFiltersSchemaInput = z.infer<typeof searchFiltersSchema>;
