import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Email addresses are case-insensitive in practice everywhere that matters
// (every major provider treats "Foo@x.com" and "foo@x.com" as the same
// mailbox), but a raw SQL UNIQUE constraint on the column is not. Always
// normalize before checking uniqueness, looking up, or storing an email so
// the same person can't end up with two accounts by typing/autocapitalizing
// it differently across visits.
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(athleteId: number): Promise<string> {
  return new SignJWT({ sub: String(athleteId) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return parseInt(payload.sub as string);
  } catch {
    return null;
  }
}

export async function getSessionAthleteId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function setAuthCookie(token: string): { name: string; value: string; httpOnly: boolean; secure: boolean; sameSite: 'lax'; maxAge: number; path: string } {
  return {
    name: 'auth_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  };
}

// Coach auth is kept fully separate from athlete auth (own cookie, own token
// verifier) so a coach session never gets confused with an athlete session.
export async function createCoachToken(coachId: number): Promise<string> {
  return new SignJWT({ sub: String(coachId), typ: 'coach' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET);
}

export async function verifyCoachToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.typ !== 'coach') return null;
    return parseInt(payload.sub as string);
  } catch {
    return null;
  }
}

export async function getSessionCoachId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('coach_auth_token')?.value;
  if (!token) return null;
  return verifyCoachToken(token);
}

export function setCoachAuthCookie(token: string): { name: string; value: string; httpOnly: boolean; secure: boolean; sameSite: 'lax'; maxAge: number; path: string } {
  return {
    name: 'coach_auth_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  };
}

// Admin auth: a single shared password (ADMIN_PASSWORD) gates the /admin
// panel. On success we issue a normal session cookie/JWT rather than having
// the browser hold and resend the password itself, so the admin panel's
// client-side JS never contains a credential that devtools could read.
export async function createAdminToken(): Promise<string> {
  return new SignJWT({ sub: 'admin', typ: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(SECRET);
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.typ === 'admin';
  } catch {
    return false;
  }
}

export async function getSessionIsAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

export function setAdminAuthCookie(token: string): { name: string; value: string; httpOnly: boolean; secure: boolean; sameSite: 'lax'; maxAge: number; path: string } {
  return {
    name: 'admin_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 12, // 12 hours
    path: '/',
  };
}
