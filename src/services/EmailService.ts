// ./services/EmailService.ts

import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
// Configure transporter (use your email credentials)
const transporter = nodemailer.createTransport({
  host: 'gmail',      // or your SMTP server
  port: 587,
  secure: false,               // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // your email address
    pass: process.env.EMAIL_PASS, // your email password or app password
  },
});

export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"Book Review App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: body,
    });
    console.log(`Email sent to ${to} - Subject: ${subject}`);
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}
