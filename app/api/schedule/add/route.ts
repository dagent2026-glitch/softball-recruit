import { NextRequest, NextResponse } from 'next/server';
import { getSessionAthleteId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const athleteId = await getSessionAthleteId();
    if (!athleteId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    await initDb();

    const { campId } = await req.json();
    if (!campId) return NextResponse.json({ error: 'campId is required' }, { status: 400 });

    try {
      await sql`INSERT INTO schedule_entries (athlete_id, camp_id) VALUES (${athleteId}, ${campId})`;
    } catch {
      // already in schedule (unique constraint) — no-op
    }

    return NextResponse.json({ success: true });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
