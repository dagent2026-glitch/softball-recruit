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

    const rows = await sql`SELECT id, email FROM coaches WHERE email = ${email}`;
    const user = rows[0];

    if (!user) {
      // For security, don't reveal if the email doesn't exist.
      return NextResponse.json({ message: 'If a coach account with that email exists, a password reset link has been sent.' }, { status: 200 });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour expiration

    await sql`
      UPDATE coaches
      SET reset_password_token = ${resetToken},
          reset_password_expires_at = ${expiresAt.toISOString()}
      WHERE id = ${user.id}
    `;

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/coach/reset-password?token=${resetToken}`;

    const { data, error } = await dispatcher.resend.emails.send({
      from: 'RecruitRadar <alerts@recruitradar.co>',
      to: email,
      subject: 'RecruitRadar Coach Password Reset',
      html: `<p>You requested a password reset for your RecruitRadar coach account.</p><p>Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 1 hour.</p><p>If you did not request this, please ignore this email.</p>`,
    });
    if (error) {
      console.error('[coach/request-password-reset] Resend send failed:', JSON.stringify(error));
    } else {
      console.log('[coach/request-password-reset] Resend send succeeded, id:', data?.id);
    }

    return NextResponse.json({ message: 'If a coach account with that email exists, a password reset link has been sent.' }, { status: 200 });
  } catch (error) {
    console.error('Coach password reset request error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
