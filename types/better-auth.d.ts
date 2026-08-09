import type { RoleNom } from "@prisma/client";

declare module "better-auth" {
  interface User {
    roleId?: number | null;
    role?: {
      id: number;
      nom: RoleNom;
    } | null;
  }
}
