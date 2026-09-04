import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
import { handlePasswordResetRequest } from '@/lib/password-reset';

// Kept as a separate endpoint (the /coach/forgot-password page still posts
// here) but delegates to the same shared lookup as the athlete-facing
// route, which checks both the athletes and coaches tables — see
// lib/password-reset.ts. Whichever page a user lands on, the right
// account gets the email.
export async function POST(request: Request) {
  try {
    await initDb();
    const body = await request.json();

    if (!body.email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const result = await handlePasswordResetRequest(body.email);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Coach password reset request error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
