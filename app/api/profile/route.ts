import { NextRequest, NextResponse } from 'next/server';
import { getSessionAthleteId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';

export async function PUT(req: NextRequest) {
  const athleteId = await getSessionAthleteId();
  if (!athleteId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    await initDb();
    const b = await req.json();
    await sql`UPDATE athletes SET
      name=${b.name}, phone=${b.phone||null},
      address=${b.address||null},
      address_street=${b.address_street||null},
      address_city=${b.address_city||null},
      address_state=${b.address_state||null},
      address_zip=${b.address_zip||null},
      birthdate=${b.birthdate||null},
      graduation_year=${b.graduation_year||null}, high_school=${b.high_school||null}, travel_team=${b.travel_team||null},
      is_pitcher=${b.is_pitcher?1:0}, is_catcher=${b.is_catcher?1:0}, primary_position=${b.primary_position||null},
      is_hitter=${b.is_hitter?1:0}, bats=${b.bats||'Right'},
      target_divisions=${JSON.stringify(b.target_divisions||[])},
      target_conferences=${JSON.stringify(b.target_conferences||[])},
      target_regions=${JSON.stringify(b.target_regions||[])},
      target_schools=${JSON.stringify(b.target_schools||[])},
      updated_at=NOW()
    WHERE id=${athleteId}`;
    return NextResponse.json({ success: true });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
