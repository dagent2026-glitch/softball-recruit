import { NextResponse } from 'next/server';
import { getSessionAthleteId, getSessionIsAdmin } from '@/lib/auth';
import { getAthleteAlerts, checkAllAlerts } from '@/lib/alerts';
import { initDb } from '@/lib/db';

export async function GET() {
  const athleteId = await getSessionAthleteId();
  if (!athleteId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  await initDb();
  return NextResponse.json(await getAthleteAlerts(athleteId));
}

export async function POST() {
  if (!(await getSessionIsAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await initDb();
  const count = await checkAllAlerts();
  return NextResponse.json({ alerts_created: count });
}
