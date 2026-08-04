import { NextRequest, NextResponse } from 'next/server';
import { findAuthCookieName } from '@/lib/auth';

function clearSessionAndRedirect(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set(findAuthCookieName(), '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}

/** GET must not clear the session — Next.js Link prefetch would log users out. */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/', request.url));
}

export async function POST(request: NextRequest) {
  return clearSessionAndRedirect(request);
}
