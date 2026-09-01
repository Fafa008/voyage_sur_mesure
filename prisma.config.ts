import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",

  datasource: {
    // DIRECT_URL = session pooler (port 5432) requis par Prisma CLI pour les migrations
    // (advisory locks, prepared statements). Sur Vercel, ce port est accessible.
    // DATABASE_URL = transaction pooler (port 6543) pour le runtime applicatif.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },

  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});