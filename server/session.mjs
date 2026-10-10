import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'naoo_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;

function sign(value, secret) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

export function secureCompare(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function createSession(secret) {
  const payload = Buffer.from(
    JSON.stringify({ expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000 }),
  ).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

export function hasValidSession(cookieHeader, secret) {
  const cookie = cookieHeader
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  if (!cookie || !secret) return false;

  const [payload, signature] = cookie.split('.');
  if (!payload || !signature || !secureCompare(signature, sign(payload, secret))) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof session.expiresAt === 'number' && session.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function sessionCookie(token, secure) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DURATION_SECONDS}${secure ? '; Secure' : ''}`;
}

export function clearedSessionCookie(secure) {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`;
}
