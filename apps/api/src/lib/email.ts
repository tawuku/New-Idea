import nodemailer from "nodemailer";
import { createChildLogger } from "./logger.js";

const log = createChildLogger({ service: "email" });

function getTransport() {
  return nodemailer.createTransport({
    host: process.env["SMTP_HOST"] ?? "localhost",
    port: Number(process.env["SMTP_PORT"] ?? 587),
    secure: process.env["SMTP_SECURE"] === "true",
    auth: {
      user: process.env["SMTP_USER"] ?? "",
      pass: process.env["SMTP_PASS"] ?? "",
    },
    tls: {
      // cPanel/cPanel Exim certificates may be self-signed in dev
      rejectUnauthorized: process.env["NODE_ENV"] === "production",
    },
  });
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const from = process.env["EMAIL_FROM"] ?? "Nexus <noreply@nexus.dev>";

  if (!process.env["SMTP_HOST"]) {
    log.info({ to, subject }, "SMTP not configured — printing email to stdout");
    console.info(`\n📧 EMAIL TO: ${to}\nSUBJECT: ${subject}\n${text ?? html}\n`);
    return;
  }

  const transport = getTransport();
  try {
    await transport.sendMail({ from, to, subject, html, text });
    log.info({ to, subject }, "Email sent");
  } catch (err) {
    log.error({ err, to, subject }, "Failed to send email");
    throw err;
  }
}

export function buildNotificationEmail(title: string, body: string, appUrl: string) {
  return {
    subject: title,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1a1a1a;margin-bottom:8px">${title}</h2>
        <p style="color:#4a4a4a;line-height:1.6">${body}</p>
        <a href="${appUrl}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#5b56f5;color:#fff;border-radius:6px;text-decoration:none">
          Open Nexus
        </a>
        <p style="margin-top:24px;font-size:12px;color:#888">
          You received this because you have notifications enabled.
          <a href="${appUrl}/settings/notifications" style="color:#5b56f5">Manage preferences</a>
        </p>
      </div>
    `,
    text: `${title}\n\n${body}\n\n${appUrl}`,
  };
}
