import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, ensureAuthSchema, findAuthCookieName, findUserByEmail, getSessionCookieOptions, hashPassword } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const fullName = String(formData.get('fullName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!fullName || !email || !password) {
    return NextResponse.redirect(new URL('/sign-up?error=All%20fields%20are%20required', request.url));
  }

  if (password.length < 8) {
    return NextResponse.redirect(new URL('/sign-up?error=Password%20must%20be%20at%20least%208%20characters', request.url));
  }

  await ensureAuthSchema();

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    return NextResponse.redirect(new URL('/sign-in?error=An%20account%20already%20exists%20for%20that%20email', request.url));
  }

  const passwordHash = hashPassword(password);
  const inserted = await query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, 'patient')
     RETURNING id, full_name, email, role, created_at`,
    [fullName, email.toLowerCase(), passwordHash],
  );

  const user = inserted.rows[0];
  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set(findAuthCookieName(), createSessionToken(user), getSessionCookieOptions());
  return response;
}
