// components/layout/Header.tsx
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard, FileText } from "lucide-react";
import LoginButton from "@/components/auth/LoginButton";
import LogoutButton from "@/components/auth/LogoutButton";
import { RoleNom } from "@prisma/client";

export default async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Extraction des infos utilisateur
  const user = session?.user;
  const sessionUser = user as
    | (typeof user extends undefined ? never : typeof user)
    | undefined;
  const roleNom = (sessionUser as { role?: { nom?: RoleNom } } | undefined)
    ?.role?.nom;
  const userName = user?.name ?? "Utilisateur";
  const userEmail = user?.email ?? "";

  // Détermination des rôles à partir de la session authentifiée
  const isConseiller = roleNom === RoleNom.conseiller;

  // Récupération des initiales pour l'avatar
  const getInitials = (name?: string) => {
    const parts = name?.split(" ") || [];
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name?.substring(0, 2).toUpperCase() || "??";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 text-2xl font-bold text-primary"
        >
          <span>🌍</span>
          <span>Mon Voyage</span>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/home"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Circuits
          </Link>
          {session && (
            <Link
              href="/devis/nouveau"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Demander un devis
            </Link>
          )}
          {isConseiller && (
            <Link
              href="/conseiller/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              📋 Espace Conseiller
            </Link>
          )}
        </nav>

        {/* Actions utilisateur */}
        <div className="flex items-center gap-4">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full focus:outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Tableau de bord
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/devis/historique" className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    Mes devis
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/dashboard" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogoutButton className="w-full justify-start text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </LogoutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </header>
  );
}
