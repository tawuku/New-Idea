import nodemailer from "nodemailer";

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
    // Dev fallback: print to console
    console.info(`\n📧 EMAIL TO: ${to}\nSUBJECT: ${subject}\n${text ?? html}\n`);
    return;
  }

  const transport = getTransport();
  await transport.sendMail({ from, to, subject, html, text });
}
