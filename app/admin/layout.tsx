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
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">
                Administration
              </span>
            </Link>
            <Badge variant="destructive" className="text-xs uppercase font-semibold">
              Admin
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <UserIcon className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">
                {user.prenom || ""} {user.name}
              </span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Layout avec Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <aside className="w-64 border-r border-border/40 p-4 hidden md:block space-y-2 shrink-0">
          <nav className="space-y-1 text-sm font-medium">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-primary/10 text-primary font-semibold transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Tableau de bord
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
