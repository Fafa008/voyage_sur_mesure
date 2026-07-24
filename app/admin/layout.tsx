// app/admin/layout.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RoleNom } from "@prisma/client";
import LogoutButton from "@/components/auth/LogoutButton";
import Link from "next/link";

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

  // Vérifier que l'utilisateur est admin (roleId = 3)
  if (!user || !user.role || user.role.nom !== RoleNom.admin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-blue-600">
                ⚙️ Administration
              </span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                👤 {user.prenom} {user.name}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar pour admin (optionnel) */}
      <div className="flex">
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-4rem)] p-4 space-y-2">
          <nav className="space-y-1">
            <Link
              href="/admin/dashboard"
              className="block px-4 py-2 rounded-md bg-blue-50 text-blue-700 font-medium"
            >
              📊 Tableau de bord
            </Link>
            <Link
              href="/admin/utilisateurs"
              className="block px-4 py-2 rounded-md hover:bg-gray-100"
            >
              👥 Utilisateurs
            </Link>
            <Link
              href="/admin/circuits"
              className="block px-4 py-2 rounded-md hover:bg-gray-100"
            >
              🌍 Circuits
            </Link>
            <Link
              href="/admin/avis"
              className="block px-4 py-2 rounded-md hover:bg-gray-100"
            >
              ⭐ Avis
            </Link>
            <Link
              href="/admin/themes"
              className="block px-4 py-2 rounded-md hover:bg-gray-100"
            >
              🏷️ Thèmes & Régions
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
