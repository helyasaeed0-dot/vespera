const nodemailer = require("nodemailer");
const config = require("../config/env");
const logger = require("../utils/logger");

let transporter = null;

if (config.SMTP_HOST && config.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASSWORD,
    },
  });
}

const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    logger.info(`[Email Service Simulation] To: ${to} | Subject: ${subject}`);
    return { simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${config.EMAIL_FROM}" <${config.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
    return info;
  } catch (error) {
    logger.error("Failed to send email via SMTP", { error: error.message });
    return null;
  }
};

module.exports = {
  sendEmail,
};
