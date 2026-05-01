import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { sql, initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature error:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  await initDb();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const athleteId = session.metadata?.athlete_id;
    const subscriptionId = session.subscription;
    if (athleteId && subscriptionId) {
      await sql`UPDATE athletes SET subscription_status = 'active', stripe_subscription_id = ${subscriptionId} WHERE id = ${athleteId}`;
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as any;
    const status =
      sub.status === 'active' ? 'active' :
      sub.status === 'past_due' ? 'past_due' :
      sub.status === 'canceled' ? 'cancelled' :
      sub.status;
    await sql`UPDATE athletes SET subscription_status = ${status} WHERE stripe_subscription_id = ${sub.id}`;
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as any;
    await sql`UPDATE athletes SET subscription_status = 'cancelled', stripe_subscription_id = NULL WHERE stripe_subscription_id = ${sub.id}`;
  }

  return NextResponse.json({ received: true });
}
