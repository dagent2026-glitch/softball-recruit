import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import { checkAlertsForCamp } from '@/lib/alerts';

export async function GET(req: NextRequest) {
  await initDb();
  const { searchParams } = new URL(req.url);
  const region = searchParams.get('region');
  const division = searchParams.get('division');
  const month = searchParams.get('month');
  const type = searchParams.get('type');

  let camps;
  if (region && division && month && type) {
    camps = await sql`SELECT * FROM camps WHERE region=${region} AND division=${division} AND month=${month} AND camp_type=${type} ORDER BY start_date ASC`;
  } else if (region && division && month) {
    camps = await sql`SELECT * FROM camps WHERE region=${region} AND division=${division} AND month=${month} ORDER BY start_date ASC`;
  } else if (region && division) {
    camps = await sql`SELECT * FROM camps WHERE region=${region} AND division=${division} ORDER BY start_date ASC`;
  } else if (region) {
    camps = await sql`SELECT * FROM camps WHERE region=${region} ORDER BY start_date ASC`;
  } else if (division) {
    camps = await sql`SELECT * FROM camps WHERE division=${division} ORDER BY start_date ASC`;
  } else if (month) {
    camps = await sql`SELECT * FROM camps WHERE month=${month} ORDER BY start_date ASC`;
  } else if (type) {
    camps = await sql`SELECT * FROM camps WHERE camp_type=${type} ORDER BY start_date ASC`;
  } else {
    camps = await sql`SELECT * FROM camps ORDER BY start_date ASC`;
  }

  return NextResponse.json(camps);
}

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey !== 'slugger2026') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
