export type AuthRole = 'patient' | 'doctor' | 'admin';

export type SessionPayload = {
  sub: number;
  email: string;
  name: string;
  role: AuthRole;
  iat: number;
  exp: number;
};

const AUTH_SECRET = process.env.AUTH_SECRET ?? 'dev-auth-secret-change-me';

function base64UrlToUint8Array(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binaryString = atob(padded);
  const result = new Uint8Array(binaryString.length);

  for (let index = 0; index < binaryString.length; index += 1) {
    result[index] = binaryString.charCodeAt(index);
  }

  return result;
}

async function createSignature(payloadText: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(AUTH_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadText));
  return btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) {
    return null;
  }

  const [payloadText, signature] = token.split('.');

  if (!payloadText || !signature) {
    return null;
  }

  const expectedSignature = await createSignature(payloadText);

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(payloadText))) as SessionPayload;

    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getSessionCookieName() {
  return 'mediq_session';
}
