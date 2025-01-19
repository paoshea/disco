import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

let testAccount: nodemailer.TestAccount | null = null;

/**
 * Send an email using configured email service
 */
async function sendEmail(options: EmailOptions): Promise<void> {
  // For development, use Ethereal Email service if no SMTP credentials provided
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    if (!testAccount) {
      console.log('Creating test email account...');
      testAccount = await nodemailer.createTestAccount();
      console.log('Test email account created:', {
        user: testAccount.user,
        pass: testAccount.pass,
      });
    }
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || testAccount?.user,
      pass: process.env.SMTP_PASS || testAccount?.pass,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Disco" <noreply@disco.com>',
    ...options,
  });

  // Log email URL in development
  console.log('Message sent:', info.messageId);
  if (testAccount) {
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Reset Your Password',
    text: `Click the following link to reset your password: ${resetUrl}`,
    html: `
      <p>Hello,</p>
      <p>You requested to reset your password.</p>
      <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 24 hours.</p>
    `,
  });
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email',
    text: `Click the following link to verify your email: ${verifyUrl}`,
    html: `
      <p>Hello,</p>
      <p>Thank you for signing up! Please verify your email address.</p>
      <p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    `,
  });
}
