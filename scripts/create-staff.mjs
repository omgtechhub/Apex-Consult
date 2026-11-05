/**
 * Creates or updates a staff account.
 *
 *   node scripts/create-staff.mjs "Ada Obi" ada@apexacademic.com admin
 *
 * The password is read from stdin rather than argv so it never lands in shell
 * history or the process list, where any other user on the box can read it.
 */
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import { createInterface } from "node:readline";
import pg from "pg";
import { config as loadEnv } from "dotenv";

/**
 * Load the same env file the app and drizzle-kit read.
 *
 * Without this the script only sees variables already exported in the shell,
 * so the documented invocation — `node scripts/create-staff.mjs "Name"
 * email role` — always failed with "DATABASE_URL is not set", and the
 * obvious workaround is to paste the connection string (password and all)
 * onto the command line, where it lands in shell history.
 *
 * Order matches drizzle.config.ts: .env.local first, then .env. An existing
 * shell variable still wins, because dotenv does not override by default.
 */
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const scrypt = promisify(scryptCb);
const [, , name, email, role = "consultant"] = process.argv;

if (!name || !email) {
  console.error('Usage: node scripts/create-staff.mjs "Full Name" email@example.com [admin|consultant]');
  process.exit(1);
}
if (!["admin", "consultant"].includes(role)) {
  console.error(`Role must be "admin" or "consultant" — got "${role}"`);
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. See the setup notes in README-ADMIN.md.");
  process.exit(1);
}

/**
 * Where the password comes from.
 *
 * A TTY is the default and the best option: the password is typed, never
 * stored, and never reaches argv or shell history.
 *
 * But a TTY is not always attached. Claude Code's `!` prefix and every CI
 * runner provide none, and in that case `rl.question` never fires its
 * callback: the await never settles and node exits with "Detected unsettled
 * top-level await", which reads as a crash in this script rather than a
 * missing input. Detecting it and saying what to do instead is the
 * difference between a ten-second fix and a debugging session.
 */
async function readPassword() {
  if (process.env.STAFF_PASSWORD) return process.env.STAFF_PASSWORD;

  if (!process.stdin.isTTY) {
    console.error(`
No terminal is attached, so there is nowhere to type a password.

Run this command in your own terminal window, where it can prompt you.
Or put the password in the environment first, then re-run:

  PowerShell:  $env:STAFF_PASSWORD = 'your-password'
  bash:        export STAFF_PASSWORD='your-password'
`);
    process.exit(1);
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return await new Promise((resolve) => rl.question("Password for " + email + ": ", resolve));
  } finally {
    rl.close();
  }
}

const password = (await readPassword()).trim();

if (password.length < 10) {
  console.error("\nPassword must be at least 10 characters.");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const key = await scrypt(password, salt, 64);
const passwordHash = `${salt}:${key.toString("hex")}`;

const initials = name.split(/\s+/).map((p) => p[0]).join("").slice(0, 4).toUpperCase();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, avatar_initials, active)
     VALUES ($1, $2, $3, $4, $5, true)
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           role          = EXCLUDED.role,
           name          = EXCLUDED.name,
           active        = true
     RETURNING id, email, role`,
    [name, email.toLowerCase(), passwordHash, role, initials]
  );
  console.log(`\n✓ ${rows[0].email} is now an active ${rows[0].role}.`);
  console.log("  Sign in at /admin/login");
} catch (err) {
  console.error("\nFailed:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
