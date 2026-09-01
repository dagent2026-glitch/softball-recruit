import { NextResponse } from 'next/server';
import { getSessionAthleteId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';

export async function GET() {
  const athleteId = await getSessionAthleteId();
  if (!athleteId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  await initDb();

  const rows = await sql`SELECT * FROM athletes WHERE id = ${athleteId}`;
  if (rows.length === 0) return NextResponse.json([]);
  const athlete = rows[0];

  const targetSchools: string[] = JSON.parse(athlete.target_schools || '[]');

  const allCamps = await sql`SELECT * FROM camps ORDER BY start_date ASC`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matched = allCamps.filter((camp: any) =>
    targetSchools.some(s => s.toLowerCase() === camp.school_name.toLowerCase())
  );

  return NextResponse.json(matched);
}
