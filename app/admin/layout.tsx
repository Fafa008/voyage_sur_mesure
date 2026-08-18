import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RoleNom } from "@prisma/client";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ShieldCheck } from "lucide-react";

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
      {/* Mobile Back-office Bar */}
      <div className="md:hidden border-b border-border/50 bg-background/80 backdrop-blur px-4 py-3 flex items-center justify-between sticky top-16 z-40">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">Administration</span>
        </div>
        <Sheet>
          <SheetTrigger render={
            <Button variant="ghost" size="sm" className="gap-2">
              <Menu className="w-5 h-5" />
              <span>Menu</span>
            </Button>
          } />
          <SheetContent side="left" className="w-64 p-4">
            <SheetHeader className="pb-4 border-b">
              <SheetTitle className="text-left text-base">Administration</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <AdminSidebarNav />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Layout avec Sidebar Desktop */}
      <div className="flex-1 max-w-7xl w-full h-full mx-auto flex">
        <aside className="w-60 border-r border-border/50 p-4 hidden md:block shrink-0 sticky top-16 self-start max-h-[calc(100vh-4rem)] overflow-y-auto">
          <AdminSidebarNav />
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
