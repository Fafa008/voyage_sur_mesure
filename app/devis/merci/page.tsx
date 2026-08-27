import Link from "next/link";
import { CheckCircle2, LayoutDashboard, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function MerciPage() {
  return (
    <main className="max-w-2xl mx-auto py-16 px-4">
      <Card className="rounded-xl overflow-hidden text-center p-8 sm:p-12 relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none -z-10" />
        <CardContent className="space-y-6 pt-2">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-inner">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Demande envoyée !
            </h1>
            <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
              Votre demande de devis a bien été enregistrée. Notre équipe de
              conseillers spécialistes étudie votre projet et vous recontactera
              dans les plus brefs délais.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "font-semibold"
              )}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Voir mes devis
            </Link>
            <Link
              href="/home"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <Home className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
