import { transporter } from './transporter';
import { getPasswordResetEmailTemplate, getVerificationEmailTemplate } from './templates';

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@disco.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

if (!APP_URL) {
  throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set');
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  const template = getPasswordResetEmailTemplate(resetUrl);

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;
  const template = getVerificationEmailTemplate(verifyUrl);

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });
}
