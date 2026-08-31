import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import { hashPassword, createCoachToken, setCoachAuthCookie, normalizeEmail } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const body = await req.json();
    const { password, name } = body;
    const email = body.email ? normalizeEmail(body.email) : body.email;
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email and password required' }, { status: 400 });
    }

    const existing = await sql`SELECT id FROM coaches WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hash = await hashPassword(password);
    const result = await sql`
      INSERT INTO coaches (email, password_hash, name)
      VALUES (${email}, ${hash}, ${name})
      RETURNING id
    `;
    const coachId = result[0].id;
    const token = await createCoachToken(coachId);
    const res = NextResponse.json({ success: true, coachId });
    res.cookies.set(setCoachAuthCookie(token));
    return res;
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
