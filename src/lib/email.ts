interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send an email using configured email service
 */
async function sendEmail(options: EmailOptions): Promise<void> {
  // Implementation depends on your email service choice
  // For example, using nodemailer with SMTP:
  // const transporter = nodemailer.createTransport({...});
  // await transporter.sendMail({...options});
  throw new Error('Email service implementation required');
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  
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
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  
  await sendEmail({
    to: email,
    subject: 'Verify Your Email',
    text: `Click the following link to verify your email: ${verifyUrl}`,
    html: `
      <p>Hello,</p>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify Email</a></p>
      <p>If you didn't create an account, please ignore this email.</p>
    `,
  });
}
