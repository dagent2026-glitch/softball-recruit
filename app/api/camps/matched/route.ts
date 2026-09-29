import { NextResponse } from 'next/server';
import { getSessionAthleteId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';
import { schoolNamesMatch } from '@/lib/schools';

export async function GET() {
  const athleteId = await getSessionAthleteId();
  if (!athleteId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  await initDb();

  const rows = await sql`SELECT * FROM athletes WHERE id = ${athleteId}`;
  if (rows.length === 0) return NextResponse.json([]);
  const athlete = rows[0];

  const targetSchools: string[] = JSON.parse(athlete.target_schools || '[]');

  const allCamps = await sql`SELECT * FROM camps ORDER BY start_date ASC`;

  // Same "don't bury upcoming camps behind expired ones" fix as /api/camps
  // -- see that route for the full rationale.
  const todayStr = new Date().toISOString().slice(0, 10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matched = allCamps.filter((camp: any) => {
    const relevant = camp.end_date || camp.start_date;
    if (relevant && relevant < todayStr) return false;
    return targetSchools.some(s => schoolNamesMatch(s, camp.school_name));
  });

  return NextResponse.json(matched);
}
