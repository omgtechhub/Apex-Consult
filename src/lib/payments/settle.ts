import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { bookings, payments } from "@/db/schema";

import { PaystackApiError, verifyTransaction } from "./paystack";

/**
 * Settlement: turning a gateway result into our own record of it.
 * ----------------------------------------------------------------------------
 * Two independent things tell us a payment finished:
 *
 *   1. the customer's browser arriving at /pay/callback, and
 *   2. Paystack's webhook hitting /api/payments/webhook.
 *
 * Either can arrive first, both can arrive, and in local development only the
 * first one ever arrives (Paystack cannot reach a laptop on a home LAN). So
 * settlement has to be idempotent and has to work from either trigger — which
 * is why both call this one function instead of each updating rows themselves.
 *
 * The browser redirect is a *trigger*, never evidence. It carries a reference
 * in a query string that anyone can edit, so this function always re-asks
 * Paystack what happened and writes only what Paystack said.
 */

export type SettlementOutcome =
  | {
      state: "paid";
      reference: string;
      amountSubunit: number;
      currency: string;
      channel: string | null;
      paidAt: Date | null;
      customerName: string | null;
      customerEmail: string | null;
      service: string | null;
      milestone: string;
    }
  | {
      state: "failed" | "pending";
      reference: string;
      /** Gateway wording where there is any, e.g. "Declined by bank". */
      message: string | null;
    }
  | {
      state: "unknown-reference";
      reference: string;
    }
  | {
      state: "gateway-error";
      reference: string;
      message: string;
    };

/**
 * Maps Paystack's status vocabulary onto ours.
 *
 * Paystack reports `abandoned` for a checkout the customer walked away from.
 * That is stored verbatim rather than folded into `failed`, because the two
 * need different follow-up: a declined card is a support conversation, an
 * abandoned checkout is a reminder email.
 */
function toLocalStatus(paystackStatus: string): string {
  switch (paystackStatus) {
    case "success":
      return "success";
    case "failed":
      return "failed";
    case "abandoned":
      return "abandoned";
    default:
      return "pending";
  }
}

/**
 * Verifies `reference` against Paystack and brings our rows in line with it.
 *
 * Safe to call repeatedly for the same reference. A row already marked
 * `success` is not re-settled: `paidAt` keeps the moment the money actually
 * moved rather than drifting forward every time somebody reloads the receipt.
 */
export async function settlePayment(
  reference: string,
): Promise<SettlementOutcome> {
  const trimmed = reference.trim();

  if (!trimmed) {
    return { state: "unknown-reference", reference };
  }

  const [existing] = await db
    .select()
    .from(payments)
    .where(eq(payments.reference, trimmed))
    .limit(1);

  // A reference we never issued. Almost always a hand-edited URL, so it gets
  // the same answer as a typo rather than anything that confirms or denies the
  // existence of someone else's transaction.
  if (!existing) {
    return { state: "unknown-reference", reference: trimmed };
  }

  // Already settled successfully — answer from our own record and leave the
  // gateway alone. This is the common path: a customer reloading the receipt.
  if (existing.status === "success") {
    return {
      state: "paid",
      reference: existing.reference,
      amountSubunit: existing.amountSubunit,
      currency: existing.currency,
      channel: existing.channel,
      paidAt: existing.paidAt,
      customerName: existing.customerName,
      customerEmail: existing.customerEmail,
      service: existing.service,
      milestone: existing.milestone,
    };
  }

  let verified;

  try {
    verified = await verifyTransaction(trimmed);
  } catch (error) {
    // The payment may well have succeeded; we just could not confirm it. The
    // row stays `pending` so the webhook, or a reload, can settle it later.
    // Nothing is marked failed on the strength of our own network trouble.
    const message =
      error instanceof PaystackApiError
        ? error.message
        : "Could not confirm this payment with Paystack";

    console.error(`[payments] verify failed for ${trimmed}:`, error);

    return { state: "gateway-error", reference: trimmed, message };
  }

  const localStatus = toLocalStatus(verified.status);

  /**
   * Amount tamper check.
   *
   * We told Paystack what to charge, so a mismatch means either the
   * transaction was initialised elsewhere or the reference has been reused.
   * Either way it is not a payment for this invoice, so it is recorded but
   * never reported as paid.
   */
  const amountMatches = verified.amountSubunit === existing.amountSubunit;

  if (localStatus === "success" && !amountMatches) {
    console.error(
      `[payments] amount mismatch on ${trimmed}: expected ${existing.amountSubunit} kobo, gateway charged ${verified.amountSubunit} kobo`,
    );
  }

  const settledOk = localStatus === "success" && amountMatches;

  await db
    .update(payments)
    .set({
      status: settledOk ? "success" : localStatus === "success" ? "failed" : localStatus,
      channel: verified.channel,
      gatewayResponse: amountMatches
        ? verified.gatewayResponse
        : `Amount mismatch: charged ${verified.amountSubunit} kobo against an invoice for ${existing.amountSubunit} kobo`,
      providerTransactionId: verified.providerTransactionId,
      providerPayload: verified.raw,
      paidAt: settledOk ? (verified.paidAt ?? new Date()) : null,
      updatedAt: new Date(),
    })
    .where(eq(payments.reference, trimmed));

  // Keep the booking's own payment flag in step, so the admin bookings list
  // shows paid state without having to join across to payments.
  if (settledOk && existing.bookingId) {
    await db
      .update(bookings)
      .set({
        paymentStatus: existing.milestone === "full" ? "paid" : "part-paid",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, existing.bookingId));
  }

  if (settledOk) {
    return {
      state: "paid",
      reference: existing.reference,
      amountSubunit: existing.amountSubunit,
      currency: existing.currency,
      channel: verified.channel,
      paidAt: verified.paidAt ?? new Date(),
      customerName: existing.customerName,
      customerEmail: existing.customerEmail,
      service: existing.service,
      milestone: existing.milestone,
    };
  }

  return {
    state: localStatus === "pending" ? "pending" : "failed",
    reference: existing.reference,
    message: amountMatches
      ? verified.gatewayResponse
      : "This payment could not be matched to its invoice. Please contact us before trying again.",
  };
}
