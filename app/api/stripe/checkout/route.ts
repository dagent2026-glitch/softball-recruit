import { NextRequest, NextResponse } from 'next/server';
import { getSessionAthleteId } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';
import { stripe, MONTHLY_PRICE_ID, ANNUAL_PRICE_ID } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const athleteId = await getSessionAthleteId();
  if (!athleteId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  await initDb();
  const rows = await sql`SELECT email, name, stripe_customer_id FROM athletes WHERE id = ${athleteId}`;
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { plan } = await req.json(); // 'monthly' | 'annual'
  const priceId = plan === 'annual' ? ANNUAL_PRICE_ID : MONTHLY_PRICE_ID;
  const athlete = rows[0];

  // Create or reuse Stripe customer
  let customerId = athlete.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: athlete.email, name: athlete.name });
    customerId = customer.id;
    await sql`UPDATE athletes SET stripe_customer_id = ${customerId} WHERE id = ${athleteId}`;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/profile?upgraded=1`,
    cancel_url: `${baseUrl}/pricing`,
    metadata: { athlete_id: String(athleteId) },
  });

  return NextResponse.json({ url: session.url });
}
