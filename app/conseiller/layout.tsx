import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RoleNom } from "@prisma/client";
import LogoutButton from "@/components/auth/LogoutButton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Compass, User as UserIcon, LayoutDashboard, FileCheck } from "lucide-react";

export default async function ConseillerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  const roleNom = user?.role?.nom;

  if (
    !user ||
    !roleNom ||
    (roleNom !== RoleNom.conseiller && roleNom !== RoleNom.admin)
  ) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/conseiller/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">
                Espace Conseiller
              </span>
            </Link>
            <Badge variant="secondary" className="text-xs uppercase font-semibold">
              {roleNom}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <UserIcon className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">
                {user.prenom} {user.name}
              </span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
