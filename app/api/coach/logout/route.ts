import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set({ name: 'coach_auth_token', value: '', maxAge: 0, path: '/' });
  return res;
}
