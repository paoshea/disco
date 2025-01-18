const nodemailer = require('nodemailer');

let transporter;

if (process.env.NODE_ENV === 'production') {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    throw new Error('Email configuration is missing. Please set SMTP_* environment variables.');
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
} else {
  // For development, use Ethereal Email (fake SMTP service)
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'demo@ethereal.email',
      pass: 'demo123',
    },
  });
}

module.exports = { transporter };
