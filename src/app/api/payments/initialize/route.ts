import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { payments } from "@/db/schema";
import { paymentRequestSchema } from "@/lib/payments/options";
import {
  PaystackApiError,
  PaystackConfigError,
  initializeTransaction,
  newReference,
  toSubunit,
} from "@/lib/payments/paystack";
import { callbackUrl, resolveOrigin } from "@/lib/site-url";

/**
 * Starts a Paystack checkout.
 * ----------------------------------------------------------------------------
 * The order of operations matters and is deliberate:
 *
 *   1. validate,
 *   2. write a `pending` row with a reference we generated,
 *   3. ask Paystack for a checkout URL,
 *   4. hand the URL back for the browser to follow.
 *
 * Writing the row *before* calling Paystack is what makes a lost response
 * recoverable. If step 3 or 4 fails after Paystack has already created the
 * session, the transaction still exists under a reference we hold, so the
 * webhook can settle it and it shows up in reconciliation. Reverse the order
 * and a dropped response means a customer can be charged against a reference
 * that appears nowhere in our database.
 */

// `node:crypto` and `pg` are unavailable on the Edge runtime.
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body" }, { status: 400 });
  }

  const parsed = paymentRequestSchema.safeParse(body);

  if (!parsed.success) {
    // Field-level messages, so the form can mark the offending input rather
    // than show one generic failure above an apparently valid form.
    const fieldErrors: Record<string, string> = {};

    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }

    return NextResponse.json(
      { error: "Please check the highlighted fields", fieldErrors },
      { status: 422 },
    );
  }

  const input = parsed.data;
  const reference = newReference();

  let amountSubunit: number;

  try {
    amountSubunit = toSubunit(input.amount);
  } catch {
    // The schema already bounds the amount; this is the belt to its braces.
    return NextResponse.json({ error: "Invalid amount" }, { status: 422 });
  }

  try {
    await db.insert(payments).values({
      reference,
      provider: "paystack",
      bookingId: input.bookingId || null,
      customerName: input.name,
      customerEmail: input.email,
      customerPhone: input.phone || null,
      service: input.service,
      milestone: input.milestone,
      quoteRef: input.quoteRef || null,
      note: input.note || null,
      amountSubunit,
      currency: "NGN",
      status: "pending",
    });
  } catch (error) {
    console.error("[payments] could not record the pending payment:", error);
    return NextResponse.json(
      { error: "We could not start this payment. Please try again." },
      { status: 500 },
    );
  }

  try {
    const checkout = await initializeTransaction({
      amountSubunit,
      email: input.email,
      reference,
      // Derived from this request, not from a constant — see src/lib/site-url.ts.
      // It is what lets a payment started on a phone come back to that phone.
      callbackUrl: callbackUrl(request),
      cancelUrl: `${resolveOrigin(request)}/pay?cancelled=1`,
      metadata: {
        // Shown on the transaction in the Paystack dashboard, so the team can
        // tell what a payment was for without opening our admin area.
        custom_fields: [
          { display_name: "Client", variable_name: "client", value: input.name },
          { display_name: "Service", variable_name: "service", value: input.service },
          {
            display_name: "Instalment",
            variable_name: "milestone",
            value: input.milestone,
          },
          ...(input.quoteRef
            ? [
                {
                  display_name: "Quote ref",
                  variable_name: "quote_ref",
                  value: input.quoteRef,
                },
              ]
            : []),
        ],
        phone: input.phone || null,
        booking_id: input.bookingId || null,
        note: input.note || null,
      },
    });

    return NextResponse.json(
      { reference, authorizationUrl: checkout.authorizationUrl },
      // Nothing about a checkout session may be cached by a proxy.
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    // The pending row stays behind on purpose: it is the audit trail of an
    // attempt, and it is how an operator finds out the gateway is misconfigured.
    console.error("[payments] Paystack initialize failed:", error);

    if (error instanceof PaystackConfigError) {
      // An operator problem, not the customer's. Say so without leaking which
      // environment variable is wrong.
      return NextResponse.json(
        {
          error:
            "Online payment is not available right now. Please contact us on WhatsApp to pay by transfer.",
        },
        { status: 503 },
      );
    }

    if (error instanceof PaystackApiError) {
      return NextResponse.json(
        { error: `Paystack could not start this payment: ${error.message}` },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: "We could not start this payment. Please try again." },
      { status: 500 },
    );
  }
}
