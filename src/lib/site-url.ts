import type { NextRequest } from "next/server";

/**
 * Where "this site" actually is, as far as the current request is concerned.
 * ----------------------------------------------------------------------------
 * Anything that hands an absolute URL to a third party — a Paystack
 * `callback_url`, an email link — has to know the origin the user is browsing
 * on. That origin is not a constant:
 *
 *   production      https://altivance.com
 *   this laptop     http://localhost:3000
 *   a phone on the  http://10.73.207.115:3000
 *   same Wi-Fi
 *   a shared tunnel https://abc123-3000.euw.devtunnels.ms
 *
 * Hard-coding `localhost:3000` is the usual shortcut, and it is exactly what
 * breaks device testing: a payment started on a phone would send that phone to
 * `http://localhost:3000/pay/callback` after checkout, which on a phone means
 * *the phone itself* — a connection refused, with the money already taken.
 *
 * So the origin is derived from the request, with an explicit override for
 * production where a proxy may rewrite the host.
 *
 * Order of preference:
 *   1. `NEXT_PUBLIC_SITE_URL`, when set. The deliberate answer; set this in
 *      production and nowhere else.
 *   2. `x-forwarded-host` / `x-forwarded-proto`. What a reverse proxy, a dev
 *      tunnel or a platform edge rewrites the request with. Taken ahead of the
 *      raw Host header because behind a proxy the raw header is the internal
 *      address, not the one the browser used.
 *   3. The request's own origin. The plain case: LAN IP, localhost, anything.
 */

/** Strips a trailing slash so `${origin}/pay` never becomes `//pay`. */
function normalize(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/**
 * A forwarding proxy may send a comma-separated list, oldest hop first
 * (`client-facing-host, inner-proxy`). The first entry is the one the browser
 * actually typed, so that is the one worth having.
 */
function firstHop(headerValue: string | null): string | null {
  if (!headerValue) return null;
  const first = headerValue.split(",")[0]?.trim();
  return first || null;
}

export function resolveOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    return normalize(configured);
  }

  const forwardedHost = firstHop(request.headers.get("x-forwarded-host"));

  if (forwardedHost) {
    const forwardedProto =
      firstHop(request.headers.get("x-forwarded-proto")) ??
      // A tunnel always terminates TLS, so anything that is not a bare local
      // address is far more likely to be https than http.
      (forwardedHost.startsWith("localhost") ? "http" : "https");

    return normalize(`${forwardedProto}://${forwardedHost}`);
  }

  return normalize(request.nextUrl.origin);
}

/**
 * The absolute URL Paystack should return the customer to.
 *
 * Derived per request, which is what lets the same deployment be paid from a
 * desktop, a phone on the LAN and a shared tunnel without reconfiguration.
 */
export function callbackUrl(request: NextRequest, path = "/pay/callback"): string {
  return `${resolveOrigin(request)}${path}`;
}
