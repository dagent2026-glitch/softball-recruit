import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

    const rows = await sql`SELECT * FROM athletes WHERE email = ${email}`;
    if (rows.length === 0) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const athlete = rows[0];
    const valid = await verifyPassword(password, athlete.password_hash);
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = await createToken(athlete.id);
    const res = NextResponse.json({ success: true, name: athlete.name });
    res.cookies.set(setAuthCookie(token));
    return res;
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
