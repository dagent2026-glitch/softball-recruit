import { NextRequest, NextResponse } from 'next/server';
import { getSessionCoachId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';
import { generateTeamCode } from '@/lib/codes';

export async function POST(req: NextRequest) {
  try {
    const coachId = await getSessionCoachId();
    if (!coachId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    await initDb();

    const { name } = await req.json();
    if (!name || !name.trim()) return NextResponse.json({ error: 'Team name is required' }, { status: 400 });

    let team = null;
    for (let attempt = 0; attempt < 5 && !team; attempt++) {
      const joinCode = generateTeamCode();
      const coachInviteCode = generateTeamCode();
      try {
        const rows = await sql`
          INSERT INTO teams (coach_id, name, join_code, coach_invite_code)
          VALUES (${coachId}, ${name.trim()}, ${joinCode}, ${coachInviteCode})
          RETURNING id, name, join_code, coach_invite_code, created_at
        `;
        team = rows[0];
      } catch {
        // join_code/coach_invite_code collision (unique constraint) — retry with new codes
      }
    }
    if (!team) return NextResponse.json({ error: 'Could not generate a unique join code, try again' }, { status: 500 });

    return NextResponse.json({ team: { ...team, member_count: 0, coach_count: 1, role: 'owner' } });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
