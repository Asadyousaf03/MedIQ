import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, ensureAuthSchema, findUserByEmail, getSessionCookieOptions, verifyPassword, findAuthCookieName } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return NextResponse.redirect(new URL('/sign-in?error=Email%20and%20password%20are%20required', request.url));
  }

  await ensureAuthSchema();

  const user = await findUserByEmail(email);

  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.redirect(new URL('/sign-in?error=Invalid%20email%20or%20password', request.url));
  }

  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set(findAuthCookieName(), createSessionToken(user), getSessionCookieOptions());
  return response;
}
