import { NextRequest, NextResponse } from 'next/server';
import { getSessionAthleteId, getSessionIsAdmin } from '@/lib/auth';
import { getAthleteAlerts, checkAllAlerts } from '@/lib/alerts';
import { initDb } from '@/lib/db';

export async function GET() {
  const athleteId = await getSessionAthleteId();
  if (!athleteId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  await initDb();
  return NextResponse.json(await getAthleteAlerts(athleteId));
}

// Two ways in: an authenticated admin browsing /admin (session cookie), or
// the weekly scraper's automated run calling this headlessly after it syncs
// new camps (a static shared secret, since it can't hold a login session).
export async function POST(req: NextRequest) {
  const isAdmin = await getSessionIsAdmin();
  const isCron = process.env.CRON_SECRET && req.headers.get('x-cron-secret') === process.env.CRON_SECRET;
  if (!isAdmin && !isCron) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await initDb();
  const count = await checkAllAlerts();
  return NextResponse.json({ alerts_created: count });
}
