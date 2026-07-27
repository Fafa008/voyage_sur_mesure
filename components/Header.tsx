// components/layout/Header.tsx

import Link from "next/link";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { RoleNom } from "@prisma/client";

import LoginButton from "@/components/auth/LoginButton";
import LogoutButton from "@/components/auth/LogoutButton";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // =============================
  // Utilisateur non connecté
  // =============================

  if (!session) {
    return (
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />

          <Navigation />

          <div className="flex items-center gap-3">
            <LoginButton />

            <Link
              href="/register"
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </header>
    );
  }

  // =============================
  // Utilisateur connecté
  // =============================

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      role: true,
    },
  });

  const role = user?.role?.nom;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />

        <Navigation />

        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-white">
              {getInitials(session.user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="hidden md:flex flex-col">
            <span className="font-semibold leading-none">
              {session.user.name}
            </span>

            <span className="text-xs text-muted-foreground">
              {session.user.email}
            </span>
          </div>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <Link href="/home" className="flex items-center gap-3">
      <img src="/Logo.jpeg" alt="Logo" className="h-10 w-10 object-contain" />

      <span className="text-2xl font-bold text-primary">Mon Voyage</span>
    </Link>
  );
}

function Navigation() {
  return (
    <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
      <Link href="/home" className="transition hover:text-primary">
        Accueil
      </Link>

      <Link href="/circuits" className="transition hover:text-primary">
        Circuits
      </Link>

      <Link href="/devis/nouveau" className="transition hover:text-primary">
        Demander un devis
      </Link>

      <Link href="/contact" className="transition hover:text-primary">
        Contact
      </Link>
    </nav>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}
