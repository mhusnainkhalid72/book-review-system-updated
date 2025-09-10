import dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 4000),

  // Database
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/book_review_system",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "supersecret_jwt_key",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // Redis
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: Number(process.env.REDIS_PORT || 6379),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  // Session
  SESSION_SECRET: process.env.SESSION_SECRET || "password",

  // Mailcow SMTP
  MAILCOW_HOST: process.env.MAILCOW_HOST || "127.0.0.1",
  MAILCOW_PORT: Number(process.env.MAILCOW_PORT || 587),
  MAILCOW_USER: process.env.MAILCOW_USER || "",
  MAILCOW_PASS: process.env.MAILCOW_PASS || "",
  MAILCOW_FROM: process.env.MAILCOW_FROM || "",

  // Gmail SMTP
  GMAIL_HOST: process.env.GMAIL_HOST || "smtp.gmail.com",
  GMAIL_PORT: Number(process.env.GMAIL_PORT || 587),
  GMAIL_USER: process.env.GMAIL_USER || "",
  GMAIL_PASS: process.env.GMAIL_PASS || "",
  GMAIL_FROM: process.env.GMAIL_FROM || "",

  // Admin
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
  ADMIN_NAME: process.env.ADMIN_NAME || "",
};
