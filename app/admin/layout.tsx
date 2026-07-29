import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RoleNom } from "@prisma/client";
import LogoutButton from "@/components/auth/LogoutButton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Compass,
  Star,
  Tag,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";

export default async function AdminLayout({
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

  if (!user || !user.role || user.role.nom !== RoleNom.admin) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Main Layout avec Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <aside className="w-64 border-r border-border/40 p-4 hidden md:block shrink-0 sticky top-16 self-start max-h-[calc(100vh-5rem)] overflow-y-auto">
          <nav className="space-y-1 text-sm font-medium">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-primary/10 text-primary font-semibold transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Mes Devis
            </Link>

            <Link
              href="/admin/circuits"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Compass className="w-4 h-4" />
              Circuits & Voyage
            </Link>

            <Link
              href="/admin/utilisateurs"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Users className="w-4 h-4" />
              Utilisateurs
            </Link>

            <Link
              href="/admin/avis"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Star className="w-4 h-4" />
              Modération Avis
            </Link>

            <Link
              href="/admin/themes"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Tag className="w-4 h-4" />
              Thèmes & Régions
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
