import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Routes publiques accessibles sans session.
const PUBLIC_PATHS = ["/", "/home", "/circuits", "/login", "/register", "/contact"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes API et webhooks autonomes (Better Auth, Webhooks paiement, upload)
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/payment/webhook") ||
    pathname.startsWith("/api/upload")
  ) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Valider la session via Better Auth au lieu de vérifier seulement le cookie
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Si l'utilisateur n'est pas connecté et tente d'accéder à une route privée
  if (!session && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si l'utilisateur est déjà connecté et tente d'accéder aux pages de login/register
  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
