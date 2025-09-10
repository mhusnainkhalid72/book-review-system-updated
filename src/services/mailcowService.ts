import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import dotenv from "dotenv";
dotenv.config();

const isProd = process.env.NODE_ENV === "production";

const MAILCOW_HOST = process.env.MAILCOW_HOST || "127.0.0.1";
const MAILCOW_PORT = Number(process.env.MAILCOW_PORT || 587);
const MAILCOW_USER = process.env.MAILCOW_USER || "noreply@example.local";
const MAILCOW_PASS = process.env.MAILCOW_PASS || "password";
const MAILCOW_SECURE = process.env.MAILCOW_SECURE === "true"; // true if 465
const MAILCOW_FROM = process.env.MAILCOW_FROM || MAILCOW_USER;

let transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null = null;

function initTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: MAILCOW_HOST,
    port: MAILCOW_PORT,
    secure: MAILCOW_SECURE,
    auth: { user: MAILCOW_USER, pass: MAILCOW_PASS },
    logger: !isProd,
    connectionTimeout: 20_000,
    greetingTimeout: 15_000,
    socketTimeout: 60_000,
    tls: { rejectUnauthorized: false }, // ignore self-signed certs for local
  } as SMTPTransport.Options);

  transporter.verify((err) => {
    if (err) {
      console.error("[MailcowService] Transporter verification failed:", err?.message || err);
    } else {
      console.log("[MailcowService] SMTP ready");
    }
  });

  return transporter;
}

export interface MailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export async function sendMailViaMailcow(opts: MailOptions) {
  const t = initTransporter();
  const from = opts.from || MAILCOW_FROM;

  try {
    const info = await t.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });

    console.log("[MailcowService] Sent", {
      id: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

    return { ok: true, id: info.messageId };
  } catch (err: any) {
    console.error("[MailcowService] Send failed", {
      message: err?.message,
      code: err?.code,
      response: err?.response,
    });
    return { ok: false, error: err?.message };
  }
}
