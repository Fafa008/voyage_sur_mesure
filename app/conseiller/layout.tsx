import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RoleNom, StatutDevis } from "@prisma/client";
import { ConseillerSidebarNav } from "@/components/conseiller/ConseillerSidebarNav";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, UserCheck, Inbox } from "lucide-react";
import { Suspense } from "react";

async function SidebarNavWithCounts() {
  const [total, enCours, enModification, valide, refuse] = await Promise.all([
    prisma.devis.count(),
    prisma.devis.count({ where: { statut: StatutDevis.en_cours } }),
    prisma.devis.count({ where: { statut: StatutDevis.en_modification } }),
    prisma.devis.count({ where: { statut: StatutDevis.valide } }),
    prisma.devis.count({ where: { statut: StatutDevis.refuse } }),
  ]);

  return (
    <ConseillerSidebarNav
      counts={{ total, enCours, enModification, valide, refuse }}
    />
  );
}

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
      {/* Bar d'en-tête mobile conseiller */}
      <div className="md:hidden border-b border-border/50 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center justify-between sticky top-16 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Inbox className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">Espace Conseiller</span>
        </div>
        <Sheet>
          <SheetTrigger render={
            <Button variant="ghost" size="sm" className="gap-2">
              <Menu className="w-5 h-5" />
              <span>Menu</span>
            </Button>
          } />
          <SheetContent side="left" className="w-72 p-4">
            <SheetHeader className="pb-4 border-b">
              <SheetTitle className="text-left text-base">Espace Conseiller</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <Suspense fallback={<div className="h-40 animate-pulse bg-muted rounded-lg" />}>
                <SidebarNavWithCounts />
              </Suspense>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Layout principal avec Sidebar Desktop */}
      <div className="flex-1 max-w-[1440px] w-full h-full mx-auto flex">
        <aside className="w-64 border-r border-border/40 py-4 hidden md:block shrink-0 sticky top-16 self-start max-h-[calc(100vh-4rem)] overflow-y-auto">
          <Suspense fallback={<div className="h-60 animate-pulse bg-muted rounded-lg mx-4" />}>
            <SidebarNavWithCounts />
          </Suspense>
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
