// auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password) => bcrypt.hash(password, 10),
      verify: async ({ hash, password }) => bcrypt.compare(password, hash),
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  trustedOrigins: [process.env.NEXTAUTH_URL || "http://localhost:3000"],

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const clientRole = await prisma.role.findFirst({ where: { nom: "client" } });
          if (!clientRole) throw new Error("Rôle client introuvable. Veuillez exécuter le seed.");
          await prisma.user.update({
            where: { id: user.id },
            data: { roleId: clientRole.id },
          });
        },
      },
    },
  },
});