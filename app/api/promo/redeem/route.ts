import { NextRequest, NextResponse } from 'next/server';
import { getSessionAthleteId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';
export async function POST(req: NextRequest) {
  try {
    const athleteId = await getSessionAthleteId();
    if (!athleteId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    await initDb();

    const { code } = await req.json();
    if (!code || !code.trim()) return NextResponse.json({ error: 'Promo code is required' }, { status: 400 });
    const normalizedCode = code.trim().toUpperCase();

    const athleteRows = await sql`SELECT subscription_status FROM athletes WHERE id = ${athleteId}`;
    // Only block redemption for accounts that are already active (paying or
    // previously comped) — being in the free trial shouldn't count, since
    // redeeming a code during the trial is the most common real use case.
    if (athleteRows[0]?.subscription_status === 'active') {
      return NextResponse.json({ error: 'You already have Pro access.' }, { status: 409 });
    }

    const promoRows = await sql`SELECT * FROM promo_codes WHERE code = ${normalizedCode}`;
    if (promoRows.length === 0) return NextResponse.json({ error: 'Invalid promo code.' }, { status: 404 });
    const promo = promoRows[0];

    if (!promo.active) return NextResponse.json({ error: 'This promo code is no longer active.' }, { status: 400 });
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This promo code has expired.' }, { status: 400 });
    }
    if (promo.max_redemptions !== null && promo.redemption_count >= promo.max_redemptions) {
      return NextResponse.json({ error: 'This promo code has reached its redemption limit.' }, { status: 400 });
    }

    await sql`UPDATE athletes SET subscription_status = 'active', promo_redeemed_code = ${normalizedCode} WHERE id = ${athleteId}`;
    await sql`UPDATE promo_codes SET redemption_count = redemption_count + 1 WHERE id = ${promo.id}`;

    return NextResponse.json({ success: true, description: promo.description });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
