import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import { verifyPassword, createCoachToken, setCoachAuthCookie, normalizeEmail } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const body = await req.json();
    const { password } = body;
    const email = body.email ? normalizeEmail(body.email) : body.email;
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

    const rows = await sql`SELECT * FROM coaches WHERE email = ${email}`;
    if (rows.length === 0) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const coach = rows[0];
    const valid = await verifyPassword(password, coach.password_hash);
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = await createCoachToken(coach.id);
    const res = NextResponse.json({ success: true, name: coach.name });
    res.cookies.set(setCoachAuthCookie(token));
    return res;
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
