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

    await sql`DELETE FROM schedule_entries WHERE athlete_id = ${athleteId} AND camp_id = ${campId}`;

    return NextResponse.json({ success: true });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
