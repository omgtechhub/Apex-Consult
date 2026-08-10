import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStaffUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Apex Admin" },
  robots: { index: false, follow: false },
};

/**
 * Admin gate.
 *
 * This lives in the `(app)` route group so `/admin/login` — which sits outside
 * the group — is not wrapped by it. Putting the guard on `admin/layout.tsx`
 * instead would wrap the login page too, and every redirect to it would be
 * caught by the same guard: an infinite loop that only shows up once you are
 * signed out.
 *
 * The check is a server layout rather than `middleware.ts` because Next
 * middleware runs on the Edge runtime, where neither `pg` nor `node:crypto` is
 * available. Middleware could only test whether *some* cookie exists, which is
 * not authentication. Verifying here means every nested route is checked
 * against the database on each request, so a revoked session or a suspended
 * account is locked out immediately rather than whenever a token expires.
 */
export default async function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getStaffUser();
  if (!user) redirect("/admin/login");

  return <AdminShell user={user}>{children}</AdminShell>;
}
