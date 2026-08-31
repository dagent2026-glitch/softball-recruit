import { NextRequest, NextResponse } from 'next/server';
import { getSessionAthleteId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const athleteId = await getSessionAthleteId();
    if (!athleteId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    await initDb();

    const { code } = await req.json();
    if (!code || !code.trim()) return NextResponse.json({ error: 'Join code is required' }, { status: 400 });

    const teamRows = await sql`SELECT id, name FROM teams WHERE join_code = ${code.trim().toUpperCase()}`;
    if (teamRows.length === 0) return NextResponse.json({ error: 'No team found with that code' }, { status: 404 });
    const team = teamRows[0];

    const existing = await sql`SELECT id FROM team_members WHERE team_id = ${team.id} AND athlete_id = ${athleteId}`;
    if (existing.length > 0) return NextResponse.json({ error: `You're already on ${team.name}` }, { status: 409 });

    await sql`INSERT INTO team_members (team_id, athlete_id) VALUES (${team.id}, ${athleteId})`;

    return NextResponse.json({ success: true, teamName: team.name });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
