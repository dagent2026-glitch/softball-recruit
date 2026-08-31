import { NextResponse } from 'next/server';
import { getSessionAthleteId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const athleteId = await getSessionAthleteId();
    if (!athleteId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    await initDb();

    const teams = await sql`
      SELECT t.id, t.name, c.name AS coach_name, tm.joined_at
      FROM team_members tm
      JOIN teams t ON t.id = tm.team_id
      JOIN coaches c ON c.id = t.coach_id
      WHERE tm.athlete_id = ${athleteId}
      ORDER BY tm.joined_at DESC
    `;

    return NextResponse.json({ teams });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
