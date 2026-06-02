import { config } from "dotenv";
import type { Config } from "drizzle-kit";

config({ path: "../../.env.local" });
config({ path: "../../.env" });

if (!process.env["DATABASE_URL"]) {
  throw new Error("DATABASE_URL is required");
}

export default {
  schema: "./src/schema/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env["DATABASE_URL"],
  },
  verbose: true,
  strict: false,
} satisfies Config;
