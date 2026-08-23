import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Compass className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Page non trouvée</CardTitle>
          <CardDescription>
            La page que vous recherchez n'existe pas ou a été déplacée.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 justify-center">
            <Link href="/">
              <Button variant="default">
                Retour à l'accueil
              </Button>
            </Link>
            <Link href="/circuits">
              <Button variant="outline">
                Voir les circuits
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
