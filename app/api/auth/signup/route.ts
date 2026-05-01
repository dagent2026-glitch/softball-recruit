import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { email, password, name } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email and password required' }, { status: 400 });
    }

    const existing = await sql`SELECT id FROM athletes WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hash = await hashPassword(password);
    const result = await sql`
      INSERT INTO athletes (email, password_hash, name, trial_started_at, trial_ends_at, subscription_status)
      VALUES (${email}, ${hash}, ${name}, NOW(), NOW() + INTERVAL '7 days', 'trialing')
      RETURNING id
    `;
    const athleteId = result[0].id;
    const token = await createToken(athleteId);
    const res = NextResponse.json({ success: true, athleteId });
    res.cookies.set(setAuthCookie(token));
    return res;
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
