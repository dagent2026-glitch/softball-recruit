import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'softball-recruit-secret-change-in-prod-2026'
);

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
