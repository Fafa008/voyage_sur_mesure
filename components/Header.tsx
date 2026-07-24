import Link from "next/link";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

import LoginButton from "@/components/auth/LoginButton";
import LogoutButton from "@/components/auth/LogoutButton";

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

import { FileText, LayoutDashboard, LogOut, User } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { RoleNom } from "@prisma/client";

export default async function Header() {
  // ============================
  // Session
  // ============================

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <GuestHeader />;
  }

  // ============================
  // Utilisateur connecté
  // ============================

  const dbUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      role: true,
    },
  });

  const role = dbUser?.role?.nom;

  const isAdmin = role === RoleNom.admin;
  const isConseiller = role === RoleNom.conseiller;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-5">
        {/* Logo */}

        <Link
          href="/"
          className="flex items-center gap-3 text-xl font-bold text-primary"
        >
          <img src="/Logo.jpeg" alt="Logo" className="h-9 w-10" />

          <span>Mon Voyage</span>
        </Link>

        {/* Navigation */}

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/home">Circuits</Link>

          <Link href="/devis/nouveau">Demander un devis</Link>

          {isConseiller && <Link href="/conseiller/dashboard">Conseiller</Link>}

          {isAdmin && <Link href="/admin/dashboard">Administration</Link>}
        </nav>

        <UserMenu name={session.user.name} email={session.user.email} />
      </div>
    </header>
  );
}

/* ===================================================== */
/*                  Header invité                         */
/* ===================================================== */

function GuestHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-5">
        <Link
          href="/"
          className="flex items-center gap-3 text-xl font-bold text-primary"
        >
          <img src="/Logo.png" alt="Logo" className="h-9 w-9 rounded-full" />

          <span>Mon Voyage</span>
        </Link>

        <nav className="hidden md:flex gap-6">
          <Link href="/home">Circuits</Link>
        </nav>

        <LoginButton />
      </div>
    </header>
  );
}

/* ===================================================== */
/*                  Menu utilisateur                      */
/* ===================================================== */

function UserMenu({ name, email }: { name: string; email: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer">
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-semibold">{name}</span>

              <span className="text-xs text-muted-foreground">{email}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Tableau de bord
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Link href="/devis/historique">
              <FileText className="mr-2 h-4 w-4" />
              Mes devis
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Link href="/dashboard">
              <User className="mr-2 h-4 w-4" />
              Mon profil
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <LogoutButton className="w-full justify-start text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </LogoutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ===================================================== */
/*                  Helpers                               */
/* ===================================================== */

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}
