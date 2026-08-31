import { NextRequest, NextResponse } from 'next/server';
import { getSessionCoachId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const coachId = await getSessionCoachId();
    if (!coachId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    await initDb();

    const { code } = await req.json();
    if (!code || !code.trim()) return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });

    const normalizedCode = code.trim().toUpperCase();
    const teamRows = await sql`SELECT id, name, coach_id FROM teams WHERE coach_invite_code = ${normalizedCode}`;
    if (teamRows.length === 0) {
      // Common mix-up: entering the player join code here instead of the
      // coach invite code.
      const playerCodeMatch = await sql`SELECT id FROM teams WHERE join_code = ${normalizedCode}`;
      if (playerCodeMatch.length > 0) {
        return NextResponse.json({ error: "That's a player join code, not a coach invite code. Ask the head coach for the coach invite code instead." }, { status: 400 });
      }
      return NextResponse.json({ error: 'No team found with that invite code' }, { status: 404 });
    }
    const team = teamRows[0];

    if (team.coach_id === coachId) {
      return NextResponse.json({ error: `You already own ${team.name}` }, { status: 409 });
    }

    const existing = await sql`SELECT id FROM team_coaches WHERE team_id = ${team.id} AND coach_id = ${coachId}`;
    if (existing.length > 0) return NextResponse.json({ error: `You're already coaching ${team.name}` }, { status: 409 });

    await sql`INSERT INTO team_coaches (team_id, coach_id) VALUES (${team.id}, ${coachId})`;

    return NextResponse.json({ success: true, teamName: team.name });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
