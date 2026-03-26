import { NextResponse } from 'next/server';
import { getSessionAthleteId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const athleteId = await getSessionAthleteId();
  if (!athleteId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  await initDb();
  const rows = await sql`SELECT id, email, name, phone, address, address_street, address_city, address_state, address_zip, birthdate, graduation_year, high_school, travel_team, is_pitcher, is_catcher, primary_position, is_hitter, bats, target_divisions, target_conferences, target_regions, target_schools FROM athletes WHERE id = ${athleteId}`;
  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}
