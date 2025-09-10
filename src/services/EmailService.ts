import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const isProd = process.env.NODE_ENV === "production";

const GMAIL_HOST = process.env.GMAIL_HOST || "smtp.gmail.com";
const GMAIL_PORT = Number(process.env.GMAIL_PORT || 587);
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;
const GMAIL_FROM = process.env.GMAIL_FROM || GMAIL_USER;

if (!GMAIL_USER || !GMAIL_PASS) {
  console.error("[EmailService] Missing Gmail credentials in env");
}

const transporter = nodemailer.createTransport({
  host: GMAIL_HOST,
  port: GMAIL_PORT,
  secure: GMAIL_PORT === 465,
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  pool: true,
  maxConnections: 5,
  maxMessages: 50,
  connectionTimeout: 15_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,
  logger: !isProd,
} as any);

// Verify on load
transporter.verify().then(
  () => console.log("[EmailService] Gmail SMTP ready"),
  (err) =>
    console.error("[EmailService] Gmail verify failed", {
      code: err?.code,
      command: err?.command,
      message: err?.message,
    })
);

export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: `"Book Review App" <${GMAIL_FROM}>`,
      to,
      subject,
      text: body || " ",
    });
    console.log("[EmailService] Sent", {
      id: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });
  } catch (err: any) {
    console.error("[EmailService] Send failed", {
      message: err?.message,
      code: err?.code,
      response: err?.response,
    });
  }
}
