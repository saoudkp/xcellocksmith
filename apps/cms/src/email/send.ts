/**
 * Resend API wrapper for sending transactional emails.
 * Errors are logged and swallowed — email failures never break parent operations.
 */

import { Resend } from 'resend';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

const FROM_ADDRESS = 'Xcel Locksmith <noreply@xcel-locksmith.com>';

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[email] RESEND_API_KEY is not set — skipping email send');
      return;
    }

    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('[email] Failed to send email:', {
      to,
      subject,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
