import { sql } from './db';
import crypto from 'crypto';
import { dispatcher } from './dispatcher';
import { normalizeEmail } from './auth';

// Shared by both /api/auth/request-password-reset and
// /api/coach/request-password-reset — checks the athletes table, then the
// coaches table, and resets/emails whichever one matches. This means either
// entry point (the athlete or the coach forgot-password page) works
// regardless of which account type the email actually belongs to, so a
// coach who lands on the athlete-facing page (or vice versa) still gets
// their reset email instead of a silent no-op.
const GENERIC_MESSAGE = 'If an account with that email exists, a password reset link has been sent.';

export async function handlePasswordResetRequest(rawEmail: string): Promise<{ message: string } | null> {
  const email = normalizeEmail(rawEmail);
  if (!email) return null;

  const athleteRows = await sql`SELECT id FROM athletes WHERE email = ${email}`;
  if (athleteRows[0]) {
    await sendResetEmail({
      table: 'athletes',
      userId: athleteRows[0].id,
      email,
      resetPath: '/reset-password',
      subject: 'RecruitRadar Password Reset',
      accountLabel: 'account',
    });
    return { message: GENERIC_MESSAGE };
  }

  const coachRows = await sql`SELECT id FROM coaches WHERE email = ${email}`;
  if (coachRows[0]) {
    await sendResetEmail({
      table: 'coaches',
      userId: coachRows[0].id,
      email,
      resetPath: '/coach/reset-password',
      subject: 'RecruitRadar Coach Password Reset',
      accountLabel: 'coach account',
    });
    return { message: GENERIC_MESSAGE };
  }

  // Neither table matched — don't reveal that, just return the same
  // generic message without sending anything.
  return { message: GENERIC_MESSAGE };
}

async function sendResetEmail(opts: {
  table: 'athletes' | 'coaches';
  userId: number;
  email: string;
  resetPath: string;
  subject: string;
  accountLabel: string;
}) {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour expiration

  if (opts.table === 'athletes') {
    await sql`
      UPDATE athletes
      SET reset_password_token = ${resetToken}, reset_password_expires_at = ${expiresAt.toISOString()}
      WHERE id = ${opts.userId}
    `;
  } else {
    await sql`
      UPDATE coaches
      SET reset_password_token = ${resetToken}, reset_password_expires_at = ${expiresAt.toISOString()}
      WHERE id = ${opts.userId}
    `;
  }

  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}${opts.resetPath}?token=${resetToken}`;

  const { data, error } = await dispatcher.resend.emails.send({
    from: 'RecruitRadar <alerts@recruitradar.co>',
    to: opts.email,
    subject: opts.subject,
    html: `<p>You requested a password reset for your RecruitRadar ${opts.accountLabel}.</p><p>Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 1 hour.</p><p>If you did not request this, please ignore this email.</p>`,
  });

  if (error) {
    console.error(`[password-reset:${opts.table}] Resend send failed:`, JSON.stringify(error));
  } else {
    console.log(`[password-reset:${opts.table}] Resend send succeeded, id:`, data?.id);
  }
}
