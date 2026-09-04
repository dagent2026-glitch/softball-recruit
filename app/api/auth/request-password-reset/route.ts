import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
import { handlePasswordResetRequest } from '@/lib/password-reset';

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
    console.error('Password reset request error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
