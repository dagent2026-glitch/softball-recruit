import { NextRequest, NextResponse } from 'next/server';
import { getSessionAthleteId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const athleteId = await getSessionAthleteId();
    if (!athleteId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    await initDb();

    const { teamId } = await req.json();
    if (!teamId) return NextResponse.json({ error: 'teamId is required' }, { status: 400 });

    await sql`DELETE FROM team_members WHERE team_id = ${teamId} AND athlete_id = ${athleteId}`;

    return NextResponse.json({ success: true });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
