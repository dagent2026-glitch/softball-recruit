import { NextResponse } from 'next/server';
import { getSessionAthleteId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export async function POST() {
  const athleteId = await getSessionAthleteId();
  if (!athleteId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  await initDb();
  const rows = await sql`SELECT stripe_customer_id FROM athletes WHERE id = ${athleteId}`;
  if (!rows.length || !rows[0].stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account' }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const session = await stripe.billingPortal.sessions.create({
    customer: rows[0].stripe_customer_id,
    return_url: `${baseUrl}/profile`,
  });

  return NextResponse.json({ url: session.url });
}
