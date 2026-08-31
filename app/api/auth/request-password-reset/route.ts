import { NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';
import crypto from 'crypto';
import { dispatcher } from '@/lib/dispatcher';

export async function POST(request: Request) {
  try {
    await initDb();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const rows = await sql`SELECT id, email FROM athletes WHERE email = ${email}`;
    const user = rows[0];

    if (!user) {
      // For security, don't reveal if the email doesn't exist.
      // Always return a success message even if no email is found.
      return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' }, { status: 200 });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    // Store the raw token in the database for direct comparison
    // Ensure this token is sufficiently long and random
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour expiration

    await sql`
      UPDATE athletes
      SET reset_password_token = ${resetToken},
          reset_password_expires_at = ${expiresAt.toISOString()}
      WHERE id = ${user.id}
    `;

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

    await dispatcher.resend.emails.send({
      from: 'RecruitRadar <alerts@recruitradar.co>',
      to: email,
      subject: 'RecruitRadar Password Reset',
      html: `<p>You requested a password reset for your RecruitRadar account.</p><p>Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 1 hour.</p><p>If you did not request this, please ignore this email.</p>`,
    });

    return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' }, { status: 200 });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
