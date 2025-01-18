export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export function getPasswordResetEmailTemplate(resetUrl: string): EmailTemplate {
  return {
    subject: 'Reset Your Password - Disco',
    text: `
      Hello,
      
      You requested to reset your password. Click the following link to reset your password:
      ${resetUrl}
      
      If you didn't request this, please ignore this email.
      This link will expire in 24 hours.
      
      Best regards,
      The Disco Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Reset Your Password</h2>
        <p>Hello,</p>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666;">If you didn't request this, please ignore this email.</p>
        <p style="color: #666;">This link will expire in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #666; font-size: 14px;">Best regards,<br>The Disco Team</p>
      </div>
    `,
  };
}

export function getVerificationEmailTemplate(verifyUrl: string): EmailTemplate {
  return {
    subject: 'Verify Your Email - Disco',
    text: `
      Welcome to Disco!
      
      Please verify your email address by clicking the following link:
      ${verifyUrl}
      
      If you didn't create an account, please ignore this email.
      
      Best regards,
      The Disco Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Disco!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="color: #666;">If you didn't create an account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #666; font-size: 14px;">Best regards,<br>The Disco Team</p>
      </div>
    `,
  };
}
