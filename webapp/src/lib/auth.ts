import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import { getSessionCookieName, verifySessionToken as verifySessionTokenEdge } from '@/lib/session';

export type AuthRole = 'patient' | 'doctor' | 'admin';

export type AuthUser = {
  id: number;
  full_name: string;
  email: string;
  role: AuthRole;
  created_at: Date;
};

type StoredUser = AuthUser & {
  password_hash: string;
};

type SessionPayload = {
  sub: number;
  email: string;
  name: string;
  role: AuthRole;
  iat: number;
  exp: number;
};

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_ITERATIONS = 120000;
const PASSWORD_KEY_LENGTH = 32;
const PASSWORD_DIGEST = 'sha256';
const AUTH_SECRET = process.env.AUTH_SECRET ?? 'dev-auth-secret-change-me';

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
};

export async function ensureAuthSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role VARCHAR(32) NOT NULL DEFAULT 'patient',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('base64url');
  const hash = pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, PASSWORD_DIGEST).toString('base64url');
  return `${PASSWORD_ITERATIONS}.${salt}.${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [iterationsValue, salt, expectedHash] = storedHash.split('.');

  if (!iterationsValue || !salt || !expectedHash) {
    return false;
  }

  const actualHash = pbkdf2Sync(
    password,
    salt,
    Number(iterationsValue),
    PASSWORD_KEY_LENGTH,
    PASSWORD_DIGEST,
  ).toString('base64url');

  return timingSafeEqual(Buffer.from(actualHash), Buffer.from(expectedHash));
}

export function createSessionToken(user: Pick<AuthUser, 'id' | 'email' | 'full_name' | 'role'>) {
  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    name: user.full_name,
    role: user.role,
    iat: Date.now(),
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };

  const payloadText = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', AUTH_SECRET).update(payloadText).digest('base64url');

  return `${payloadText}.${signature}`;
}

export async function getSessionTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(getSessionCookieName())?.value ?? null;
}

export async function getSessionPayload() {
  return verifySessionTokenEdge(await getSessionTokenFromCookies());
}

export async function getCurrentUser() {
  const session = await getSessionPayload();

  if (!session) {
    return null;
  }

  return findUserById(session.sub);
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return user;
}

export async function requireRole(allowedRoles: AuthRole[]) {
  const user = await requireCurrentUser();

  if (!allowedRoles.includes(user.role)) {
    redirect('/');
  }

  return user;
}

export function findAuthCookieName() {
  return getSessionCookieName();
}

export function getSessionCookieOptions() {
  return SESSION_COOKIE_OPTIONS;
}

export async function findUserByEmail(email: string) {
  await ensureAuthSchema();

  const result = await query(
    `SELECT id, full_name, email, role, created_at, password_hash
     FROM users
     WHERE lower(email) = lower($1)
     LIMIT 1`,
    [email],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as StoredUser;
}

export async function findUserById(id: number) {
  await ensureAuthSchema();

  const result = await query(
    `SELECT id, full_name, email, role, created_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as AuthUser;
}
