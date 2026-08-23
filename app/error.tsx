"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Une erreur est survenue</CardTitle>
          <CardDescription>
            {error.message || "Une erreur inattendue s'est produite. Veuillez réessayer."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error.digest && (
            <p className="text-sm text-muted-foreground text-center">
              Code d'erreur: {error.digest}
            </p>
          )}
          <div className="flex gap-2 justify-center">
            <Button onClick={reset} variant="default">
              Réessayer
            </Button>
            <Button onClick={() => window.location.href = "/"} variant="outline">
              Accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
