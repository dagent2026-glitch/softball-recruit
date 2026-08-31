import { NextRequest, NextResponse } from 'next/server';
import { getSessionCoachId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const coachId = await getSessionCoachId();
    if (!coachId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    await initDb();

    const { id } = await params;
    const teamId = parseInt(id);
    if (!Number.isFinite(teamId)) return NextResponse.json({ error: 'Invalid team id' }, { status: 400 });

    const teamRows = await sql`SELECT coach_id FROM teams WHERE id = ${teamId}`;
    if (teamRows.length === 0) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    if (teamRows[0].coach_id === coachId) {
      return NextResponse.json({ error: "Owners can't leave their own team" }, { status: 400 });
    }

    await sql`DELETE FROM team_coaches WHERE team_id = ${teamId} AND coach_id = ${coachId}`;

    return NextResponse.json({ success: true });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
