import { transporter } from './transporter';
import {
  getPasswordResetEmailTemplate,
  getVerificationEmailTemplate,
} from './templates';

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@disco.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

if (process.env.NODE_ENV === 'production' && !APP_URL) {
  throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set');
}

const getBaseUrl = () => {
  if (!APP_URL) {
    return 'http://localhost:3000';
  }
  return APP_URL;
};

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;
  const template = getPasswordResetEmailTemplate(resetUrl);

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verifyUrl = `${getBaseUrl()}/verify-email?token=${token}`;
  const template = getVerificationEmailTemplate(verifyUrl);

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });
}
