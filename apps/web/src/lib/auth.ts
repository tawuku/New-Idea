import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { getDb } from "@nexus/db/client";
import * as schema from "@nexus/db/schema";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { sendEmail } from "./email.js";

const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  secret: process.env["BETTER_AUTH_SECRET"],
  baseURL: process.env["BETTER_AUTH_URL"] ?? appUrl,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your Nexus password",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2>Reset your password</h2>
            <p>Click the link below to reset your password. This link expires in 1 hour.</p>
            <a href="${url}" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#5b56f5;color:#fff;border-radius:6px;text-decoration:none">
              Reset password
            </a>
            <p style="margin-top:16px;font-size:12px;color:#888">If you didn't request this, ignore this email.</p>
          </div>
        `,
        text: `Reset your Nexus password: ${url}`,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your Nexus email",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2>Verify your email</h2>
            <p>Thanks for signing up! Click below to verify your email address.</p>
            <a href="${url}" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#5b56f5;color:#fff;border-radius:6px;text-decoration:none">
              Verify email
            </a>
          </div>
        `,
        text: `Verify your Nexus email: ${url}`,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env["GOOGLE_CLIENT_ID"] ?? "",
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"] ?? "",
      enabled: !!(process.env["GOOGLE_CLIENT_ID"] && process.env["GOOGLE_CLIENT_SECRET"]),
    },
    microsoft: {
      clientId: process.env["MICROSOFT_CLIENT_ID"] ?? "",
      clientSecret: process.env["MICROSOFT_CLIENT_SECRET"] ?? "",
      tenantId: process.env["MICROSOFT_TENANT_ID"] ?? "common",
      enabled: !!(process.env["MICROSOFT_CLIENT_ID"] && process.env["MICROSOFT_CLIENT_SECRET"]),
    },
  },
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  plugins: [nextCookies()],
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  trustedOrigins: [appUrl, "http://localhost:3000", "http://localhost:3001"],
});

export type Auth = typeof auth;
