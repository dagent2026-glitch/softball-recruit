import { NextResponse } from 'next/server';
import { getSessionAthleteId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';
import { generateOptimalSchedule, SchedulableCamp } from '@/lib/scheduler';

export async function POST() {
  try {
    const athleteId = await getSessionAthleteId();
    if (!athleteId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    await initDb();

    const athleteRows = await sql`SELECT target_schools FROM athletes WHERE id = ${athleteId}`;
    const targetSchools: string[] = JSON.parse(athleteRows[0]?.target_schools || '[]');
    if (targetSchools.length === 0) {
      return NextResponse.json({ error: 'Add target schools first — the schedule is built around your priority list.' }, { status: 400 });
    }

    const camps = await sql`SELECT id, school_name, start_date, end_date FROM camps` as unknown as SchedulableCamp[];
    const selectedIds = generateOptimalSchedule(camps, targetSchools);

    await sql`DELETE FROM schedule_entries WHERE athlete_id = ${athleteId}`;
    for (const campId of selectedIds) {
      await sql`INSERT INTO schedule_entries (athlete_id, camp_id) VALUES (${athleteId}, ${campId})`;
    }

    return NextResponse.json({ success: true, count: selectedIds.length });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
