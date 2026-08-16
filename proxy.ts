import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes publiques accessibles sans session.
const PUBLIC_PATHS = ["/", "/home", "/circuits", "/login", "/register", "/contact"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes qui gèrent leur propre authentification/autorisation :
  // - Better Auth (/api/auth)
  // - Webhooks de paiement (/api/payment/webhook/*) appelés par Papi/Binance
  //   côté serveur, sans cookie de session : il ne faut pas les rediriger.
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/payment/webhook")
  ) {
    return NextResponse.next();
  }

  const sessionCookie =
    request.cookies.get("better-auth.session_token")?.value ??
    request.cookies.get("__Secure-better-auth.session_token")?.value ??
    request.cookies.get("better-auth.session-token")?.value ??
    request.cookies.get("__Secure-better-auth.session-token")?.value;

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Pas de session et route non publique → connexion requise.
  if (!sessionCookie && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Déjà connecté → ne pas laisser revoir login/register.
  if (sessionCookie && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
