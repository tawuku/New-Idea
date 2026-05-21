import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { getDb } from "@nexus/db/client";
import * as schema from "@nexus/db/schema";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

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
  baseURL: process.env["BETTER_AUTH_URL"] ?? process.env["NEXT_PUBLIC_APP_URL"],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
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
  plugins: [nextCookies()],
  user: {
    additionalFields: {
      name: {
        type: "string",
        required: true,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  trustedOrigins: [
    process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
});

export type Auth = typeof auth;
