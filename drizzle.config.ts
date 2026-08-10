import { config as loadEnv } from "dotenv";
import type { Config } from "drizzle-kit";

/**
 * Drizzle config.
 *
 * Replaces the previous `drizzle.config.json`, which could only hold a literal
 * connection string — and a literal string means the database password lives in
 * a committable file. Reading from the environment keeps the credential in
 * `.env.local`, which is git-ignored.
 *
 * `.env.local` is loaded explicitly: `dotenv/config` only reads `.env`, whereas
 * Next itself reads `.env.local` first. Without this the CLI and the app would
 * disagree about which database they are pointed at.
 */
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local — see README-ADMIN.md."
  );
}

export default {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL },
} satisfies Config;
