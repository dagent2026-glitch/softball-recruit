import { NextRequest, NextResponse } from 'next/server';
import { getSessionAthleteId, hashPassword } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';

export async function PUT(req: NextRequest) {
  const athleteId = await getSessionAthleteId();
  if (!athleteId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  
  try {
    await initDb();
    const { email, password } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if email belongs to someone else
    const existing = await sql`SELECT id FROM athletes WHERE email = ${email} AND id != ${athleteId}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    if (password && password.length >= 6) {
      const hashed = await hashPassword(password);
      await sql`UPDATE athletes SET email = ${email}, password_hash = ${hashed}, updated_at = NOW() WHERE id = ${athleteId}`;
    } else {
      await sql`UPDATE athletes SET email = ${email}, updated_at = NOW() WHERE id = ${athleteId}`;
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
