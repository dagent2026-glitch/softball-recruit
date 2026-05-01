import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil' as any,
});

export const MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID!;
export const ANNUAL_PRICE_ID = process.env.STRIPE_ANNUAL_PRICE_ID!;
