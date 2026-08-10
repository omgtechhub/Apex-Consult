import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, activityLog } from "@/db/schema";
import { getStaffUser, verifyPassword, createSession } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Staff sign in",
  // Never let a login screen into search results.
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  // Already signed in — skip the form.
  if (await getStaffUser()) redirect(next || "/admin");

  async function signIn(formData: FormData) {
    "use server";

    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const target = String(formData.get("next") || "/admin");

    /**
     * One generic failure message for every rejection path — unknown email,
     * wrong password, suspended account. Distinguishing them turns the login
     * form into an account-enumeration oracle: an attacker learns which of a
     * leaked email list are real staff addresses without guessing a password.
     */
    const fail = () => redirect(`/admin/login?error=1${next ? `&next=${next}` : ""}`);

    if (!email || !password) fail();

    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = rows[0];

    // Still hash on the miss path so a nonexistent account does not return
    // measurably faster than a wrong password.
    const stored = user?.passwordHash ?? "0".repeat(32) + ":" + "0".repeat(128);
    const ok = await verifyPassword(password, stored);

    if (!user || !ok || !user.active) fail();

    const ua = (await headers()).get("user-agent") ?? undefined;
    await createSession(user.id, ua);
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
    await db.insert(activityLog).values({
      userId: user.id,
      action: "signed-in",
      entityType: "session",
    });

    redirect(target.startsWith("/admin") ? target : "/admin");
  }

  return <LoginForm action={signIn} hasError={error === "1"} next={next} />;
}
