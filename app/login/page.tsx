"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  LogIn,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { RoleNom } from "@prisma/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Erreur de connexion");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/auth/user-role");

      if (!response.ok) {
        setError("Erreur lors de la récupération du rôle");
        setLoading(false);
        return;
      }

      const { role } = await response.json();

      if (role === RoleNom.admin) {
        router.push("/admin/dashboard");
      } else if (role === RoleNom.conseiller) {
        router.push("/conseiller/dashboard");
      } else {
        router.push("/dashboard");
      }

      router.refresh();
    } catch {
      setError(
        "Une erreur est survenue. Vérifiez votre connexion et réessayez.",
      );
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/5 px-4 py-12">
      {/* Pattern décoratif */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border/40"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="w-full max-w-md animate-fadeIn">
        <Card className="relative overflow-hidden border-border/40 bg-background/70 shadow-2xl backdrop-blur-xl dark:bg-background/70">
          {/* Bandeau lumineux */}
          <div className="absolute -left-1/2 -top-1/2 h-48 w-full rotate-[-20deg] bg-gradient-to-r from-primary/10 via-primary/5 to-transparent blur-3xl" />

          <CardContent className="relative p-8">
            {/* Logo - inchangé */}
            <div className="mb-8 text-center">
              <div className="mb-6 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Logo.svg"
                  alt="Madaventure"
                  className="h-12 w-auto object-contain"
                />
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Bienvenue
              </h1>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                Connectez-vous pour continuer l&apos;aventure
              </p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors peer-focus:text-primary" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@exemple.com"
                    autoComplete="email"
                    disabled={loading}
                    className="peer h-12 w-full rounded-xl border-2 border-input bg-background/50 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/20 dark:bg-background/50"
                    required
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    Mot de passe
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-primary transition hover:text-primary/80"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors peer-focus:text-primary" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    autoComplete="current-password"
                    disabled={loading}
                    className="peer h-12 w-full rounded-xl border-2 border-input bg-background/50 pl-12 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/20 dark:bg-background/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive backdrop-blur-sm">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-destructive" />
                  <p className="leading-6">{error}</p>
                </div>
              )}

              {/* Bouton de connexion */}
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 active:translate-y-0"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Connexion en cours…
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      Se connecter
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </Button>
            </form>

            {/* Séparateur */}
            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                ou
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            {/* Créer un compte */}
            <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-center backdrop-blur-sm">
              <p className="text-sm text-muted-foreground">
                Pas encore inscrit ?
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-1 text-sm font-bold text-primary transition hover:text-primary/80"
              >
                Créer un compte gratuitement
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Sécurité */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Connexion sécurisée</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
