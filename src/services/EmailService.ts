// FILE: src/services/EmailService.ts
import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com'; // [CHANGED] env-driven, default gmail
const SMTP_PORT = Number(process.env.SMTP_PORT || 587); // [CHANGED]
const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER; // [CHANGED]
const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS; // [CHANGED]
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER; // [ADDED]

if (!SMTP_USER || !SMTP_PASS) {
  console.error('[EmailService] Missing SMTP_USER/SMTP_PASS in env');
}

// Configure transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,                  // [FIX] was "gmail"
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,        // true for 465, false for 587/25
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  pool: true,                       // [ADDED]
  maxConnections: 5,
  maxMessages: 50,
  connectionTimeout: 15000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
} as any);

// Verify on module load (optional, but great for early failure)
transporter.verify().then(
  () => console.log('[EmailService] SMTP verified'),
  (err) => console.error('[EmailService] SMTP verify failed', {
    code: err?.code, command: err?.command, response: err?.response, message: err?.message,
  })
);

export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: `"Book Review App" <${FROM_EMAIL}>`,
      to,
      subject,
      text: body || ' ',
    });
    console.log(`[EmailService] Sent to ${to}`, {
      id: info?.messageId, accepted: info?.accepted, rejected: info?.rejected, response: info?.response,
    });
  } catch (err: any) {
    console.error('[EmailService] Failed to send email', {
      code: err?.code, command: err?.command, response: err?.response, message: err?.message, stack: err?.stack,
    });
    // rethrow a clean error if caller cares:
    // throw new Error(`EMAIL_SEND_FAILED: ${err?.message || 'unknown'}`);
  }
}
