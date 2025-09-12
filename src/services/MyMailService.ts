// src/services/MyMailService.ts
import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mail.local",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // STARTTLS upgrade
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // Local-only: allow self-signed Mailcow cert
    rejectUnauthorized: false,
  },
});

export async function sendLoginEmail(to: string, name?: string) {
  const html = `
    <div style="font-family:system-ui,Segoe UI,Helvetica,Arial,sans-serif;font-size:14px">
      <p>Hi ${name ?? ""},</p>
      <p>You just logged in to your Book Review account.</p>
      <p>If this wasn't you, please update your password.</p>
      <hr/>
      <p style="color:#888">Sent by local Mailcow test server</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Book Review" <${process.env.SMTP_USER}>`,
    to,
    subject: "Login notification",
    html,
  });
}
