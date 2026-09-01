import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const adapter = new PrismaPg(
    {
      connectionString: process.env.DATABASE_URL!,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000,
      keepAlive: true,
    },
    {
      onPoolError: (err: Error) => {
        console.error("[prisma] Pool error:", err.message);
      },
    },
  );

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}