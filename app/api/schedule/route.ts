import { NextResponse } from 'next/server';
import { getSessionAthleteId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';
import { campsOverlap } from '@/lib/scheduler';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const athleteId = await getSessionAthleteId();
    if (!athleteId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    await initDb();

    const athleteRows = await sql`SELECT target_schools FROM athletes WHERE id = ${athleteId}`;
    const targetSchools: string[] = JSON.parse(athleteRows[0]?.target_schools || '[]');
    const priorityIndex = new Map(targetSchools.map((s, i) => [s.toLowerCase(), i]));

    const rows = await sql`
      SELECT c.*
      FROM schedule_entries se
      JOIN camps c ON c.id = se.camp_id
      WHERE se.athlete_id = ${athleteId}
      ORDER BY c.start_date ASC
    ` as { id: number; school_name: string; start_date: string | null; end_date: string | null; [key: string]: unknown }[];

    const entries = rows.map(c => ({
      ...c,
      priority_rank: priorityIndex.has(c.school_name.toLowerCase()) ? priorityIndex.get(c.school_name.toLowerCase())! + 1 : null,
    }));

    // Flag any entries whose dates overlap another entry (can happen after manual adds)
    const conflicts = new Set<number>();
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        if (campsOverlap(entries[i], entries[j])) { conflicts.add(entries[i].id); conflicts.add(entries[j].id); }
      }
    }

    return NextResponse.json({
      schedule: entries.map(e => ({ ...e, has_conflict: conflicts.has(e.id) })),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[/api/schedule] error:', message);
    return NextResponse.json({ error: 'Server error', detail: message }, { status: 500 });
  }
}
