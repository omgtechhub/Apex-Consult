import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Paystack gateway client.
 * ----------------------------------------------------------------------------
 * Paystack is the single payment gateway for this site. There is no SDK
 * dependency here on purpose: the three endpoints we need (initialize, verify,
 * webhook signature) are a thin REST surface, and an unmaintained wrapper is a
 * worse liability than thirty lines of `fetch`.
 *
 * MONEY IS NEVER A FLOAT. Paystack takes and returns amounts in the currency's
 * *subunit* — kobo for NGN — as an integer. Every amount crossing this module's
 * boundary is an integer number of kobo, and the naira/kobo conversion happens
 * in exactly two functions (`toSubunit`, `fromSubunit`) so a rounding bug has
 * one place to live rather than twelve.
 *
 * Environment (see `.env.example`):
 *   PAYSTACK_SECRET_KEY               sk_test_… / sk_live_…  server only
 *   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY   pk_test_… / pk_live_…  safe in the client
 *
 * The secret key is read lazily, inside the call, rather than at module load.
 * Reading it at import time would crash every page that merely *imports*
 * something from this file on a machine that has not configured payments yet.
 */

const PAYSTACK_API = "https://api.paystack.co";

/**
 * Paystack's own timeout is generous; ours is not. A checkout button that
 * spins for thirty seconds has already lost the sale.
 */
const REQUEST_TIMEOUT_MS = 15_000;

/** NGN is the integration currency — every price on the site is in naira. */
export const CURRENCY = "NGN";

/* -------------------------------------------------------------------------- */
/*  Errors                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Thrown when the gateway is not configured. Distinct from an API failure so
 * a route can answer "payments aren't set up yet" rather than "payment
 * failed" — one is the operator's problem, the other the customer's.
 */
export class PaystackConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaystackConfigError";
  }
}

/** Thrown when Paystack is reachable but rejected or failed the request. */
export class PaystackApiError extends Error {
  readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "PaystackApiError";
    this.statusCode = statusCode;
  }
}

/* -------------------------------------------------------------------------- */
/*  Configuration                                                             */
/* -------------------------------------------------------------------------- */

function readSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();

  if (!key) {
    throw new PaystackConfigError(
      "PAYSTACK_SECRET_KEY is not set. Add it to .env.local — see .env.example.",
    );
  }

  // A public key in the secret slot is a copy-paste mistake that would
  // otherwise surface as an opaque 401 from Paystack.
  if (key.startsWith("pk_")) {
    throw new PaystackConfigError(
      "PAYSTACK_SECRET_KEY holds a public key (pk_…). It needs the secret key (sk_…).",
    );
  }

  if (!key.startsWith("sk_")) {
    throw new PaystackConfigError(
      "PAYSTACK_SECRET_KEY does not look like a Paystack secret key (expected sk_test_… or sk_live_…).",
    );
  }

  return key;
}

/**
 * True when payments can run at all. Lets a page render an honest
 * "not configured" state instead of throwing a 500 at a customer.
 */
export function isPaystackConfigured(): boolean {
  try {
    readSecretKey();
    return true;
  } catch {
    return false;
  }
}

/**
 * `true` on a live key. Used to label test-mode checkouts in the UI, so nobody
 * mistakes a test payment for a real one — or the reverse.
 */
export function isLiveMode(): boolean {
  return process.env.PAYSTACK_SECRET_KEY?.trim().startsWith("sk_live_") ?? false;
}

/* -------------------------------------------------------------------------- */
/*  Money                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Naira → kobo, as an integer.
 *
 * `Math.round` rather than truncation: `12345.67 * 100` is `1234566.9999…` in
 * IEEE-754, and truncating would silently undercharge by a kobo. Inputs with
 * more than two decimal places are rejected rather than quietly rounded,
 * because a two-decimal currency has no third decimal to round.
 */
export function toSubunit(naira: number): number {
  if (!Number.isFinite(naira) || naira <= 0) {
    throw new RangeError(`Amount must be a positive number, received ${naira}`);
  }

  const kobo = Math.round(naira * 100);

  if (Math.abs(naira * 100 - kobo) > 1e-6) {
    throw new RangeError(`Amount ${naira} has sub-kobo precision`);
  }

  return kobo;
}

/** Kobo → naira. The inverse of `toSubunit`, for display only. */
export function fromSubunit(kobo: number): number {
  return kobo / 100;
}

/** `₦65,000` / `₦1,800.50` — whole naira drop the decimals, part-kobo keeps them. */
export function formatNaira(kobo: number): string {
  const naira = fromSubunit(kobo);
  const hasKobo = kobo % 100 !== 0;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: hasKobo ? 2 : 0,
    maximumFractionDigits: hasKobo ? 2 : 0,
  }).format(naira);
}

/* -------------------------------------------------------------------------- */
/*  References                                                                */
/* -------------------------------------------------------------------------- */

/**
 * A transaction reference we own.
 *
 * Paystack will generate one if we don't, but then our database has no handle
 * on the transaction until the response comes back — and if that response is
 * lost, the payment is unreconcilable. Generating it first means the row
 * exists before the customer ever reaches checkout.
 *
 * Paystack allows only alphanumerics plus `-`, `.` and `=`.
 */
export function newReference(prefix = "ALT"): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const noise = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${stamp}-${noise}`;
}

/* -------------------------------------------------------------------------- */
/*  Transport                                                                 */
/* -------------------------------------------------------------------------- */

type PaystackEnvelope<T> = {
  status: boolean;
  message: string;
  data: T;
};

async function paystackFetch<T>(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown },
): Promise<T> {
  const secretKey = readSecretKey();

  let response: Response;

  try {
    response = await fetch(`${PAYSTACK_API}${path}`, {
      method: init.method,
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      // Payment state must never come from a cache.
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const reason =
      error instanceof Error && error.name === "TimeoutError"
        ? `Paystack did not respond within ${REQUEST_TIMEOUT_MS / 1000}s`
        : "Could not reach Paystack";
    throw new PaystackApiError(reason);
  }

  // Paystack answers in JSON for both success and documented failures, but a
  // gateway outage can return HTML. Parse defensively.
  let payload: Partial<PaystackEnvelope<T>> | null = null;

  try {
    payload = (await response.json()) as Partial<PaystackEnvelope<T>>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.status) {
    throw new PaystackApiError(
      payload?.message ?? `Paystack returned ${response.status}`,
      response.status,
    );
  }

  return payload.data as T;
}

/* -------------------------------------------------------------------------- */
/*  Initialize                                                                */
/* -------------------------------------------------------------------------- */

export type InitializeInput = {
  /** Integer kobo. Use `toSubunit()`. */
  amountSubunit: number;
  email: string;
  /** Our reference, created by `newReference()` and already persisted. */
  reference: string;
  /** Where Paystack sends the browser once checkout finishes. */
  callbackUrl: string;
  /** Where the "cancel" link on Paystack's checkout goes. */
  cancelUrl?: string;
  /** Surfaced on the Paystack dashboard against this transaction. */
  metadata?: Record<string, unknown>;
};

export type InitializeResult = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

/**
 * Creates a checkout session and returns the URL to send the customer to.
 *
 * `channels` is deliberately left unset so the checkout offers everything the
 * Paystack dashboard has enabled on the account — card, bank transfer, USSD,
 * mobile money. Hard-coding the list here would silently disable any channel
 * the business turns on later.
 */
export async function initializeTransaction(
  input: InitializeInput,
): Promise<InitializeResult> {
  if (!Number.isInteger(input.amountSubunit) || input.amountSubunit <= 0) {
    throw new RangeError("amountSubunit must be a positive integer of kobo");
  }

  const data = await paystackFetch<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }>("/transaction/initialize", {
    method: "POST",
    body: {
      // Paystack documents `amount` as a string; an integer is accepted too,
      // but the string form is what the API reference specifies.
      amount: String(input.amountSubunit),
      email: input.email,
      currency: CURRENCY,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: {
        ...input.metadata,
        // Paystack reads `cancel_action` to point the "cancel" link on its
        // checkout somewhere useful. Without it the customer lands nowhere.
        ...(input.cancelUrl ? { cancel_action: input.cancelUrl } : {}),
      },
    },
  });

  return {
    authorizationUrl: data.authorization_url,
    accessCode: data.access_code,
    reference: data.reference,
  };
}

/* -------------------------------------------------------------------------- */
/*  Verify                                                                    */
/* -------------------------------------------------------------------------- */

export type VerifiedTransaction = {
  /** Paystack's status string: `success`, `failed`, `abandoned`, `pending`. */
  status: string;
  reference: string;
  /** Integer kobo, as actually charged. */
  amountSubunit: number;
  currency: string;
  /** Human-readable gateway message, e.g. "Successful", "Declined". */
  gatewayResponse: string | null;
  channel: string | null;
  paidAt: Date | null;
  providerTransactionId: string | null;
  customerEmail: string | null;
  /** The whole payload, retained for dispute resolution. */
  raw: Record<string, unknown>;
};

/**
 * Asks Paystack what actually happened.
 *
 * This is the only source of truth about a payment. The browser arriving at
 * our callback URL proves nothing — a customer can type that URL by hand with
 * any reference they like — so nothing is ever marked paid on the strength of
 * a redirect alone.
 */
export async function verifyTransaction(
  reference: string,
): Promise<VerifiedTransaction> {
  const data = await paystackFetch<Record<string, unknown>>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
    { method: "GET" },
  );

  const customer = data.customer as { email?: string } | undefined;
  const paidAt = typeof data.paid_at === "string" ? new Date(data.paid_at) : null;

  return {
    status: typeof data.status === "string" ? data.status : "unknown",
    reference: typeof data.reference === "string" ? data.reference : reference,
    amountSubunit: typeof data.amount === "number" ? data.amount : 0,
    currency: typeof data.currency === "string" ? data.currency : CURRENCY,
    gatewayResponse:
      typeof data.gateway_response === "string" ? data.gateway_response : null,
    channel: typeof data.channel === "string" ? data.channel : null,
    paidAt: paidAt && !Number.isNaN(paidAt.getTime()) ? paidAt : null,
    providerTransactionId:
      typeof data.id === "number" || typeof data.id === "string"
        ? String(data.id)
        : null,
    customerEmail: customer?.email ?? null,
    raw: data,
  };
}

/* -------------------------------------------------------------------------- */
/*  Webhook signature                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Validates the `x-paystack-signature` header.
 *
 * The signature is an HMAC-SHA512 of the *raw* request body keyed with the
 * secret key. It must be computed over the bytes exactly as received — any
 * parse-then-re-serialise round trip changes key order and whitespace, the
 * digest stops matching, and the webhook appears to fail at random.
 *
 * Compared with `timingSafeEqual`, not `===`. A webhook endpoint is a public
 * oracle, and `===` short-circuits on the first differing byte, which leaks
 * how much of a guessed signature was correct.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null | undefined,
): boolean {
  if (!signature) return false;

  let expected: string;

  try {
    expected = createHmac("sha512", readSecretKey())
      .update(rawBody, "utf8")
      .digest("hex");
  } catch {
    // Not configured — reject rather than accept.
    return false;
  }

  const received = Buffer.from(signature, "utf8");
  const computed = Buffer.from(expected, "utf8");

  // `timingSafeEqual` throws on a length mismatch, which would itself leak the
  // expected length. Check first and fail closed.
  if (received.length !== computed.length) return false;

  return timingSafeEqual(received, computed);
}
