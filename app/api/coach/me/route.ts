import { NextResponse } from 'next/server';
import { getSessionCoachId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const coachId = await getSessionCoachId();
    if (!coachId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    await initDb();

    const coachRows = await sql`SELECT id, email, name FROM coaches WHERE id = ${coachId}`;
    if (coachRows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const teams = await sql`
      SELECT t.id, t.name, t.join_code, t.created_at,
        (SELECT COUNT(*)::int FROM team_members tm WHERE tm.team_id = t.id) AS member_count
      FROM teams t
      WHERE t.coach_id = ${coachId}
      ORDER BY t.created_at DESC
    `;

    return NextResponse.json({ coach: coachRows[0], teams });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[/api/coach/me] error:', message);
    return NextResponse.json({ error: 'Server error', detail: message }, { status: 500 });
  }
}
