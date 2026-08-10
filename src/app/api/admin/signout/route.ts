import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

/**
 * Sign out.
 *
 * POST only. A GET sign-out is triggerable by any `<img src>` on a third-party
 * page, which is a trivial denial-of-service against a logged-in consultant.
 */
export async function POST(request: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
}
