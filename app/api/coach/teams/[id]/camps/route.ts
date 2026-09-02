import { NextRequest, NextResponse } from 'next/server';
import { getSessionCoachId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Camps matching any player's target schools across the whole roster, each
// labeled with which player(s) it's relevant to — a coach cares about camps
// relevant to any of their players, not just one.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const coachId = await getSessionCoachId();
    if (!coachId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    await initDb();

    const { id } = await params;
    const teamId = parseInt(id);
    if (!Number.isFinite(teamId)) return NextResponse.json({ error: 'Invalid team id' }, { status: 400 });

    const teamRows = await sql`SELECT id, coach_id FROM teams WHERE id = ${teamId}`;
    if (teamRows.length === 0) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    const team = teamRows[0];

    const isOwner = team.coach_id === coachId;
    const assistantRows = isOwner ? [] : await sql`SELECT id FROM team_coaches WHERE team_id = ${teamId} AND coach_id = ${coachId}`;
    if (!isOwner && assistantRows.length === 0) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const roster = await sql`
      SELECT a.id, a.name, a.target_schools
      FROM team_members tm
      JOIN athletes a ON a.id = tm.athlete_id
      WHERE tm.team_id = ${teamId}
    `;

    // schoolNameLower -> list of player names targeting that school
    const targetingPlayers = new Map<string, string[]>();
    for (const athlete of roster) {
      const targetSchools: string[] = JSON.parse(athlete.target_schools || '[]');
      for (const school of targetSchools) {
        const key = school.toLowerCase();
        if (!targetingPlayers.has(key)) targetingPlayers.set(key, []);
        targetingPlayers.get(key)!.push(athlete.name);
      }
    }

    if (targetingPlayers.size === 0) return NextResponse.json([]);

    const allCamps = await sql`SELECT * FROM camps ORDER BY start_date ASC`;
    const matched = allCamps
      .filter((camp: any) => targetingPlayers.has(camp.school_name.toLowerCase()))
      .map((camp: any) => ({
        ...camp,
        matched_players: targetingPlayers.get(camp.school_name.toLowerCase()),
      }));

    return NextResponse.json(matched);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[/api/coach/teams/[id]/camps] error:', message);
    return NextResponse.json({ error: 'Server error', detail: message }, { status: 500 });
  }
}
