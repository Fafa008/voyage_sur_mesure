import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Routes publiques accessibles sans session.
const PUBLIC_PATHS = ["/", "/home", "/circuits", "/login", "/register", "/contact"];

export async function middleware(request: NextRequest) {
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

  // Valider la session côté serveur (pas juste la présence du cookie)
  let session = null;
  if (sessionCookie) {
    try {
      session = await auth.api.getSession({
        headers: new Headers({ cookie: request.headers.get("cookie") || "" }),
      });
    } catch {
      session = null;
    }
  }

  // Pas de session valide et route non publique → connexion requise.
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Session valide → ne pas laisser revoir login/register.
  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Cookie stale/expiré sur login/register → on laisse passer (évite la boucle).
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
