import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey !== 'slugger2026') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await initDb();
    const { id } = await params;
    const body = await req.json();

    // Build dynamic update — only update provided fields
    const allowed = ['school_name','camp_name','division','conference','region','state','city',
      'start_date','end_date','month','camp_type','cost','grad_years','position_focus',
      'registration_link','source','notes'];

    for (const field of allowed) {
      if (field in body) {
        // Update one field at a time (safe with tagged template)
        if (field === 'registration_link') {
          await sql`UPDATE camps SET registration_link=${body[field]}, last_updated=CURRENT_DATE WHERE id=${parseInt(id)}`;
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
