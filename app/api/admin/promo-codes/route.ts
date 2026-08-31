import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';

function checkAdmin(req: NextRequest) {
  return req.headers.get('x-admin-key') === 'slugger2026';
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await initDb();
  const codes = await sql`SELECT * FROM promo_codes ORDER BY created_at DESC`;
  return NextResponse.json(codes);
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await initDb();

  const body = await req.json();
  const code = (body.code || '').trim().toUpperCase();
  if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 });
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
    return NextResponse.json({ error: 'Code must be 3-32 characters: letters, numbers, hyphens, underscores' }, { status: 400 });
  }

  const existing = await sql`SELECT id FROM promo_codes WHERE code = ${code}`;
  if (existing.length > 0) return NextResponse.json({ error: 'That code already exists' }, { status: 409 });

  const maxRedemptions = body.max_redemptions ? parseInt(body.max_redemptions) : null;
  const expiresAt = body.expires_at || null;

  const result = await sql`
    INSERT INTO promo_codes (code, description, max_redemptions, expires_at)
    VALUES (${code}, ${body.description || null}, ${maxRedemptions}, ${expiresAt})
    RETURNING *
  `;
  return NextResponse.json(result[0]);
}

export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await initDb();

  const { id, active } = await req.json();
  if (!id || typeof active !== 'boolean') return NextResponse.json({ error: 'id and active are required' }, { status: 400 });

  await sql`UPDATE promo_codes SET active = ${active} WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
