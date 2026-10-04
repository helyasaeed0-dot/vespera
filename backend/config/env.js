const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || "",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",


  // JWT & Session Security
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "vespera_jwt_access_super_secret_key_2026_x99",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "vespera_jwt_refresh_super_secret_key_2026_x88",
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "15m",
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "7d",
  COOKIE_SECRET: process.env.COOKIE_SECRET || "vespera_cookie_sign_secret_2026",

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/auth/google/callback",
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_CALLBACK_URL || process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/auth/google/callback",

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",

  // SMTP / Email
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "noreply@vespera.com",

  // Admin Initial Bootstrap Credentials (environment controlled)
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@vespera.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "VesperaAdmin@2026!",
  ADMIN_NAME: process.env.ADMIN_NAME || "Vespera Super Admin",
};
