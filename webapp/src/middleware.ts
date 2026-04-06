import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookieName, verifySessionToken, type AuthRole } from '@/lib/session';

const protectedRoutes: Array<{ pattern: RegExp; roles: AuthRole[] }> = [
  { pattern: /^\/admin(?:\/.*)?$/, roles: ['admin'] },
  { pattern: /^\/doctor(?:\/.*)?$/, roles: ['doctor'] },
  { pattern: /^\/patient(?:\/.*)?$/, roles: ['patient', 'doctor', 'admin'] },
];

export default async function middleware(request: NextRequest) {
  const matchingRoute = protectedRoutes.find((route) => route.pattern.test(request.nextUrl.pathname));

  if (!matchingRoute) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(getSessionCookieName())?.value;
  const session = await verifySessionToken(sessionToken);

  if (!session) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('error', 'Please sign in to continue');
    return NextResponse.redirect(signInUrl);
  }

  if (!matchingRoute.roles.includes(session.role as AuthRole)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
