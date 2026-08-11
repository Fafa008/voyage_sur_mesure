import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/home", "/circuits", "/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Laisse Better Auth et les webhooks de paiement passer sans interférence
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/payment/webhook")) {
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

  if (!sessionCookie && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionCookie && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
