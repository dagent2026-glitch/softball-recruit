import { NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await initDb();
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 });
    }

    // Find user by reset token and check expiration
    const rows = await sql`
      SELECT id, reset_password_expires_at
      FROM athletes
      WHERE reset_password_token = ${token}
    `;
    const user = rows[0];

    if (!user || new Date(user.reset_password_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired password reset token.' }, { status: 400 });
    }

    // Hash new password and update user
    const hashedPassword = await hashPassword(newPassword);

    await sql`
      UPDATE athletes
      SET password_hash = ${hashedPassword},
          reset_password_token = NULL,
          reset_password_expires_at = NULL
      WHERE id = ${user.id}
    `;

    return NextResponse.json({ message: 'Password has been reset successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Password reset submission error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
