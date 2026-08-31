import { NextRequest, NextResponse } from 'next/server';
import { getSessionCoachId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L — avoids visual ambiguity

function generateJoinCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const coachId = await getSessionCoachId();
    if (!coachId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    await initDb();

    const { name } = await req.json();
    if (!name || !name.trim()) return NextResponse.json({ error: 'Team name is required' }, { status: 400 });

    let team = null;
    for (let attempt = 0; attempt < 5 && !team; attempt++) {
      const code = generateJoinCode();
      try {
        const rows = await sql`
          INSERT INTO teams (coach_id, name, join_code)
          VALUES (${coachId}, ${name.trim()}, ${code})
          RETURNING id, name, join_code, created_at
        `;
        team = rows[0];
      } catch {
        // join_code collision (unique constraint) — retry with a new code
      }
    }
    if (!team) return NextResponse.json({ error: 'Could not generate a unique join code, try again' }, { status: 500 });

    return NextResponse.json({ team: { ...team, member_count: 0 } });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
