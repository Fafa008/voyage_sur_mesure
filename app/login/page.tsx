"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 px-4 py-10">
  {/* =====================================================
      BACKGROUND DECORATIF
      ===================================================== */}
  <div className="pointer-events-none absolute inset-0">
    {/* Grille */}
    <div
      className="absolute inset-0 opacity-30 dark:opacity-15"
      style={{
        backgroundImage: `
          linear-gradient(
            to right,
            color-mix(in srgb, var(--primary) 8%, transparent) 1px,
            transparent 1px
          ),
          linear-gradient(
            to bottom,
            color-mix(in srgb, var(--primary) 8%, transparent) 1px,
            transparent 1px
          )
        `,
        backgroundSize: "64px 64px",
      }}
    />

    {/* Halo principal */}
    <div className="absolute left-1/2 top-1/2 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

    {/* Petit halo supérieur */}
    <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

    {/* Petit halo inférieur */}
    <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
  </div>

  {/* =====================================================
      CARD
      ===================================================== */}
  <div className="relative z-10 w-full max-w-[430px]">
    <div
      className="
        relative overflow-hidden
        rounded-2xl
        border border-border/70
        bg-card/95
        shadow-[0_20px_60px_rgba(59,110,234,0.10)]
        backdrop-blur-xl
        dark:shadow-[0_20px_60px_rgba(0,0,0,0.30)]
      "
    >
      {/* =================================================
          CONTENT
          ================================================= */}
      <div className="relative px-8 py-8">

        {/* Logo */}
        <div className="mb-7 flex justify-center">
          <div className="relative">
            {/* Halo autour du logo */}
            <div className="absolute inset-0 scale-150 rounded-full bg-primary/10 blur-xl" />

            <img
              src="/Logo.svg"
              alt="Madaventure"
              className="relative h-11 w-auto object-contain"
            />
          </div>
        </div>

        {/* Titre */}
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bienvenue
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Connectez-vous pour continuer l&apos;aventure
          </p>
        </div>

        {/* =================================================
            FORM
            ================================================= */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Adresse email
            </label>

            <div className="group relative">
              <Mail
                className="
                  absolute left-3.5 top-1/2
                  h-4.5 w-4.5
                  -translate-y-1/2
                  text-muted-foreground
                  transition-colors
                  group-focus-within:text-primary
                "
              />

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                autoComplete="email"
                disabled={loading}
                required
                className="
                  h-11.5
                  w-full
                  rounded-lg
                  border border-input
                  bg-background
                  pl-11
                  pr-4
                  text-sm
                  text-foreground
                  outline-none
                  transition-all
                  placeholder:text-muted-foreground/60

                  focus:border-primary
                  focus:ring-4
                  focus:ring-primary/10

                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Mot de passe
              </label>

              <Link
                href="/forgot-password"
                className="
                  text-xs
                  font-medium
                  text-primary
                  transition-colors
                  hover:text-primary-hover
                "
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <div className="group relative">
              <Lock
                className="
                  absolute left-3.5 top-1/2
                  h-4.5 w-4.5
                  -translate-y-1/2
                  text-muted-foreground
                  transition-colors
                  group-focus-within:text-primary
                "
              />

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                autoComplete="current-password"
                disabled={loading}
                required
                className="
                  h-11.5
                  w-full
                  rounded-lg
                  border border-input
                  bg-background
                  pl-11
                  pr-11
                  text-sm
                  text-foreground
                  outline-none
                  transition-all
                  placeholder:text-muted-foreground/60

                  focus:border-primary
                  focus:ring-4
                  focus:ring-primary/10

                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
                className="
                  absolute right-3 top-1/2
                  -translate-y-1/2
                  rounded-md p-1
                  text-muted-foreground
                  transition-all
                  hover:bg-primary/10
                  hover:text-primary
                "
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
              <p>{error}</p>
            </div>
          )}

          {/* =================================================
              BOUTON LOGIN
              ================================================= */}
          <Button
            type="submit"
            disabled={loading}
            className="
              group relative
              h-11.5
              w-full
              overflow-hidden
              rounded-lg

              bg-blue-600
              text-primary

              text-sm
              font-semibold

              shadow-lg
              shadow-primary/20

              transition-all

              hover:-translate-y-0.5
              hover:bg-primary-hover
              hover:shadow-xl
              hover:shadow-primary/25

              active:translate-y-0
            "
          >
            {/* Effet lumineux */}
            <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />

            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LogIn className="h-4.5 w-4.5" />
                  Se connecter
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </span>
          </Button>
        </form>

        {/* =================================================
            SEPARATOR
            ================================================= */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />

          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            ou
          </span>

          <div className="h-px flex-1 bg-border" />
        </div>

        {/* =================================================
            GOOGLE
            ================================================= */}
        <button
          type="button"
          className="
            flex
            h-11.5
            w-full
            items-center
            justify-center
            gap-2.5
            rounded-lg

            border border-input
            bg-background

            text-sm
            font-medium
            text-foreground

            transition-all

            hover:border-primary/30
            hover:bg-primary/5
            hover:text-primary

            hover:shadow-sm
          "
        >
          <span className="text-base font-bold text-primary">G</span>

          Continuer avec Google
        </button>
      </div>

      {/* =================================================
          FOOTER
          ================================================= */}
      <div
        className="
          border-t border-border/60
          bg-muted/30
          px-8 py-4
          text-center
        "
      >
        <p className="text-sm text-muted-foreground">
          Pas encore inscrit ?{" "}
          <Link
            href="/register"
            className="
              font-semibold
              text-primary
              transition-colors
              hover:text-primary-hover
            "
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>

    {/* Security */}
    <div className="mt-5 flex items-center justify-center gap-2">
      <ShieldCheck className="h-4 w-4 text-emerald-500" />

      <span className="text-xs text-muted-foreground">
        Connexion sécurisée
      </span>
    </div>
  </div>
</main>
  );
}