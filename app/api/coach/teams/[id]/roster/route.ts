import { NextRequest, NextResponse } from 'next/server';
import { getSessionCoachId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const coachId = await getSessionCoachId();
    if (!coachId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    await initDb();

    const { id } = await params;
    const teamId = parseInt(id);
    if (!Number.isFinite(teamId)) return NextResponse.json({ error: 'Invalid team id' }, { status: 400 });

    const teamRows = await sql`SELECT id, name, join_code, coach_invite_code, coach_id FROM teams WHERE id = ${teamId}`;
    if (teamRows.length === 0) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    const team = teamRows[0];

    const isOwner = team.coach_id === coachId;
    const assistantRows = isOwner ? [] : await sql`SELECT id FROM team_coaches WHERE team_id = ${teamId} AND coach_id = ${coachId}`;
    if (!isOwner && assistantRows.length === 0) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const athletes = await sql`
      SELECT a.id, a.name, a.graduation_year, a.primary_position, a.high_school, a.target_schools, tm.joined_at
      FROM team_members tm
      JOIN athletes a ON a.id = tm.athlete_id
      WHERE tm.team_id = ${teamId}
      ORDER BY a.name ASC
    `;

    const roster = athletes.map(a => ({
      id: a.id,
      name: a.name,
      graduation_year: a.graduation_year,
      primary_position: a.primary_position,
      high_school: a.high_school,
      joined_at: a.joined_at,
      target_schools: JSON.parse(a.target_schools || '[]'),
    }));

    const ownerRows = await sql`SELECT id, name FROM coaches WHERE id = ${team.coach_id}`;
    const assistantCoaches = await sql`
      SELECT c.id, c.name
      FROM team_coaches tc
      JOIN coaches c ON c.id = tc.coach_id
      WHERE tc.team_id = ${teamId}
      ORDER BY c.name ASC
    `;
    const coaches = [
      ...ownerRows.map(c => ({ id: c.id, name: c.name, role: 'owner' as const })),
      ...assistantCoaches.map(c => ({ id: c.id, name: c.name, role: 'assistant' as const })),
    ];

    return NextResponse.json({
      team: { id: team.id, name: team.name, join_code: team.join_code, coach_invite_code: team.coach_invite_code },
      role: isOwner ? 'owner' : 'assistant',
      coaches,
      roster,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[/api/coach/teams/[id]/roster] error:', message);
    return NextResponse.json({ error: 'Server error', detail: message }, { status: 500 });
  }
}
