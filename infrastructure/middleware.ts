// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes publiques (sans authentification)
const publicRoutes = [
  '/',
  '/circuits',
  '/circuits/(.*)',
  '/login',
  '/register',
  '/api/auth/(.*)',
];

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('better-auth.session-token')?.value;
  const { pathname } = request.nextUrl;

  // Vérifier si la route est publique
  const isPublic = publicRoutes.some((route) => {
    if (route.endsWith('/(.*)')) {
      const base = route.slice(0, -5);
      return pathname.startsWith(base);
    }
    return pathname === route || pathname.startsWith(route);
  });

  // Rediriger vers login si non authentifié et route privée
  if (!sessionCookie && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Rediriger vers dashboard si déjà connecté et sur login/register
  if (sessionCookie && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};