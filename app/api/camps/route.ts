import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import { checkAlertsForCamp } from '@/lib/alerts';
import { getSessionIsAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  await initDb();
  const { searchParams } = new URL(req.url);
  const region = searchParams.get('region');
  const division = searchParams.get('division');
  const month = searchParams.get('month');
  // Camp type supports multiple selections (?type=Prospect&type=Elite),
  // so it's read with getAll rather than get.
  const types = searchParams.getAll('type');

  // The old version of this route branched into one hardcoded query per
  // filter combination it happened to anticipate, silently ignoring any
  // combination it didn't (e.g. division+month with no region). Filtering
  // in memory instead avoids that entirely -- the camps table is small
  // (barely 100 rows), so fetching it all and filtering here costs nothing.
  let camps = await sql`SELECT * FROM camps ORDER BY start_date ASC`;
  if (region) camps = camps.filter((c) => c.region === region);
  if (division) camps = camps.filter((c) => c.division === division);
  if (month) camps = camps.filter((c) => c.month === month);
  if (types.length > 0) camps = camps.filter((c) => types.includes(c.camp_type));

  return NextResponse.json(camps);
}

export async function POST(req: NextRequest) {
  if (!(await getSessionIsAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await initDb();
    const b = await req.json();
    const result = await sql`INSERT INTO camps (school_name, camp_name, division, conference, region, state, city, start_date, end_date, month, camp_type, cost, grad_years, position_focus, registration_link, source, notes)
      VALUES (${b.school_name},${b.camp_name},${b.division},${b.conference},${b.region},${b.state},${b.city},${b.start_date},${b.end_date},${b.month},${b.camp_type},${b.cost},${b.grad_years},${b.position_focus},${b.registration_link},${b.source},${b.notes||null})
      RETURNING id`;
    const campId = result[0].id;
    const alertCount = await checkAlertsForCamp(campId);
    return NextResponse.json({ success: true, campId, alertCount });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
