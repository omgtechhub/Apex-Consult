import "server-only";

/**
 * Staff authentication.
 *
 * Deliberately dependency-free: password hashing uses Node's built-in `scrypt`
 * and sessions are opaque random tokens stored server-side. Adding `bcrypt`
 * would pull a native binary into the build for no security gain at this scale,
 * and a stateless JWT would make "admin suspends a consultant" take effect only
 * when the token happened to expire.
 *
 * Two properties worth stating explicitly:
 *
 *  - The database never stores a usable credential. Passwords are scrypt hashes
 *    with a per-password salt; session tokens are stored as SHA-256 digests. A
 *    dump of either table yields nothing that can be replayed against the site.
 *
 *  - Password verification uses `timingSafeEqual`. A plain `===` on hashes
 *    leaks, through response timing, how many leading bytes matched, which is
 *    enough to reconstruct a hash byte by byte.
 */

import { randomBytes, scrypt as scryptCb, timingSafeEqual, createHash } from "crypto";
import { promisify } from "util";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";

const scrypt = promisify(scryptCb);

export const SESSION_COOKIE = "apex_staff_session";
const SESSION_DAYS = 7;
const KEY_LEN = 64;

export type Role = "admin" | "consultant";
export const ROLES: Role[] = ["admin", "consultant"];

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string | null;
  active: boolean;
};

/* -------------------------------------------------------------------------- */
/*  Passwords                                                                 */
/* -------------------------------------------------------------------------- */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, KEY_LEN)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, keyHex] = stored.split(":");
  if (!salt || !keyHex) return false;

  const expected = Buffer.from(keyHex, "hex");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;

  // Length must match before timingSafeEqual, which throws on mismatch.
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

/* -------------------------------------------------------------------------- */
/*  Sessions                                                                  */
/* -------------------------------------------------------------------------- */

const digest = (token: string) => createHash("sha256").update(token).digest("hex");

/** Issues a session and sets the cookie. Returns the raw token for tests. */
export async function createSession(userId: string, userAgent?: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);

  await db.insert(sessions).values({
    userId,
    tokenHash: digest(token),
    userAgent: userAgent?.slice(0, 500),
    expiresAt,
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

/**
 * Resolves the signed-in staff user, or null.
 *
 * The join is filtered on `expiresAt > now` and `users.active`, so an expired
 * session or a suspended account fails on the very next request rather than
 * whenever a cache happens to clear.
 */
export async function getStaffUser(): Promise<StaffUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      title: users.title,
      active: users.active,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, digest(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);

  const row = rows[0];
  if (!row || !row.active) return null;

  return { ...row, role: (row.role as Role) ?? "consultant" };
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, digest(token)));
  }
  jar.delete(SESSION_COOKIE);
}

/* -------------------------------------------------------------------------- */
/*  Guards                                                                    */
/* -------------------------------------------------------------------------- */

export function isAdmin(user: StaffUser | null): boolean {
  return user?.role === "admin";
}

/**
 * Admin-only capabilities, per the brief: comment moderation and testimonial
 * approval are admin powers, not consultant ones. Kept as a single list so the
 * rule is stated once and every screen can ask the same question.
 */
export const ADMIN_ONLY = [
  "moderate-comments",
  "moderate-testimonials",
  "manage-staff",
  "view-activity",
] as const;

export type Capability = (typeof ADMIN_ONLY)[number] | "manage-posts" | "handle-threads";

export function can(user: StaffUser | null, capability: Capability): boolean {
  if (!user || !user.active) return false;
  if (user.role === "admin") return true;
  // Consultants write posts and work their threads; nothing else.
  return capability === "manage-posts" || capability === "handle-threads";
}
