import 'dotenv/config';
import nodemailer from 'nodemailer';

type RequiredEnv = 'SMTP_HOST' | 'SMTP_PORT' | 'SMTP_USER' | 'SMTP_PASS' | 'FROM_EMAIL';
const REQUIRED: RequiredEnv[] = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'];

function requireEnv() {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error('❌ Missing required env vars:', missing.join(', '));
    console.error('   Tip: check your .env values match your .env.example');
    process.exit(2);
  }
}

async function main() {
  requireEnv();

  const SMTP_HOST = process.env.SMTP_HOST!;
  const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
  const SMTP_USER = process.env.SMTP_USER!;
  const SMTP_PASS = process.env.SMTP_PASS!;
  const FROM_EMAIL = process.env.FROM_EMAIL!;
  const TO = process.argv[2] || process.env.TEST_TO_EMAIL || SMTP_USER; // recipient

  console.log('🔧 Using SMTP config:');
  console.table({
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    FROM_EMAIL,
    TO,
    SECURE: SMTP_PORT === 465 ? 'true (implicit TLS)' : 'false (STARTTLS)',
  });

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 15_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  } as any);

  // 1) Verify
  try {
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP verify OK');
  } catch (err: any) {
    console.error('❌ SMTP verify failed:', {
      code: err?.code,
      command: err?.command,
      response: err?.response,
      message: err?.message,
    });
    process.exit(3);
  }

  // 2) Send test email
  try {
    console.log('✉️  Sending test email...');
    const info = await transporter.sendMail({
      from: `"SMTP Tester" <${FROM_EMAIL}>`,
      to: TO,
      subject: 'SMTP Test: Hello from Book Review App',
      text: 'If you see this email, Gmail SMTP + App Password works 🎉',
      html: `<p>If you see this email, <b>Gmail SMTP + App Password</b> works 🎉</p>
             <p>Sent at: ${new Date().toISOString()}</p>`,
    });

    console.log('✅ Email sent successfully!');
    console.table({
      messageId: info.messageId,
      accepted: JSON.stringify(info.accepted),
      rejected: JSON.stringify(info.rejected),
      response: info.response,
    });

    if (info.rejected?.length) {
      console.warn('⚠️ Some recipients were rejected:', info.rejected);
    } else {
      console.log('📥 Now check the inbox (and Spam/Promotions) for:', TO);
    }

    process.exit(0);
  } catch (err: any) {
    console.error('❌ Email send failed:', {
      code: err?.code,
      command: err?.command,
      response: err?.response,
      message: err?.message,
      stack: err?.stack,
    });
    console.log('\nQuick fixes:');
    console.log(' • Make sure SMTP_PASS is your 16-char Gmail App Password (no spaces).');
    console.log(' • Use SMTP_PORT=587 with secure=false.');
    console.log(' • Try sending TO your own Gmail first.');
    process.exit(4);
  }
}

main();
