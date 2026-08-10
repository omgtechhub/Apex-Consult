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

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

const password = await ask(`Password for ${email}: `);
rl.close();

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
