import { NextRequest, NextResponse } from 'next/server';
import { getSessionAthleteId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';
import { generateOptimalSchedule, SchedulableCamp } from '@/lib/scheduler';

export async function POST(req: NextRequest) {
  try {
    const athleteId = await getSessionAthleteId();
    if (!athleteId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    await initDb();

    const body = await req.json().catch(() => ({}));
    const rangeStart: string | undefined = body?.rangeStart || undefined;
    const rangeEnd: string | undefined = body?.rangeEnd || undefined;
    if (rangeStart && rangeEnd && rangeEnd < rangeStart) {
      return NextResponse.json({ error: 'End date must be after start date.' }, { status: 400 });
    }

    const athleteRows = await sql`SELECT target_schools FROM athletes WHERE id = ${athleteId}`;
    const targetSchools: string[] = JSON.parse(athleteRows[0]?.target_schools || '[]');
    if (targetSchools.length === 0) {
      return NextResponse.json({ error: 'Add target schools first — the schedule is built around your priority list.' }, { status: 400 });
    }

    let camps = await sql`SELECT id, school_name, start_date, end_date FROM camps` as unknown as SchedulableCamp[];
    if (rangeStart) camps = camps.filter(c => c.start_date && c.start_date >= rangeStart);
    if (rangeEnd) camps = camps.filter(c => c.start_date && c.start_date <= rangeEnd);

    const selectedIds = generateOptimalSchedule(camps, targetSchools);

    await sql`DELETE FROM schedule_entries WHERE athlete_id = ${athleteId}`;
    for (const campId of selectedIds) {
      await sql`INSERT INTO schedule_entries (athlete_id, camp_id) VALUES (${athleteId}, ${campId})`;
    }

    return NextResponse.json({ success: true, count: selectedIds.length });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
