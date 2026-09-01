import { NextRequest, NextResponse } from 'next/server';
import { createAdminToken, setAdminAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Admin login is not configured' }, { status: 500 });
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  const token = await createAdminToken();
  const res = NextResponse.json({ success: true });
  res.cookies.set(setAdminAuthCookie(token));
  return res;
}
