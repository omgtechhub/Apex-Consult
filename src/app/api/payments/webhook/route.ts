import { NextRequest, NextResponse } from "next/server";

import { settlePayment } from "@/lib/payments/settle";
import { verifyWebhookSignature } from "@/lib/payments/paystack";

/**
 * Paystack webhook receiver.
 * ----------------------------------------------------------------------------
 * The authoritative notification. The browser redirect to /pay/callback is a
 * convenience for the customer; this is what settles a payment when the
 * customer closes the tab on the bank's 3-D Secure page, loses signal, or pays
 * by bank transfer hours later.
 *
 * Set the URL on the Paystack dashboard (Settings → API Keys & Webhooks) to
 *     https://your-domain.com/api/payments/webhook
 * Paystack has to reach it from the public internet, so this endpoint does
 * nothing in local development — localhost and a LAN address are not routable
 * from Paystack's servers. That is why /pay/callback also settles payments:
 * between the two, a payment is confirmed in dev and in production alike.
 *
 * Returning 200 to a *verified* event we chose not to act on is intentional.
 * Paystack retries non-2xx responses with backoff, and retrying an event we
 * have already handled, or never handle, is noise with no end state.
 */

// `node:crypto` for the HMAC, `pg` for the settlement write. Neither exists on
// the Edge runtime.
export const runtime = "nodejs";

/** Events that move money and therefore change a payment's state. */
const SETTLING_EVENTS = new Set([
  "charge.success",
  // A pay-with-transfer that the customer completed at their bank.
  "transfer.success",
]);

export async function POST(request: NextRequest) {
  /**
   * The raw body, read as text before anything parses it.
   *
   * The signature is an HMAC over these exact bytes. `request.json()` here
   * would re-serialise the payload with different key order and whitespace,
   * the digest would stop matching, and every webhook would be rejected as
   * forged. This is the single most common way a Paystack integration breaks.
   */
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    // Deliberately terse. A detailed rejection tells an attacker which part of
    // their forgery was wrong.
    console.warn("[payments] rejected a webhook with an invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  const name = event.event ?? "unknown";
  const reference = event.data?.reference;

  if (!SETTLING_EVENTS.has(name) || !reference) {
    // Verified, but not ours to act on. Acknowledged so it is not retried.
    return NextResponse.json({ received: true });
  }

  try {
    // Re-verifies against the API rather than trusting the payload's own
    // amount and status. The signature proves the message came from Paystack;
    // verification proves what the transaction currently *is*, which is the
    // thing worth recording.
    const outcome = await settlePayment(reference);

    if (outcome.state === "gateway-error") {
      // A genuine "try me again" — our verification call failed, so the event
      // is unprocessed and a retry would help.
      return NextResponse.json({ error: outcome.message }, { status: 503 });
    }

    return NextResponse.json({ received: true, state: outcome.state });
  } catch (error) {
    console.error(`[payments] webhook ${name} failed for ${reference}:`, error);
    // 500 so Paystack retries; the event has not been recorded.
    return NextResponse.json({ error: "Settlement failed" }, { status: 500 });
  }
}
